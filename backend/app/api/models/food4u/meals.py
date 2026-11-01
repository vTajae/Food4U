import uuid
from datetime import datetime
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base
# Meal Table
class Meal(Base):
    __tablename__ = 'meal'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    calories: Mapped[int] = mapped_column(Integer, nullable=True)
    cuisine: Mapped[str] = mapped_column(String(100))
    meal_type_id: Mapped[int] = mapped_column(Integer, ForeignKey('meal_type.id', ondelete='CASCADE'))

    meal_type = Relationship("MealType")
    components = Relationship("MealComponent", back_populates="meal", cascade="all, delete")

    class Config:
        orm_mode = True


# Meal Type Table
class MealType(Base):
    __tablename__ = 'meal_type'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meal_type_name: Mapped[str] = mapped_column(String(50))

    meals = Relationship("Meal", back_populates="meal_type")

    class Config:
        orm_mode = True


# Meal Component Table
class MealComponent(Base):
    __tablename__ = 'meal_component'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meal_id: Mapped[int] = mapped_column(Integer, ForeignKey('meal.id', ondelete='CASCADE'))
    component_name: Mapped[str] = mapped_column(String(100))
    portion_size: Mapped[DECIMAL] = mapped_column(DECIMAL(5, 2))

    meal = Relationship("Meal", back_populates="components")

    class Config:
        orm_mode = True


# Meal Diet Type Table
class MealDietType(Base):
    __tablename__ = 'meal_diet_type'

    meal_id: Mapped[int] = mapped_column(Integer, ForeignKey('meal.id', ondelete='CASCADE'), primary_key=True)
    diet_type_id: Mapped[int] = mapped_column(Integer, ForeignKey('diet_type.id', ondelete='CASCADE'), primary_key=True)

    meal = Relationship("Meal")
    diet_type = Relationship("DietType")

    class Config:
        orm_mode = True


# Diet Type Table (Standard diet types)
class DietType(Base):
    __tablename__ = 'diet_type'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    diet_name: Mapped[str] = mapped_column(String(100), unique=True)  # e.g., "Vegan", "Vegetarian"
    description: Mapped[str] = mapped_column(String(255))

    profile_diets = Relationship("ProfileDiet", back_populates="diet_type", cascade="all, delete")
    meal_diet_types = Relationship("MealDietType", back_populates="diet_type", cascade="all, delete")

    class Config:
        orm_mode = True