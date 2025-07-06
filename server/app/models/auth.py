from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base

class User(Base):
    """
    User model for administrators and staff members.
    This is separate from the Mentor model which is for academic mentors.
    """
    __tablename__ = "users"

    # Primary key
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    
    # Authentication fields
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    
    # User information
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)

    def __repr__(self):
        return f"<User {self.full_name} ({self.email})>"
