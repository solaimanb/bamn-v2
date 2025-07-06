from enum import Enum

class ModerationStatus(str, Enum):
    """Moderation status for mentor profiles"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class AuthProvider(str, Enum):
    """Authentication providers for mentor login"""
    EMAIL = "email"
    GOOGLE = "google"
    ORCID = "orcid"