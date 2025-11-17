"""
Regulatory Change Database Models
"""
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    JSON,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel


class ChangeType(str, enum.Enum):
    """Change type enum"""

    ADDITION = "addition"
    REMOVAL = "removal"
    MODIFICATION = "modification"
    CLARIFICATION = "clarification"
    RESTRUCTURE = "restructure"


class ChangeSeverity(str, enum.Enum):
    """Change severity enum"""

    CRITICAL = "critical"  # Immediate action required
    HIGH = "high"  # Action required within weeks
    MEDIUM = "medium"  # Action required within months
    LOW = "low"  # Informational only
    INFORMATIONAL = "informational"


class AnalysisStatus(str, enum.Enum):
    """Analysis status enum"""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class RegulatoryChange(BaseModel):
    """Regulatory change tracking entity"""

    __tablename__ = "regulatory_changes"

    # Foreign Keys
    regulation_id = Column(
        UUID(as_uuid=True), ForeignKey("regulations.id"), nullable=False, index=True
    )
    old_version_id = Column(
        UUID(as_uuid=True), ForeignKey("regulation_versions.id"), nullable=True
    )
    new_version_id = Column(
        UUID(as_uuid=True), ForeignKey("regulation_versions.id"), nullable=False
    )

    # Change Information
    change_type = Column(Enum(ChangeType), nullable=False)
    change_severity = Column(
        Enum(ChangeSeverity), nullable=False, default=ChangeSeverity.MEDIUM
    )

    # Change Details
    title = Column(String(500), nullable=False)
    description = Column(Text)
    affected_sections = Column(JSON, default=list)  # List of affected section IDs
    change_details = Column(JSON, default=dict)  # Detailed diff information

    # Impact Analysis
    business_impact = Column(Text)
    compliance_impact = Column(Text)
    technical_impact = Column(Text)

    # Timing
    detected_at = Column(DateTime, nullable=False, index=True)
    effective_date = Column(DateTime)
    compliance_deadline = Column(DateTime)

    # AI Analysis
    ai_summary = Column(Text)  # AI-generated summary
    ai_recommendations = Column(JSON, default=list)  # AI-generated recommendations
    key_points = Column(JSON, default=list)  # Key highlights
    risk_score = Column(Float, default=0.0)  # 0.0 to 1.0

    # Analysis Status
    analysis_status = Column(
        Enum(AnalysisStatus), nullable=False, default=AnalysisStatus.PENDING
    )
    analysis_completed_at = Column(DateTime, nullable=True)

    # Notification
    notification_sent = Column(Boolean, default=False)
    notification_sent_at = Column(DateTime, nullable=True)

    # Related Changes
    related_regulation_ids = Column(JSON, default=list)  # Related regulations

    # Relationships
    regulation = relationship("Regulation", back_populates="changes")
    impacts = relationship(
        "ChangeImpact", back_populates="change", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<RegulatoryChange {self.title} ({self.change_severity})>"


class ChangeImpact(BaseModel):
    """Change impact assessment for specific business areas"""

    __tablename__ = "change_impacts"

    # Foreign Key
    change_id = Column(
        UUID(as_uuid=True),
        ForeignKey("regulatory_changes.id"),
        nullable=False,
        index=True,
    )

    # Impact Area
    impact_area = Column(String(255), nullable=False)  # e.g., "Data Privacy", "Financial Reporting"
    impact_description = Column(Text, nullable=False)

    # Assessment
    impact_level = Column(
        Enum(ChangeSeverity), nullable=False, default=ChangeSeverity.MEDIUM
    )
    action_required = Column(Boolean, default=True)
    estimated_effort = Column(String(100))  # e.g., "1-2 weeks", "3-6 months"

    # Recommendations
    recommended_actions = Column(JSON, default=list)
    resources_needed = Column(JSON, default=list)

    # Status
    addressed = Column(Boolean, default=False)
    addressed_at = Column(DateTime, nullable=True)
    addressed_by = Column(String(255), nullable=True)

    # Relationships
    change = relationship("RegulatoryChange", back_populates="impacts")

    def __repr__(self):
        return f"<ChangeImpact {self.impact_area} ({self.impact_level})>"
