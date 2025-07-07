from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

# Configure SQLAlchemy logger
sql_logger = logging.getLogger('sqlalchemy.engine')
sql_logger.setLevel(getattr(logging, settings.SQL_LOG_LEVEL))

# Convert the DATABASE_URL to async format for asyncpg
async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,  # Verify connections before using from pool
    pool_size=20,  # Maximum number of connections in pool
    max_overflow=10,  # Maximum number of connections that can be created beyond pool_size
    pool_timeout=30,  # Seconds to wait for available connection
    pool_recycle=1800,  # Recycle connections after 30 minutes
    echo=False,
    future=True  # Enable SQLAlchemy 2.0 features
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)
