from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

# Configure SQLAlchemy logger
sql_logger = logging.getLogger('sqlalchemy.engine')
sql_logger.setLevel(getattr(logging, settings.SQL_LOG_LEVEL))

# Convert the DATABASE_URL to async format for psycopg3
async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg_sa://")

engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
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
