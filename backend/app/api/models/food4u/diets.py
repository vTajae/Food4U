
import uuid
from datetime import datetime, timedelta
from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, MetaData, String
from sqlalchemy.orm import Mapped, Relationship, mapped_column
from app.config.database import Base


metadata = MetaData()



# Diet Type Table (Standard diet types)


class DietType(Base):
    __tablename__ = 'diet_type'

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    diet_name: Mapped[str] = mapped_column(
        String(100), unique=True)  # e.g., "Vegan", "Vegetarian"
    description: Mapped[str] = mapped_column(String(255))
    
    
    profile_diets = Relationship("ProfileDiet", back_populates="diet_type")

    class Config:
        orm_mode = True

# Profile Diet Table (Links profiles with diet types)
