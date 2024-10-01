# import uuid
# from datetime import datetime
# from sqlalchemy import DECIMAL, Boolean, DateTime, ForeignKey, Integer, String
# from sqlalchemy.orm import Mapped, Relationship, mapped_column

# # Profile Progress Table
# class ProfileProgress(Base):
#     __tablename__ = 'profile_progress'

#     id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'))
#     date_logged: Mapped[DateTime] = mapped_column(DateTime, default=datetime.utcnow)
#     weight: Mapped[DECIMAL] = mapped_column(DECIMAL(5, 2))
#     calories_consumed: Mapped[int] = mapped_column(Integer)

#     profile = Relationship("Profile")

#     class Config:
#         orm_mode = True


# # Profile Goal Table
# class ProfileGoal(Base):
    __tablename__ = 'profile_goal'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    profile_id: Mapped[int] = mapped_column(Integer, ForeignKey('profile.id', ondelete='CASCADE'))
    goal_type: Mapped[str] = mapped_column(String(50))
    target_weight: Mapped[DECIMAL] = mapped_column(DECIMAL(5, 2))
    target_calories: Mapped[int] = mapped_column(Integer)
    start_date: Mapped[DateTime] = mapped_column(DateTime)
    end_date: Mapped[DateTime] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    profile = Relationship("Profile")

    class Config:
        orm_mode = True