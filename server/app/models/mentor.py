from sqlalchemy import Column, String, Float, DateTime, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import logging
from typing import Optional

from app.models.base import Base
from app.models.enums import ModerationStatus, AuthProvider

# Setup basic logging
logger = logging.getLogger(__name__)

class Mentor(Base):
    """
    Mentor model representing academic mentors in the BAMN platform.
    This is the primary model as the platform only requires mentor accounts.
    """
    __tablename__ = "mentors"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Authentication fields
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    auth_provider = Column(
        Enum(AuthProvider),
        nullable=False,
        default=AuthProvider.EMAIL
    )
    orcid_id = Column(String, unique=True, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    
    # Basic profile information
    full_name = Column(String, nullable=False)
    profile_picture_url = Column(String, nullable=True)
    current_role = Column(String, nullable=False)
    
    # Academic information
    institution = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False)
    degrees = Column(ARRAY(String), nullable=False)  # ["Ph.D. in Physics, MIT, 2020", ...]
    research_interests = Column(ARRAY(String), nullable=False, index=True)  # For tag-based search
    
    # Location for globe visualization
    continent = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)  # For map display
    longitude = Column(Float, nullable=False)  # For map display
    
    # Contact information
    linkedin_url = Column(String, nullable=True)
    
    # Moderation and timestamps
    moderation_status = Column(
        Enum(ModerationStatus),
        nullable=False,
        default=ModerationStatus.PENDING,
        index=True
    )
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        try:
            super().__init__(**kwargs)
            logger.info(f"Created mentor {self.email}")
        except Exception as e:
            logger.error(f"Create mentor failed - {self.email} - {str(e)}")
            raise

    def update(self, **kwargs):
        try:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    setattr(self, key, value)
            logger.info(f"Updated mentor {self.email}")
        except Exception as e:
            logger.error(f"Update mentor failed - {self.email} - {str(e)}")
            raise

    def __repr__(self):
        return f"<Mentor {self.full_name} ({self.email})>"

    @property
    def is_approved(self):
        """Helper to check if mentor profile is approved"""
        return self.moderation_status == ModerationStatus.APPROVED 