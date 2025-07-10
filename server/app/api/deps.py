from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.config import settings
from app.db.session import AsyncSessionMaker
from app.models.mentor import Mentor, ModerationStatus
from app.models.auth import User
from app.core.security import verify_password

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    scheme_name="JWT"
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting database session"""
    async with AsyncSessionMaker() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_current_mentor(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Mentor:
    """
    Get current authenticated mentor from JWT token.
    Only approved mentors can access protected endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        mentor_id: str = payload.get("sub")
        if mentor_id is None:
            raise credentials_exception
        
        try:
            mentor_uuid = UUID(mentor_id)
        except ValueError:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    stmt = select(Mentor).where(Mentor.id == mentor_uuid)
    result = await db.execute(stmt)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
        
    if mentor.moderation_status != ModerationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mentor profile not approved"
        )
        
    return mentor

async def verify_admin(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> bool:
    """
    Admin verification using JWT token.
    This is separate from mentor authentication.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        role = payload.get("role")
        
        if not user_id or role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
            
        stmt = select(User).where(User.id == user_id, User.role == "admin")
        result = await db.execute(stmt)
        admin = result.scalar_one_or_none()
        
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
            
        return True
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials"
        )

async def get_optional_mentor(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Optional[Mentor]:
    """
    Similar to get_current_mentor but returns None if token is invalid.
    Used for endpoints that work both for authenticated and anonymous users.
    """
    try:
        return await get_current_mentor(db, token)
    except HTTPException:
        return None 