"""
Regulation Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class RegulationBase(BaseModel):
    """Base regulation schema"""

    title: str = Field(..., min_length=1, max_length=500)
    reference_number: str = Field(..., min_length=1, max_length=100)
    jurisdiction: str
    category: str
    content: str = Field(..., min_length=1)
    summary: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    source_url: Optional[str] = None
    issuing_authority: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class RegulationCreate(RegulationBase):
    """Schema for creating a regulation"""

    pass


class RegulationUpdate(BaseModel):
    """Schema for updating a regulation"""

    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = None
    status: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    source_url: Optional[str] = None
    issuing_authority: Optional[str] = None
    keywords: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class RegulationResponse(RegulationBase):
    """Schema for regulation response"""

    id: UUID
    status: str
    current_version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RegulationVersionResponse(BaseModel):
    """Schema for regulation version response"""

    id: UUID
    regulation_id: UUID
    version_number: int
    content: str
    published_date: datetime
    change_summary: Optional[str] = None
    is_current: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RegulationListResponse(BaseModel):
    """Schema for regulation list response"""

    total: int
    page: int
    page_size: int
    regulations: List[RegulationResponse]


class CompareRegulationsRequest(BaseModel):
    """Schema for comparing regulations"""

    regulation1_id: UUID
    regulation2_id: UUID


class CompareVersionsRequest(BaseModel):
    """Schema for comparing versions"""

    regulation_id: UUID
    version1: int
    version2: int
