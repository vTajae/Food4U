from sqlalchemy import Column, String, Integer, DateTime, UniqueConstraint, func
from app.config.database import Base  # Use your Base defined in your database setup


class RateLimit(Base):
    __tablename__ = 'rate_limits'
    
    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, nullable=False, unique=True)  # Add unique=True to enforce uniqueness
    request_count = Column(Integer, default=0)
    last_request = Column(DateTime(timezone=True), nullable=False)
    
    class Config:
        orm_mode = True
