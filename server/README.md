# BAMN API Server

Backend server for the Bangladesh Academic Mentor Network (BAMN) platform.

## Overview

BAMN connects Bangladeshi academics abroad with students and researchers in Bangladesh. This FastAPI-based server provides:

- Public access to mentor profiles
- OAuth-based mentor registration (ORCID, Google)
- Admin dashboard for mentor approval
- Interactive globe visualization data
- Advanced search functionality

## Tech Stack

- Python 3.8+
- FastAPI
- PostgreSQL
- SQLAlchemy (async)
- Alembic for migrations
- JWT authentication
- OAuth2 integration

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   .\venv\Scripts\activate  # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Create admin user:
   ```bash
   python scripts/create_admin.py
   ```

6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

#### Public Endpoints
- `GET /api/v1/mentors`: List approved mentors
- `GET /api/v1/mentors/{id}`: Get mentor details
- `GET /api/v1/mentors/globe`: Get data for globe visualization

#### Authentication
- `POST /api/v1/auth/register`: Register new mentor
- `POST /api/v1/auth/login`: Login with email/password
- `POST /api/v1/auth/oauth/google/login`: Google OAuth login
- `POST /api/v1/auth/oauth/orcid/login`: ORCID OAuth login

#### Admin Only
- `GET /api/v1/admin/mentors`: List all mentors
- `GET /api/v1/admin/mentors/pending`: List pending mentors
- `PUT /api/v1/admin/mentors/{id}/approve`: Approve mentor
- `PUT /api/v1/admin/mentors/{id}/reject`: Reject mentor

## Development

### Code Structure
```
server/
├── alembic/          # Database migrations
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Core functionality
│   ├── db/           # Database setup
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── scripts/          # Utility scripts
└── tests/           # Test suite
```

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Security Notes

1. Never commit `.env` files
2. Keep OAuth secrets secure
3. Use strong passwords
4. Enable CORS only for trusted origins

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 