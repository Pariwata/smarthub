"""
Change Analysis Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ChangeAnalysisRequest(BaseModel):
    """Request schema for change analysis"""

    regulation_id: UUID
    old_version: int
    new_version: int
    use_ai: bool = True


class ChangeStatistics(BaseModel):
    """Change statistics schema"""

    additions: int
    deletions: int
    modifications: int
    total_chars_added: int
    total_chars_deleted: int


class ChangeSection(BaseModel):
    """Changed section schema"""

    type: str
    section_number: int
    old_section: List[str]
    new_section: List[str]


class ChangeDetectionResponse(BaseModel):
    """Change detection response"""

    change_type: str
    severity: str
    similarity_score: float
    affected_sections: List[str]
    statistics: ChangeStatistics
    sections: List[ChangeSection]


class AIAnalysis(BaseModel):
    """AI analysis schema"""

    summary: Optional[str] = None
    key_points: List[str] = Field(default_factory=list)
    compliance_impact: Dict[str, Any] = Field(default_factory=dict)


class Recommendation(BaseModel):
    """Recommendation schema"""

    priority: str
    action: str
    timeline: str
    stakeholders: List[str]


class RiskAssessment(BaseModel):
    """Risk assessment schema"""

    risk_score: float
    risk_level: str


class ChangeAnalysisResponse(BaseModel):
    """Comprehensive change analysis response"""

    regulation_id: UUID
    regulation_title: str
    jurisdiction: str
    analysis_date: datetime
    change_detection: ChangeDetectionResponse
    ai_analysis: AIAnalysis
    recommendations: List[Recommendation] = Field(default_factory=list)
    risk_assessment: RiskAssessment


class RegulatoryChangeResponse(BaseModel):
    """Regulatory change entity response"""

    id: UUID
    regulation_id: UUID
    change_type: str
    change_severity: str
    title: str
    description: Optional[str] = None
    affected_sections: List[str]
    business_impact: Optional[str] = None
    compliance_impact: Optional[str] = None
    ai_summary: Optional[str] = None
    risk_score: float
    detected_at: datetime
    effective_date: Optional[datetime] = None
    compliance_deadline: Optional[datetime] = None
    analysis_status: str
    notification_sent: bool

    class Config:
        from_attributes = True


class ChangeListResponse(BaseModel):
    """List of changes response"""

    total: int
    page: int
    page_size: int
    changes: List[RegulatoryChangeResponse]


class ImpactReportRequest(BaseModel):
    """Impact report request"""

    change_id: UUID
    business_context: Optional[Dict[str, Any]] = None


class ImpactReportResponse(BaseModel):
    """Impact report response"""

    executive_summary: str
    change_overview: Dict[str, Any]
    risk_assessment: RiskAssessment
    recommendations: List[Recommendation]
    key_points: List[str]
    compliance_impact: Dict[str, Any]
    business_context: Optional[Dict[str, Any]] = None
    generated_at: datetime
