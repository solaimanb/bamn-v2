from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

# Configure SQLAlchemy logger
sql_logger = logging.getLogger('sqlalchemy.engine')
sql_logger.setLevel(getattr(logging, settings.SQL_LOG_LEVEL))

# Convert the DATABASE_URL to async format for psycopg3
async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,  # Verify connections before using from pool
    pool_size=settings.DB_POOL_SIZE,  # Maximum number of connections in pool
    max_overflow=settings.DB_MAX_OVERFLOW,  # Maximum connections beyond pool_size
    pool_timeout=settings.DB_POOL_TIMEOUT,  # Seconds to wait for available connection
    pool_recycle=settings.DB_POOL_RECYCLE,  # Recycle connections after this many seconds
    echo=False,
    future=True  # Enable SQLAlchemy 2.0 features in 1.4
)

AsyncSessionLocal = sessionmaker(
    bind=engine,  # Use bind instead of passing engine directly
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
    future=True  # Enable SQLAlchemy 2.0 features in 1.4
)
