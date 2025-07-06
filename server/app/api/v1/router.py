from fastapi import APIRouter
from app.api.v1.endpoints import mentors, auth, admin

# API section descriptions
tags_metadata = [
    {
        "name": "Authentication",
        "description": """
        Authentication endpoints for mentor registration and login.
        
        Registration Flow:
        1. Register using either:
           - Email/password (/register)
           - OAuth provider (/oauth/register)
        2. Wait for admin approval
        3. Once approved, login using the same method used for registration:
           - Email/password login (/login)
           - Google OAuth login (/oauth/google/login)
           - ORCID OAuth login (/oauth/orcid/login)
        """
    },
    {
        "name": "Mentors",
        "description": """
        Public endpoints for accessing mentor profiles.
        No authentication required for read operations.
        Profile updates require authentication.
        """
    },
    {
        "name": "Admin",
        "description": """
        Administrative endpoints for managing mentor accounts.
        Requires admin authentication via API key.
        """
    }
]

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(mentors.router)
api_router.include_router(admin.router)