from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.models.base import Base
from app.core.config import settings
from app.api.v1.router import api_router, tags_metadata
from app.db.session import engine
from contextlib import asynccontextmanager
import logging
import time
from typing import Callable

for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    force=True
)

default_level = "WARNING" if settings.ENVIRONMENT == "production" else "INFO"
loggers_config = {
    'sqlalchemy.engine': settings.SQL_LOG_LEVEL,
    'passlib': default_level,
    'uvicorn.error': default_level,
    'uvicorn.access': 'WARNING',
    'fastapi': default_level
}

for logger_name, level in loggers_config.items():
    logger = logging.getLogger(logger_name)
    logger.setLevel(getattr(logging, level))
    logger.propagate = settings.ENVIRONMENT == "development"

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    try:
        yield
    finally:
        await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    Bangladesh Academic Mentor Network (BAMN) API
    
    A platform connecting Bangladeshi academics abroad with students and researchers in Bangladesh.
    
    Key Features:
    - Public access to mentor profiles (no login required)
    - OAuth-based mentor registration (ORCID, Google)
    - Interactive globe visualization
    - Advanced search functionality
    """,
    version=settings.VERSION,
    terms_of_service="https://bamn.vercel.app/terms",
    contact={
        "name": "BAMN",
        "url": "https://bamn.vercel.app",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=tags_metadata,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next: Callable):
    skip_paths = ["/docs", "/redoc", f"{settings.API_V1_STR}/openapi.json"]
    if request.url.path in skip_paths or request.url.path.endswith((".js", ".css", ".ico")):
        return await call_next(request)

    if not request.url.path.startswith(settings.API_V1_STR):
        return await call_next(request)

    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    logger.info(
        f"API Request | "
        f"{request.method} {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Duration: {duration:.2f}s"
    )

    return response

@app.middleware("http")
async def catch_exceptions(request: Request, call_next: Callable):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(
            f"Error | "
            f"{request.method} {request.url.path} | "
            f"Error: {str(e)}"
        )
        raise

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    logger.info("Health check requested")
    return {"status": "ok", "message": "BAMN - Server is running"}
