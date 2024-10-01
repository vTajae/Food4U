from typing import Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base
from app.api.models.food4u.meals import Meal
from app.api.models.food4u.meals import DietType


from sqlalchemy import DateTime
from datetime import datetime, timezone

class Profile(Base):
    __tablename__ = 'profile'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    ethnicity: Mapped[str] = mapped_column(String(100), nullable=True, default=None)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))  # Use timezone-aware datetime
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # Use timezone-aware datetime

    # vitals = Relationship("ProfileVitals", back_populates="profile", uselist=False, cascade="all, delete")
    attributes = Relationship("ProfileAttribute", back_populates="profile", cascade="all, delete")
    medical_history = Relationship("PatientMedicalHistory", back_populates="profile", cascade="all, delete")
    diets = Relationship("ProfileDiet", back_populates="profile", cascade="all, delete")
    # meal_preferences = Relationship("ProfileMealPreferences", back_populates="profile", cascade="all, delete")

    class Config:
        orm_mode = True


# # Profile Vitals Table (Detailed health information)
# class ProfileVitals(Base):
#     __tablename__ = 'profile_vitals'

#     profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'), primary_key=True)
#     height: Mapped[DECIMAL] = mapped_column(DECIMAL(5, 2))
#     weight: Mapped[DECIMAL] = mapped_column(DECIMAL(5, 2))
#     blood_pressure: Mapped[str] = mapped_column(String(20))
#     bmi: Mapped[DECIMAL] = mapped_column(DECIMAL(4, 2))
#     blood_oxygen: Mapped[DECIMAL] = mapped_column(DECIMAL(4, 2))
#     calories_target: Mapped[int] = mapped_column(Integer)
#     weight_goal: Mapped[DECIMAL] = mapped_column(DECIMAL(5, 2))
#     calories_consumed: Mapped[int] = mapped_column(Integer)
#     goal_start_date: Mapped[datetime] = mapped_column(DateTime)
#     goal_end_date: Mapped[datetime] = mapped_column(DateTime)

#     profile = Relationship("Profile", back_populates="vitals")

#     class Config:
#         orm_mode = True


class ProfileAttribute(Base):
    __tablename__ = 'profile_attribute'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)  # AttributeID
    profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'), nullable=False)  # ProfileID
    attribute_category: Mapped[str] = mapped_column(String(50))  # e.g., "Allergy", "Diet", etc.
    attribute_name: Mapped[str] = mapped_column(String(100))  # e.g., "Peanuts", "Vegan"
    attribute_value: Mapped[str] = mapped_column(String(255))  # e.g., "Severe", "180cm", etc.
    notes: Mapped[Optional[str]] = mapped_column(Text)  # Optional field for additional details
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))  # CreatedAt
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))  # UpdatedAt
    updated_by: Mapped[Optional[str]] = mapped_column(String(255))  # UpdatedBy (new column)

    profile = Relationship("Profile", back_populates="attributes")

    class Config:
        orm_mode = True



# Profile Diet Table (Links profiles with diet types)
class ProfileDiet(Base):
    __tablename__ = 'profile_diet'

    profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'), primary_key=True)
    diet_type_id: Mapped[int] = mapped_column(Integer, ForeignKey('diet_type.id', ondelete='CASCADE'), primary_key=True)

    profile = Relationship("Profile", back_populates="diets")
    diet_type = Relationship("DietType")

    class Config:
        orm_mode = True


# # Profile Meal Preferences Table (User likes/dislikes meals)
# class ProfileMealPreferences(Base):
#     __tablename__ = 'profile_meal_preferences'

#     profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'), primary_key=True)
#     meal_id: Mapped[int] = mapped_column(Integer, ForeignKey('meal.id', ondelete='CASCADE'), primary_key=True)
#     liked: Mapped[bool] = mapped_column(Boolean, default=False)
#     disliked: Mapped[bool] = mapped_column(Boolean, default=False)

#     profile = Relationship("Profile", back_populates="meal_preferences")
#     meal = Relationship("Meal")

#     class Config:
#         orm_mode = True


