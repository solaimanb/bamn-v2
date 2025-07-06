from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

# Configure SQLAlchemy logger
sql_logger = logging.getLogger('sqlalchemy.engine')
sql_logger.setLevel(getattr(logging, settings.SQL_LOG_LEVEL))

# Convert the DATABASE_URL to async format (postgresql:// -> postgresql+asyncpg://)
async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
    echo=False
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
