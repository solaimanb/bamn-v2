from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mentor import Mentor
from app.models.enums import ModerationStatus
from app.schemas.mentor import MentorResponse
from app.api import deps

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get(
    "/mentors",
    response_model=List[MentorResponse],
    summary="List All Mentors",
    description="Get all mentor profiles with optional status filter. Admin only."
)
async def list_all_mentors(
    db: AsyncSession = Depends(deps.get_db),
    _: bool = Depends(deps.verify_admin),
    status: Optional[ModerationStatus] = Query(None, description="Filter by moderation status")
) -> List[MentorResponse]:
    """List all mentor profiles with optional status filter"""
    query = select(Mentor)
    if status:
        query = query.where(Mentor.moderation_status == status)
    result = await db.execute(query)
    return result.scalars().all()

@router.get(
    "/mentors/pending",
    response_model=List[MentorResponse],
    summary="List Pending Mentors",
    description="Get all mentor profiles pending approval. Admin only."
)
async def list_pending_mentors(
    db: AsyncSession = Depends(deps.get_db),
    _: bool = Depends(deps.verify_admin)
) -> List[MentorResponse]:
    """List pending mentor profiles"""
    query = select(Mentor).where(Mentor.moderation_status == ModerationStatus.PENDING)
    result = await db.execute(query)
    return result.scalars().all()

@router.put(
    "/mentors/{mentor_id}/approve",
    response_model=MentorResponse,
    summary="Approve Mentor",
    description="Approve a pending mentor profile. Admin only."
)
async def approve_mentor(
    mentor_id: str,
    db: AsyncSession = Depends(deps.get_db),
    _: bool = Depends(deps.verify_admin)
) -> MentorResponse:
    """Approve a mentor profile"""
    query = select(Mentor).where(Mentor.id == mentor_id)
    result = await db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    mentor.moderation_status = ModerationStatus.APPROVED
    db.add(mentor)
    await db.commit()
    await db.refresh(mentor)
    
    return mentor

@router.put(
    "/mentors/{mentor_id}/reject",
    response_model=MentorResponse,
    summary="Reject Mentor",
    description="Reject a pending mentor profile. Admin only."
)
async def reject_mentor(
    mentor_id: str,
    db: AsyncSession = Depends(deps.get_db),
    _: bool = Depends(deps.verify_admin)
) -> MentorResponse:
    """Reject a mentor profile"""
    query = select(Mentor).where(Mentor.id == mentor_id)
    result = await db.execute(query)
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    mentor.moderation_status = ModerationStatus.REJECTED
    db.add(mentor)
    await db.commit()
    await db.refresh(mentor)
    
    return mentor
