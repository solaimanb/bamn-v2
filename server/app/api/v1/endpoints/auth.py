"""
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

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from datetime import timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password, get_password_hash, validate_password
from app.core.config import settings
from app.schemas.mentor import MentorCreate, OAuthMentorCreate, MentorResponse
from app.models.mentor import Mentor
from app.models.auth import User
from app.models.enums import AuthProvider, ModerationStatus
from app.api import deps

router = APIRouter(
    tags=["Authentication"],
    prefix="/auth"
)

@router.post(
    "/login",
    summary="Login",
    description="Login with email and password to get access token. Works for both mentors and admins."
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """OAuth2 compatible token login with email/password"""
    # First try admin login
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user and verify_password(form_data.password, user.hashed_password):
        return {
            "access_token": create_access_token(
                subject=str(user.id),
                role=user.role,
                user_data={
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role
                },
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            ),
            "token_type": "bearer"
        }
    
    # If not admin, try mentor login
    query = select(Mentor).where(Mentor.email == form_data.username)
    result = await db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor or \
       mentor.auth_provider != AuthProvider.EMAIL or \
       not verify_password(form_data.password, mentor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if mentor.moderation_status != ModerationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not approved. Please wait for administrator verification."
        )
    
    return {
        "access_token": create_access_token(
            subject=str(mentor.id),
            role="mentor",
            user_data={
                "id": str(mentor.id),
                "email": mentor.email,
                "full_name": mentor.full_name,
                "role": "mentor",
                "current_role": mentor.current_role,
                "institution": mentor.institution,
                "department": mentor.department,
                "degrees": mentor.degrees,
                "research_interests": mentor.research_interests,
                "continent": mentor.continent,
                "country": mentor.country,
                "city": mentor.city,
                "latitude": mentor.latitude,
                "longitude": mentor.longitude,
                "profile_picture_url": mentor.profile_picture_url,
                "linkedin_url": mentor.linkedin_url,
                "auth_provider": mentor.auth_provider.value,
                "moderation_status": mentor.moderation_status.value,
                "created_at": mentor.created_at.isoformat() if mentor.created_at else None,
                "updated_at": mentor.updated_at.isoformat() if mentor.updated_at else None
            },
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        ),
        "token_type": "bearer"
    }

@router.post(
    "/register",
    response_model=MentorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Mentor",
    description="Register a new mentor account"
)
async def register_mentor(
    mentor_in: MentorCreate,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """Register a new mentor"""
    query = select(Mentor).where(Mentor.email == mentor_in.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if not validate_password(mentor_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain at least one number and one special character"
        )

    mentor = Mentor(
        **mentor_in.model_dump(exclude={"password"}),
        hashed_password=get_password_hash(mentor_in.password),
        auth_provider=AuthProvider.EMAIL,
        moderation_status=ModerationStatus.PENDING
    )
    
    db.add(mentor)
    await db.commit()
    await db.refresh(mentor)
    
    return mentor

@router.post(
    "/oauth/register",
    response_model=MentorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register OAuth Mentor",
    description="Register a new mentor account using OAuth (Google or ORCID)"
)
async def register_oauth_mentor(
    mentor_in: OAuthMentorCreate,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """Register a new mentor with OAuth"""
    query = select(Mentor).where(Mentor.email == mentor_in.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if mentor_in.auth_provider == AuthProvider.GOOGLE:
        query = select(Mentor).where(Mentor.google_id == mentor_in.google_id)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account already registered"
            )
    
    if mentor_in.auth_provider == AuthProvider.ORCID:
        query = select(Mentor).where(Mentor.orcid_id == mentor_in.orcid_id)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ORCID account already registered"
            )
    
    mentor = Mentor(
        **mentor_in.model_dump(),
        moderation_status=ModerationStatus.PENDING
    )
    
    db.add(mentor)
    await db.commit()
    await db.refresh(mentor)
    
    return mentor

@router.post(
    "/oauth/google/login",
    summary="Google OAuth Login",
    description="Login with Google OAuth token"
)
async def google_login(
    google_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """Login with Google OAuth"""
    # TODO: Implement Google token verification
    # For now, just check if mentor exists with given Google ID
    query = select(Mentor).where(
        Mentor.auth_provider == AuthProvider.GOOGLE,
        Mentor.google_id == google_token
    )
    result = await db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account not registered"
        )
    
    if mentor.moderation_status != ModerationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not approved. Please wait for administrator verification."
        )
    
    return {
        "access_token": create_access_token(
            subject=str(mentor.id),
            role="mentor",
            user_data={
                "id": str(mentor.id),
                "email": mentor.email,
                "full_name": mentor.full_name,
                "role": "mentor",
                "current_role": mentor.current_role,
                "institution": mentor.institution,
                "department": mentor.department,
                "degrees": mentor.degrees,
                "research_interests": mentor.research_interests,
                "continent": mentor.continent,
                "country": mentor.country,
                "city": mentor.city,
                "latitude": mentor.latitude,
                "longitude": mentor.longitude,
                "profile_picture_url": mentor.profile_picture_url,
                "linkedin_url": mentor.linkedin_url,
                "auth_provider": mentor.auth_provider.value,
                "moderation_status": mentor.moderation_status.value,
                "created_at": mentor.created_at.isoformat() if mentor.created_at else None,
                "updated_at": mentor.updated_at.isoformat() if mentor.updated_at else None
            },
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        ),
        "token_type": "bearer"
    }

@router.post(
    "/oauth/orcid/login",
    summary="ORCID OAuth Login",
    description="Login with ORCID OAuth token"
)
def orcid_login(
    orcid_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """Login with ORCID OAuth"""
    # TODO: Implement ORCID token verification
    # For now, just check if mentor exists with given ORCID ID
    query = select(Mentor).where(
        Mentor.auth_provider == AuthProvider.ORCID,
        Mentor.orcid_id == orcid_token
    )
    result = db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ORCID account not registered"
        )
    
    if mentor.moderation_status != ModerationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not approved. Please wait for administrator verification."
        )
    
    return {
        "access_token": create_access_token(
            subject=str(mentor.id),
            role="mentor",
            user_data={
                "id": str(mentor.id),
                "email": mentor.email,
                "full_name": mentor.full_name,
                "role": "mentor",
                "current_role": mentor.current_role,
                "institution": mentor.institution,
                "department": mentor.department,
                "degrees": mentor.degrees,
                "research_interests": mentor.research_interests,
                "continent": mentor.continent,
                "country": mentor.country,
                "city": mentor.city,
                "latitude": mentor.latitude,
                "longitude": mentor.longitude,
                "profile_picture_url": mentor.profile_picture_url,
                "linkedin_url": mentor.linkedin_url,
                "auth_provider": mentor.auth_provider.value,
                "moderation_status": mentor.moderation_status.value,
                "created_at": mentor.created_at.isoformat() if mentor.created_at else None,
                "updated_at": mentor.updated_at.isoformat() if mentor.updated_at else None
            },
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        ),
        "token_type": "bearer"
    }
