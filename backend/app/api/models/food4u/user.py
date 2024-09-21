import uuid
from datetime import datetime, timedelta
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, MetaData, String
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base
# Import DietType from the other file

from app.api.models.food4u.meals import Meal
from app.api.models.food4u.diets import DietType

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
