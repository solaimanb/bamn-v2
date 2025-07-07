from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
import logging

sql_logger = logging.getLogger('sqlalchemy.engine')
sql_logger.setLevel(getattr(logging, settings.SQL_LOG_LEVEL))

# Use asyncpg driver for PostgreSQL
async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
    pool_size=20, 
    max_overflow=10, 
    pool_timeout=30,
    pool_recycle=1800, 
    echo=False,
    future=True 
)

AsyncSessionMaker = async_sessionmaker(
    engine,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncSession:
    """Dependency for getting async database session"""
    async with AsyncSessionMaker() as session:
        try:
            yield session
        finally:
            await session.close()
