from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.mentor import Mentor
from app.models.auth import User
from app.core.security import verify_password

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    scheme_name="JWT"
)

def get_db() -> Generator:
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_mentor(
    db: Session = Depends(get_db),
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
    except JWTError:
        raise credentials_exception
    
    stmt = select(Mentor).where(Mentor.id == mentor_id)
    result = db.execute(stmt)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise credentials_exception
    if not mentor.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mentor profile not approved"
        )
    return mentor

def verify_admin(
    db: Session = Depends(get_db),
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
        result = db.execute(stmt)
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

def get_optional_mentor(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Optional[Mentor]:
    """
    Similar to get_current_mentor but returns None if token is invalid.
    Used for endpoints that work both for authenticated and anonymous users.
    """
    try:
        return get_current_mentor(db, token)
    except HTTPException:
        return None 