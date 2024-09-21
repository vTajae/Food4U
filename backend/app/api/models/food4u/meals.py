import uuid
from datetime import datetime, timedelta
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, MetaData, String
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base


metadata = MetaData()



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