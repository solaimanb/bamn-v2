from pydantic import BaseModel, EmailStr, HttpUrl, Field, UUID4, constr
from typing import List, Optional, Tuple
from datetime import datetime
from app.models.enums import ModerationStatus, AuthProvider
from pydantic import validator

class MentorBase(BaseModel):
    """Base Mentor schema with common fields"""
    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Full name of the mentor",
        example="Dr. Jane Doe"
    )
    email: EmailStr = Field(
        ...,
        description="Primary email address",
        example="jane.doe@university.edu"
    )
    current_role: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Current academic position",
        example="Associate Professor"
    )
    institution: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Current primary institution",
        example="Massachusetts Institute of Technology"
    )
    department: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Department or faculty name",
        example="Department of Computer Science"
    )
    degrees: List[str] = Field(
        ...,
        min_items=1,
        description="Academic degrees with institutions",
        example=["Ph.D. in Computer Science, Stanford University, 2020"]
    )
    research_interests: List[str] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="Research interests and expertise areas",
        example=["Machine Learning", "Natural Language Processing"]
    )
    
    # Location fields
    continent: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Continent name",
        example="North America"
    )
    country: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Country name",
        example="United States"
    )
    city: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="City name",
        example="Cambridge"
    )
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude for map placement",
        example=42.3601
    )
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude for map placement",
        example=-71.0942
    )
    
    # Optional fields
    linkedin_url: Optional[str] = Field(
        None,
        max_length=200,
        description="LinkedIn profile URL"
    )
    profile_picture_url: Optional[str] = Field(
        None,
        max_length=500,
        description="Profile picture URL"
    )

    @validator('degrees')
    def validate_degrees(cls, v):
        if not all(2 <= len(d) <= 200 for d in v):
            raise ValueError("Each degree must be between 2 and 200 characters")
        return v

    @validator('research_interests')
    def validate_research_interests(cls, v):
        if not all(2 <= len(i) <= 100 for i in v):
            raise ValueError("Each research interest must be between 2 and 100 characters")
        return v

class MentorCreate(MentorBase):
    """Schema for creating a mentor via email/password"""
    password: str = Field(
        ...,
        min_length=8,
        description="Password for email-based authentication"
    )

class OAuthMentorCreate(MentorBase):
    """Schema for creating a mentor via OAuth"""
    auth_provider: AuthProvider
    orcid_id: Optional[str] = None
    google_id: Optional[str] = None

class MentorUpdate(BaseModel):
    """Schema for updating mentor profile"""
    full_name: Optional[str] = Field(None, min_length=3, max_length=100)
    current_role: Optional[str] = Field(None, min_length=2, max_length=100)
    institution: Optional[str] = Field(None, min_length=2, max_length=200)
    department: Optional[str] = Field(None, min_length=2, max_length=200)
    degrees: Optional[List[str]]
    research_interests: Optional[List[str]]
    continent: Optional[str] = Field(None, min_length=2, max_length=50)
    country: Optional[str] = Field(None, min_length=2, max_length=100)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    linkedin_url: Optional[str] = Field(None, max_length=200)
    profile_picture_url: Optional[str] = Field(None, max_length=500)

    @validator('degrees')
    def validate_degrees(cls, v):
        if v and not all(2 <= len(d) <= 200 for d in v):
            raise ValueError("Each degree must be between 2 and 200 characters")
        return v

    @validator('research_interests')
    def validate_research_interests(cls, v):
        if v and not all(2 <= len(i) <= 100 for i in v):
            raise ValueError("Each research interest must be between 2 and 100 characters")
        return v

class MentorResponse(MentorBase):
    """Schema for mentor profile responses"""
    id: UUID4
    auth_provider: AuthProvider
    moderation_status: ModerationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GeoLocation(BaseModel):
    """Geographic location data for map display"""
    continent: str
    country: str
    city: str
    coordinates: Tuple[float, float]  # (latitude, longitude) for globe display

class MentorProfile(BaseModel):
    """Complete mentor profile data"""
    # Basic Info
    full_name: str
    email: EmailStr
    institution: str
    current_role: str
    degrees: List[str]
    research_interests: List[str] = Field(description="Research interest tags")
    
    # Location (for globe visualization)
    continent: str
    country: str
    city: str
    coordinates: Tuple[float, float]
    
    # Contact & Social
    preferred_contact: str = Field(description="Preferred contact method")
    orcid_id: Optional[str] = None
    linkedin_url: Optional[HttpUrl] = None
    
    # Profile Media
    profile_picture_url: Optional[HttpUrl] = None
    
    # System Fields
    moderation_status: ModerationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SearchFilters(BaseModel):
    """Search and filter parameters for mentor search"""
    keyword: Optional[str] = Field(
        None, 
        min_length=2,
        description="Search across names, institutions, and research tags",
        example="machine learning"
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Filter by specific research interest tags",
        example=["Machine Learning", "Natural Language Processing"]
    )
    continent: Optional[str] = Field(
        None,
        description="Filter by continent",
        example="Asia"
    )
    country: Optional[str] = Field(
        None,
        description="Filter by country",
        example="Bangladesh"
    )
    city: Optional[str] = Field(
        None,
        description="Filter by city",
        example="Dhaka"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "keyword": "machine learning",
                "tags": ["Deep Learning", "Computer Vision"],
                "continent": "Asia",
                "country": "Bangladesh",
                "city": "Dhaka"
            }
        }

class SearchResponse(BaseModel):
    """Search results with pagination"""
    items: List[MentorResponse]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID4: lambda v: str(v)
        }
        
    @validator('items')
    def validate_items(cls, v):
        """Ensure items is always a list"""
        if v is None:
            return []
        return list(v)

    @validator('total')
    def validate_total(cls, v):
        """Ensure total is never negative"""
        return max(0, v)

    @validator('page')
    def validate_page(cls, v):
        """Ensure page is at least 1"""
        return max(1, v)

    @validator('page_size')
    def validate_page_size(cls, v):
        """Ensure page_size is at least 1"""
        return max(1, v)

class TagSuggestion(BaseModel):
    """Schema for tag auto-suggestions"""
    tag: str

class TagSuggestionResponse(BaseModel):
    """Response for tag auto-complete"""
    suggestions: List[TagSuggestion]

class MentorRegistration(BaseModel):
    """Schema for mentor registration"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    institution: str
    department: str
    research_interests: List[str] = Field(..., description="List of research interests/tags")
    # Geographic info
    continent: str
    country: str
    city: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class MentorSearch(BaseModel):
    """Schema for mentor search parameters"""
    keyword: Optional[str] = Field(
        None,
        min_length=2,
        description="Search across names, institutions, and research interests",
        example="machine learning"
    )
    research_interests: List[str] = Field(
        default_factory=list,
        description="Filter by specific research interest tags",
        example=["Machine Learning", "Natural Language Processing"]
    )
    continent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

class GlobeVisualization(BaseModel):
    """Schema for globe view data"""
    id: UUID4
    full_name: str
    research_interests: List[str] 
    latitude: float
    longitude: float
    
    class Config:
        from_attributes = True