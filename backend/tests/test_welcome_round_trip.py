"""Welcome round-trip at the public-id dependency seam, without a database."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.dependencies.food4u_dep import (
    get_medical_service,
    get_preference_service,
    get_profile_service,
)
from app.api.dependencies.user_dep import get_user_service
from app.api.routers import user_routes
from test_public_id_auth import FakeUserService, make_token


TIMESTAMP = "2026-10-11T00:00:00Z"


class FakeProfileService:
    def __init__(self):
        self.profiles = {}
        self.calls = []

    async def get_all_profile_info(self, profile_id):
        self.calls.append(profile_id)
        return self.profiles[profile_id]


class FakeMedicalService:
    def __init__(self, profile_service):
        self.profile_service = profile_service
        self.calls = []

    async def post_medical(self, profile_id, query_key, suggestions):
        self.calls.append((profile_id, query_key, suggestions))
        for suggestion in suggestions:
            self.profile_service.profiles[profile_id]["medical_history"].append({
                "id": 1,
                "icd_details": {"code": suggestion.code, "description": suggestion.name},
                "date_diagnosed": None,
                "notes": None,
            })


class FakePreferenceService:
    def __init__(self, profile_service):
        self.profile_service = profile_service
        self.calls = []

    async def post_preferences(self, profile_id, question_id, query_key, suggestions):
        self.calls.append((profile_id, question_id, query_key, suggestions))
        for suggestion in suggestions:
            self.profile_service.profiles[profile_id]["attributes"].append({
                "id": 1,
                "attribute_category": "preferences",
                "attribute_name": suggestion.name,
                "attribute_value": "like",
                "notes": None,
                "created_at": TIMESTAMP,
                "updated_at": TIMESTAMP,
            })


def test_created_profile_receives_welcome_and_reads_it_back_by_public_id():
    public_id = "5f1c3a2e-0000-4000-8000-000000000004"
    user_service = FakeUserService()
    # A signed int64 above JS's safe-integer range; no DB-default id generation
    # or frontend numeric precision is claimed by this dependency-seam test.
    user_service.next_id = 2**53 + 1
    profile_service = FakeProfileService()
    medical_service = FakeMedicalService(profile_service)
    preference_service = FakePreferenceService(profile_service)

    app = FastAPI()
    app.include_router(user_routes.router)
    app.dependency_overrides[get_user_service] = lambda: user_service
    app.dependency_overrides[get_profile_service] = lambda: profile_service
    app.dependency_overrides[get_medical_service] = lambda: medical_service
    app.dependency_overrides[get_preference_service] = lambda: preference_service
    headers = {"Authorization": f"Bearer {make_token({'user_id': public_id})}"}
    medical_answer = {"name": "Essential hypertension", "code": "I10"}
    preference_answer = {"name": "Italian"}

    with TestClient(app) as client:
        created = client.post("/profile", headers=headers)
        assert created.status_code == 200, created.text
        assert created.json()["public_id"] == public_id
        internal_id = user_service.profiles[public_id].id
        assert created.json()["id"] == internal_id == 2**53 + 1
        assert isinstance(created.json()["id"], int)

        profile_service.profiles[internal_id] = {
            "id": internal_id,
            "age": None,
            "ethnicity": None,
            "location": None,
            "created_at": TIMESTAMP,
            "updated_at": TIMESTAMP,
            "attributes": [],
            "diets": [],
            "medical_history": [],
        }
        submitted = client.post("/welcome", headers=headers, json={
            "submission": [
                {"questionId": 1, "queryKey": "icd10cm", "answers": [medical_answer]},
                {"questionId": 5, "queryKey": "cuisines", "answers": [preference_answer]},
            ],
        })
        assert submitted.status_code == 200, submitted.text
        assert submitted.json() == {
            "status": "success", "message": "Data processed successfully",
        }
        assert len(medical_service.calls) == 1
        medical_id, medical_key, medical_suggestions = medical_service.calls[0]
        assert (medical_id, medical_key) == (internal_id, "icd10cm")
        assert [s.model_dump(exclude_none=True) for s in medical_suggestions] == [medical_answer]
        assert len(preference_service.calls) == 1
        preference_id, question_id, preference_key, preference_suggestions = preference_service.calls[0]
        assert (preference_id, question_id, preference_key) == (internal_id, 5, "cuisines")
        assert [s.model_dump(exclude_none=True) for s in preference_suggestions] == [preference_answer]

        fetched = client.get("/user/profile", headers=headers)
        assert fetched.status_code == 200, fetched.text
        assert profile_service.calls == [internal_id]
        assert fetched.json() == profile_service.profiles[internal_id]
        assert fetched.json()["medical_history"][0]["icd_details"] == {
            "code": "I10", "description": "Essential hypertension",
        }
        assert fetched.json()["attributes"][0]["attribute_name"] == "Italian"
        assert fetched.json()["attributes"][0]["attribute_value"] == "like"
