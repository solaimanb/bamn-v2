from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    full_name: str = Field(..., description="User full name")

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        description="User password (min 8 characters)",
        example="strongpassword123"
    )
    role: Optional[UserRole] = Field(
        default=UserRole.MENTOR,
        description="User role (admin/mentor)"
    )

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class UserResponse(UserBase):
    id: UUID4
    role: UserRole
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    """OAuth2 compatible token schema"""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """JWT token payload schema"""
    sub: str  # mentor ID
    exp: Optional[int] = None  # expiration time
