from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from typing import List, Optional, Any
from sqlalchemy import or_, and_, func, select
from sqlalchemy.orm import Session

from app.models.mentor import Mentor
from app.models.enums import ModerationStatus
from app.schemas.mentor import (
    MentorProfile,
    SearchResponse,
    MentorResponse,
    MentorUpdate,
    MentorSearch,
    GlobeVisualization
)
from app.api import deps

router = APIRouter(tags=["Mentors"])

@router.get(
    "/",
    response_model=List[MentorResponse],
    summary="List Mentors",
    description="""
    Get all approved mentor profiles.
    Results are paginated and can be filtered by various criteria.
    No authentication required - this endpoint is public.
    """
)
def list_mentors(
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Results per page"),
    keyword: Optional[str] = Query(None, description="Search across name, institution, research interests"),
    continent: Optional[str] = Query(None, description="Filter by continent"),
    country: Optional[str] = Query(None, description="Filter by country"),
    city: Optional[str] = Query(None, description="Filter by city")
) -> List[MentorResponse]:
    """List all approved mentor profiles with filtering and pagination"""
    query = select(Mentor).where(Mentor.moderation_status == ModerationStatus.APPROVED)
    
    # Apply filters
    if keyword:
        query = query.where(
            or_(
                Mentor.full_name.ilike(f"%{keyword}%"),
                Mentor.institution.ilike(f"%{keyword}%"),
                Mentor.department.ilike(f"%{keyword}%"),
                Mentor.research_interests.any(keyword)
            )
        )
    
    if continent:
        query = query.where(Mentor.continent == continent)
    if country:
        query = query.where(Mentor.country == country)
    if city:
        query = query.where(Mentor.city == city)
    
    # Apply pagination
    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query)
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = db.execute(query)
    mentors = result.scalars().all()
    
    return mentors

@router.get(
    "/globe",
    response_model=List[GlobeVisualization],
    summary="Globe Data",
    description="""
    Get mentor data formatted for globe visualization.
    Returns location and research data for approved mentors.
    No authentication required - this endpoint is public.
    """
)
def get_globe_data(
    db: Session = Depends(deps.get_db),
    research_interests: List[str] = Query([], description="Filter by research interests")
) -> List[GlobeVisualization]:
    """Get mentor data for globe visualization"""
    query = select(Mentor).where(Mentor.moderation_status == ModerationStatus.APPROVED)
    
    if research_interests:
        for interest in research_interests:
            query = query.where(Mentor.research_interests.any(interest))
    
    result = db.execute(query)
    mentors = result.scalars().all()
    return mentors

@router.get(
    "/{mentor_id}",
    response_model=MentorResponse,
    summary="Get Mentor",
    description="""
    Get detailed information about a specific mentor.
    Only approved profiles are visible.
    No authentication required - this endpoint is public.
    """
)
def get_mentor(
    mentor_id: str,
    db: Session = Depends(deps.get_db)
) -> MentorResponse:
    """Get a specific mentor profile"""
    query = select(Mentor).where(
        Mentor.id == mentor_id,
        Mentor.moderation_status == ModerationStatus.APPROVED
    )
    result = db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    return mentor

@router.put(
    "/me",
    response_model=MentorResponse,
    summary="Update Profile",
    description="Update current mentor's profile. Authentication required."
)
def update_profile(
    update_data: MentorUpdate,
    current_mentor: Mentor = Depends(deps.get_current_mentor),
    db: Session = Depends(deps.get_db)
) -> MentorResponse:
    """Update authenticated mentor's profile"""
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_mentor, field, value)
    
    # Profile updates need to be re-approved
    current_mentor.moderation_status = ModerationStatus.PENDING
    
    db.add(current_mentor)
    db.commit()
    db.refresh(current_mentor)
    
    return current_mentor

@router.get(
    "/me",
    response_model=MentorResponse,
    summary="Get Own Profile",
    description="Get current mentor's profile. Authentication required."
)
def get_own_profile(
    current_mentor: Mentor = Depends(deps.get_current_mentor)
) -> MentorResponse:
    """Get authenticated mentor's profile"""
    return current_mentor