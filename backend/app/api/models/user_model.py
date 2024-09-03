import uuid
from datetime import datetime, timedelta
from sqlalchemy import DateTime, MetaData, String
from sqlalchemy.orm import Mapped, mapped_column
from app.config.database import Base

metadata = MetaData()

class User(Base):
    __tablename__ = 'user'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.utcnow() + timedelta(hours=3))
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}...)>"
