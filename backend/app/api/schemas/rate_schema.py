from sqlalchemy import Column, String, Integer, DateTime, func
from app.config.database import Base  # Use your Base defined in your database setup

class RateLimit(Base):
    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, index=True)  # Could be IP or user ID
    request_count = Column(Integer, default=0)
    last_request = Column(DateTime(timezone=True), server_default=func.now())
