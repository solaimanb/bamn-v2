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

# Clear existing handlers
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

# Set up basic logging configuration
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT,
    datefmt=settings.LOG_DATE_FORMAT,
    force=True
)

# Configure loggers with minimal output
loggers_config = {
    'sqlalchemy.engine': 'WARNING',
    'passlib': 'WARNING',
    'uvicorn.error': 'WARNING',
    'uvicorn.access': 'WARNING',
    'fastapi': 'WARNING'
}

# Apply logger configurations
for logger_name, level in loggers_config.items():
    logger = logging.getLogger(logger_name)
    logger.setLevel(getattr(logging, level))
    logger.propagate = settings.ENVIRONMENT == "development" and level == "INFO"

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

@app.middleware("http")
async def log_requests(request: Request, call_next: Callable):
    if not request.url.path.startswith(settings.API_V1_STR):
        return await call_next(request)

    skip_paths = ["/docs", "/redoc", f"{settings.API_V1_STR}/openapi.json"]
    if request.url.path in skip_paths or request.url.path.endswith((".js", ".css", ".ico")):
        return await call_next(request)

    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    if response.status_code >= 400:
        logger.warning(
            f"{request.method} {request.url.path} | "
            f"Status: {response.status_code} | "
            f"Duration: {duration:.2f}s"
        )
    elif settings.DEBUG: 
        logger.info(
            f"{request.method} {request.url.path} | "
            f"Status: {response.status_code}"
        )

    return response

@app.middleware("http")
async def catch_exceptions(request: Request, call_next: Callable):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"{request.method} {request.url.path} | Error: {str(e)}")
        raise

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "BAMN - Server is running"}
