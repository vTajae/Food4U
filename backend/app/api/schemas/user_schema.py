import uuid
from datetime import datetime, timedelta
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, MetaData, String
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base

metadata = MetaData()

# Profile Table (Basic profile information)


class Profile(Base):
    __tablename__ = 'profile'

    id: Mapped[str] = mapped_column(String, primary_key=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    ethnicity: Mapped[str] = mapped_column(String(30), nullable=True, default=None)

    vitals = Relationship(
        "ProfileVitals", back_populates="profile", uselist=False, cascade="all, delete")
    attributes = Relationship(
        "ProfileAttribute", back_populates="profile", cascade="all, delete")
    medical_history = Relationship(
        "PatientMedicalHistory", back_populates="profile", cascade="all, delete")
    diets = Relationship(
        "ProfileDiet", back_populates="profile", cascade="all, delete")
    meal_preferences = Relationship(
        "ProfileMealPreferences", back_populates="profile", cascade="all, delete")
    preferences = Relationship(
        "ProfilePreference", back_populates="profile", cascade="all, delete")

    def __repr__(self):
        return f"<User(id={self.id}...)>"

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True

# Patient Medical History Table


class PatientMedicalHistory(Base):
    __tablename__ = 'patient_medical_history'

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

# Profile Attributes Table (General attributes, including dietary and medical)


class ProfileAttribute(Base):
    __tablename__ = 'profile_attribute'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    profile_id: Mapped[str] = mapped_column(
        String, ForeignKey('profile.id', ondelete='CASCADE'))
    # e.g., "Allergy", "Condition", "Diet", etc.
    attribute_category: Mapped[str] = mapped_column(String(50))
    attribute_name: Mapped[str] = mapped_column(
        String(100))  # e.g., "Peanuts", "Vegan", "Diabetes"
    # Example: "Allergy", "180cm", etc.
    attribute_value: Mapped[str] = mapped_column(String(255))
    is_allergy: Mapped[bool] = mapped_column(Boolean, default=False)
    is_medical_condition: Mapped[bool] = mapped_column(Boolean, default=False)

    profile = Relationship("Profile", back_populates="attributes")

    class Config:
        orm_mode = True

# Diet Type Table (Standard diet types)


class DietType(Base):
    __tablename__ = 'diet_type'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    diet_name: Mapped[str] = mapped_column(
        String(100), unique=True)  # e.g., "Vegan", "Vegetarian"
    description: Mapped[str] = mapped_column(String(255))

    class Config:
        orm_mode = True

# Profile Diet Table (Links profiles with diet types)


class ProfileDiet(Base):
    __tablename__ = 'profile_diet'

    profile_id: Mapped[str] = mapped_column(String, ForeignKey(
        'profile.id', ondelete='CASCADE'), primary_key=True)
    diet_type_id: Mapped[int] = mapped_column(Integer, ForeignKey(
        'diet_type.id', ondelete='CASCADE'), primary_key=True)

    profile = Relationship("Profile", back_populates="diets")
    diet_type = Relationship("DietType")

    class Config:
        orm_mode = True

# Meal Table (Contains meal information and allergens)


class Meal(Base):
    __tablename__ = 'meal'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(String(255))
    calories: Mapped[int] = mapped_column(Integer)
    allergens: Mapped[str] = mapped_column(String(255))  # e.g., "Milk, Nuts"

    components = Relationship(
        "MealComponent", back_populates="meal", cascade="all, delete")
    meal_diet_types = Relationship(
        "MealDietType", back_populates="meal", cascade="all, delete")

    class Config:
        orm_mode = True

# Meal Type Table (For categorizing meals into types like Breakfast, Lunch, etc.)


class MealType(Base):
    __tablename__ = 'meal_type'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    meal_type_name: Mapped[str] = mapped_column(
        String(50))  # e.g., "Breakfast", "Lunch"

    class Config:
        orm_mode = True

# Meal Component Table (Stores meal components like ingredients)


class MealComponent(Base):
    __tablename__ = 'meal_component'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    meal_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('meal.id', ondelete='CASCADE'))
    # e.g., "Chicken", "Rice", etc.
    component_name: Mapped[str] = mapped_column(String(100))
    portion_size: Mapped[float] = mapped_column(DECIMAL(5, 2))

    meal = Relationship("Meal", back_populates="components")

    class Config:
        orm_mode = True

# Meal Diet Type Table (Links meals with applicable diet types)


class MealDietType(Base):
    __tablename__ = 'meal_diet_type'

    meal_id: Mapped[int] = mapped_column(Integer, ForeignKey(
        'meal.id', ondelete='CASCADE'), primary_key=True)
    diet_type_id: Mapped[int] = mapped_column(Integer, ForeignKey(
        'diet_type.id', ondelete='CASCADE'), primary_key=True)

    meal = Relationship("Meal", back_populates="meal_diet_types")
    diet_type = Relationship("DietType")

    class Config:
        orm_mode = True

# Profile Meal Preferences Table (User likes/dislikes meals)


class ProfileMealPreferences(Base):
    __tablename__ = 'profile_meal_preferences'

    profile_id: Mapped[str] = mapped_column(String, ForeignKey(
        'profile.id', ondelete='CASCADE'), primary_key=True)
    meal_id: Mapped[int] = mapped_column(Integer, ForeignKey(
        'meal.id', ondelete='CASCADE'), primary_key=True)
    liked: Mapped[bool] = mapped_column(Boolean, default=False)
    disliked: Mapped[bool] = mapped_column(Boolean, default=False)

    profile = Relationship("Profile", back_populates="meal_preferences")
    meal = Relationship("Meal")

    class Config:
        orm_mode = True

# Profile Preferences Table (For cuisine and meal type preferences)


class ProfilePreference(Base):
    __tablename__ = 'profile_preference'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    profile_id: Mapped[str] = mapped_column(
        String, ForeignKey('profile.id', ondelete='CASCADE'))
    meal_type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('meal_type.id', ondelete='CASCADE'))
    cuisine: Mapped[str] = mapped_column(
        String(100))  # e.g., "Italian", "Mexican"

    profile = Relationship("Profile", back_populates="preferences")
    meal_type = Relationship("MealType")

    class Config:
        orm_mode = True
