
import uuid
from datetime import datetime, timedelta
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, MetaData, String
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base

metadata = MetaData()


# Profile Vitals Table
class ProfileVitals(Base):
    __tablename__ = 'profile_vitals'

    profile_id: Mapped[str] = mapped_column(String, ForeignKey(
        'profile.id', ondelete='CASCADE'), primary_key=True)
    height: Mapped[float] = mapped_column(DECIMAL(5, 2))
    weight: Mapped[float] = mapped_column(DECIMAL(5, 2))
    blood_pressure: Mapped[str] = mapped_column(String(20))
    bmi: Mapped[float] = mapped_column(DECIMAL(4, 2))
    blood_oxygen: Mapped[float] = mapped_column(DECIMAL(4, 2))

    profile = Relationship("Profile", back_populates="vitals")

    class Config:
        orm_mode = True

# ICD Codes Table (Medical condition codes as per standardized ICD system)


class ICDCodes(Base):
    __tablename__ = 'icd_codes'

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    description: Mapped[str] = mapped_column(String(255))
    is_allergy: Mapped[bool] = mapped_column(Boolean, default=False)  # Flag to differentiate allergies

    class Config:
        orm_mode = True

# Patient Medical History Table

class PatientMedicalHistory(Base):
    __tablename__ = 'profile_medical_history'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    profile_id: Mapped[str] = mapped_column(
        String, ForeignKey('profile.id', ondelete='CASCADE'))
    icd_code: Mapped[str] = mapped_column(
        String(10), ForeignKey('icd_codes.code', ondelete='RESTRICT'))
    
    profile = Relationship("Profile", back_populates="medical_history")
    icd_codes = Relationship("ICDCodes")

    class Config:
        orm_mode = True