# Bangladesh Academic Mentor Network (BAMN)

## Overview
BAMN is a public-facing web platform designed to connect Bangladeshi academics and researchers based abroad (mentors) with students and early-career researchers (mentees) in Bangladesh. The platform offers an intuitive database of expert profiles, advanced search and filtering, and a globe-based visualization for discovery and outreach.

## Features
- **Mentor Directory:** Publicly accessible, searchable, and filterable list of approved mentors.
- **Mentor Onboarding:** Registration via ORCID OAuth, Google OAuth, or email/password. Profile completion and moderation workflow.
- **Interactive Globe:** 3D globe/map visualization of mentor locations, colored by research area.
- **Advanced Search & Filtering:** Keyword, tag, and geographic filters for precise discovery.
- **Admin Dashboard:** Moderation queue, profile approval/rejection, and audit log for admin actions.
- **Secure Authentication:** JWT-based sessions, OAuth2, and strong password hashing.

## Architecture
- **Frontend:** Next.js (React 19, TypeScript, Tailwind CSS)
- **Backend:** FastAPI (Python 3.8+), PostgreSQL, SQLAlchemy (async), Alembic
- **Authentication:** JWT, OAuth2 (Google, ORCID), email/password
- **Deployment:** Uvicorn/Gunicorn for backend, modern SSR/SSG for frontend

## Directory Structure
```
bamn/
├── client/      # Frontend (Next.js, React, Tailwind CSS)
├── server/      # Backend (FastAPI, PostgreSQL, SQLAlchemy)
└── README.md    # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.8+
- PostgreSQL

### Backend Setup
1. Create and activate a virtual environment:
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database and OAuth credentials
   ```
3. Run database migrations:
   ```bash
   alembic upgrade head
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd ../client
   npm install
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```

### API Documentation
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Usage
- **Mentees:** Browse and search for mentors, view profiles, and contact via email (no login required).
- **Mentors:** Register, complete profile, and await admin approval before being listed.
- **Admins:** Review, approve, or reject mentor profiles; manage the platform via the admin dashboard.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (where available)
5. Submit a pull request

## License
MIT License. See [LICENSE](LICENSE) for details. 