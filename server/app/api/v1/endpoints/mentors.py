from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from typing import List, Optional, Any
from sqlalchemy import or_, and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

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
    "/search",
    response_model=SearchResponse,
    summary="Search Mentors",
    description="""
    Advanced search for mentors with multiple filtering options:
    - Full-text search across names, institutions, and research interests
    - Filter by research interest tags
    - Geographic filtering by continent, country, and city
    - Combined filtering support
    """
)
async def search_mentors(
    db: AsyncSession = Depends(deps.get_db),
    keyword: Optional[str] = Query(None, description="Full-text search term"),
    research_interests: List[str] = Query([], description="Filter by research interest tags"),
    continent: Optional[str] = Query(None, description="Filter by continent"),
    country: Optional[str] = Query(None, description="Filter by country"),
    city: Optional[str] = Query(None, description="Filter by city"),
    page: int = Query(1, description="Page number"),
    page_size: int = Query(10, description="Results per page")
) -> SearchResponse:
    """Advanced search for mentors with multiple filtering options"""
    query = select(Mentor).where(Mentor.moderation_status == ModerationStatus.APPROVED)
    
    # Full-text search across all relevant fields
    if keyword:
        keyword = keyword.strip().lower()
        query = query.where(
            or_(
                func.lower(Mentor.full_name).contains(keyword),
                func.lower(Mentor.institution).contains(keyword),
                func.lower(Mentor.department).contains(keyword),
                func.lower(Mentor.current_role).contains(keyword),
                func.lower(func.array_to_string(Mentor.degrees, ' ')).contains(keyword),
                func.lower(func.array_to_string(Mentor.research_interests, ' ')).contains(keyword),
                func.lower(Mentor.city).contains(keyword),
                func.lower(Mentor.country).contains(keyword),
                func.lower(Mentor.continent).contains(keyword)
            )
        )
    
    # Research interest tags filter (keep this strict for exact matches)
    if research_interests:
        interests = [interest.lower() for interest in research_interests]
        query = query.where(
            and_(*[
                func.lower(func.any(Mentor.research_interests)) == interest
                for interest in interests
            ])
        )
    
    # Geographic filters
    if continent:
        query = query.where(func.lower(Mentor.continent) == continent.lower())
    if country:
        query = query.where(func.lower(Mentor.country) == country.lower())
    if city:
        query = query.where(func.lower(Mentor.city) == city.lower())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    mentors = result.scalars().all()
    
    return SearchResponse(
        items=mentors,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get(
    "/tags/suggest",
    response_model=List[str],
    summary="Tag Auto-suggestions",
    description="Get research interest tag suggestions based on partial input"
)
async def suggest_tags(
    db: AsyncSession = Depends(deps.get_db),
    prefix: str = Query(..., min_length=1, description="Tag prefix to search for"),
    limit: int = Query(10, le=50, description="Maximum number of suggestions to return")
) -> List[str]:
    """Get tag suggestions for auto-complete"""
    query = select(Mentor.research_interests).where(
        Mentor.moderation_status == ModerationStatus.APPROVED
    )
    result = await db.execute(query)
    all_tags = result.scalars().all()
    
    unique_tags = set(tag.lower() for tags in all_tags for tag in tags)
    
    prefix = prefix.lower()
    matching_tags = [
        tag for tag in unique_tags 
        if tag.startswith(prefix)
    ]
    
    return sorted(matching_tags)[:limit]

@router.put(
    "/me",
    response_model=MentorResponse,
    summary="Update Profile",
    description="Update current mentor's profile. Authentication required."
)
async def update_profile(
    update_data: MentorUpdate,
    current_mentor: Mentor = Depends(deps.get_current_mentor),
    db: AsyncSession = Depends(deps.get_db)
) -> MentorResponse:
    """Update authenticated mentor's profile"""
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_mentor, field, value)
    
    current_mentor.moderation_status = ModerationStatus.PENDING
    
    db.add(current_mentor)
    await db.commit()
    await db.refresh(current_mentor)
    
    return current_mentor

@router.get(
    "/me",
    response_model=MentorResponse,
    summary="Get Own Profile",
    description="Get current mentor's profile. Authentication required."
)
async def get_own_profile(
    current_mentor: Mentor = Depends(deps.get_current_mentor)
) -> MentorResponse:
    """Get authenticated mentor's profile"""
    return current_mentor

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
async def get_globe_data(
    db: AsyncSession = Depends(deps.get_db),
    research_interests: List[str] = Query([], description="Filter by research interests")
) -> List[GlobeVisualization]:
    """Get mentor data for globe visualization"""
    query = select(Mentor).where(Mentor.moderation_status == ModerationStatus.APPROVED)
    
    if research_interests:
        for interest in research_interests:
            query = query.where(Mentor.research_interests.any(interest))
    
    result = await db.execute(query)
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
async def get_mentor(
    mentor_id: UUID = Path(..., description="The UUID of the mentor to retrieve"),
    db: AsyncSession = Depends(deps.get_db)
) -> MentorResponse:
    """Get a specific mentor profile"""
    query = select(Mentor).where(
        Mentor.id == mentor_id,
        Mentor.moderation_status == ModerationStatus.APPROVED
    )
    result = await db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    return mentor