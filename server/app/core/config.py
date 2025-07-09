from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, EmailStr, field_validator, Field, ValidationInfo
from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "BAMN API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    SQL_LOG_LEVEL: str = "WARNING" 
    LOG_FORMAT: str = "%(levelname)s: %(message)s"
    LOG_DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
    
    # Security
    SECRET_KEY: str = Field(..., description="Secret key for JWT token generation")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Admin
    ADMIN_EMAIL: EmailStr
    ADMIN_KEY: str
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Database Pool Settings
    DB_POOL_SIZE: int = Field(default=20, gt=0)
    DB_MAX_OVERFLOW: int = Field(default=10, ge=0)
    DB_POOL_TIMEOUT: int = Field(default=30, gt=0)  # seconds
    DB_POOL_RECYCLE: int = Field(default=1800, gt=0)  # 30 minutes

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if isinstance(v, str):
            return v
        data = info.data
        if data.get("DATABASE_URL"):
            return data.get("DATABASE_URL")
        return f"postgresql://{data.get('POSTGRES_USER')}:{data.get('POSTGRES_PASSWORD')}@{data.get('POSTGRES_SERVER')}/{data.get('POSTGRES_DB')}"
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = Field(
        default=[],
        description="List of origins that are allowed to make cross-site HTTP requests. Can be a list or comma-separated string."
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            try:
                # Try to parse as JSON array first
                import json
                urls = json.loads(v)
            except json.JSONDecodeError:
                # Fall back to comma-separated string
                urls = [i.strip() for i in v.split(",") if i.strip()]
            return urls
        return v
    
    # Frontend URLs
    CLIENT_BASE_URL: str = Field("", description="Base URL for the frontend application")
    
    # OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = ""
    GOOGLE_CLIENT_SECRET: Optional[str] = ""
    GOOGLE_REDIRECT_URI: Optional[str] = ""
    
    ORCID_CLIENT_ID: Optional[str] = ""
    ORCID_CLIENT_SECRET: Optional[str] = ""
    ORCID_REDIRECT_URI: Optional[str] = ""

    @field_validator("GOOGLE_REDIRECT_URI", "ORCID_REDIRECT_URI", mode="before")
    @classmethod
    def validate_redirect_uri(cls, v: Optional[str], info: ValidationInfo) -> Optional[str]:
        if not v:
            data = info.data
            if data.get("CLIENT_BASE_URL"):
                provider = info.field_name.split('_')[0].lower()
                return f"{data.get('CLIENT_BASE_URL')}/auth/{provider}/callback"
        return v

    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }

settings = Settings()
