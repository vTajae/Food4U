from typing import Optional
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base
from app.api.models.food4u.meals import Meal, MealType


# Patient Medical History Table
class PatientMedicalHistory(Base):
    __tablename__ = 'patient_medical_history'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'))
    icd_code: Mapped[str] = mapped_column(String(10), ForeignKey('icd_codes.code', ondelete='RESTRICT'))
    date_diagnosed: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    profile = Relationship("Profile", back_populates="medical_history")

    class Config:
        orm_mode = True


# ICD Codes Table
class ICDCodes(Base):
    __tablename__ = 'icd_codes'

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    description: Mapped[str] = mapped_column(String(255))

    class Config:
        orm_mode = True


# Allergen Table
class Allergen(Base):
    __tablename__ = 'allergen'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    allergen_name: Mapped[str] = mapped_column(String(255))
    common_name: Mapped[str] = mapped_column(String(255))
    allergenicity: Mapped[str] = mapped_column(String(50))
    source: Mapped[str] = mapped_column(String(255))
    protein_sequence: Mapped[str] = mapped_column(Text)
    accession_number: Mapped[str] = mapped_column(String(50))
    species: Mapped[str] = mapped_column(String(255))

    class Config:
        orm_mode = True


# Intolerance Table
class IntoleranceType(Base):
    __tablename__ = 'intolerance'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    intolerance_name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(255))

    class Config:
        orm_mode = True

