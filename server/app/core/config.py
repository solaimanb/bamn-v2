from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, EmailStr, validator
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
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Admin
    ADMIN_EMAIL: EmailStr = "bamn@gmail.com"
    ADMIN_KEY: str = "@admin122"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Database Pool Settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30  # seconds
    DB_POOL_RECYCLE: int = 1800  # 30 minutes

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        if values.get("DATABASE_URL"):
            return values.get("DATABASE_URL")
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str):
            try:
                # Try to parse as JSON array first
                import json
                return json.loads(v)
            except json.JSONDecodeError:
                # Fall back to comma-separated string
                return [i.strip() for i in v.split(",")]
        return v
    
    # Frontend URLs
    CLIENT_BASE_URL: str = "" 
    
    # OAuth Settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    
    ORCID_CLIENT_ID: str = ""
    ORCID_CLIENT_SECRET: str = ""
    ORCID_REDIRECT_URI: str = ""

    @validator("GOOGLE_REDIRECT_URI", "ORCID_REDIRECT_URI", pre=True)
    def validate_redirect_uri(cls, v: str, values: Dict[str, Any]) -> str:
        if not v and values.get("CLIENT_BASE_URL"):
            provider = values.get("__field_name__", "").split('_')[0].lower()
            return f"{values.get('CLIENT_BASE_URL')}/auth/{provider}/callback"
        return v
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
