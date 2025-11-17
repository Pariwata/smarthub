"""
Regulation Database Models
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Enum,
    Integer,
    ForeignKey,
    Boolean,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel


class RegulationStatus(str, enum.Enum):
    """Regulation status enum"""

    ACTIVE = "active"
    DEPRECATED = "deprecated"
    PENDING = "pending"
    DRAFT = "draft"
    ARCHIVED = "archived"


class RegulationCategory(str, enum.Enum):
    """Regulation category enum"""

    LAW = "law"
    REGULATION = "regulation"
    GUIDANCE = "guidance"
    DIRECTIVE = "directive"
    STANDARD = "standard"
    POLICY = "policy"
    OTHER = "other"


class JurisdictionType(str, enum.Enum):
    """Jurisdiction type enum"""

    US_FEDERAL = "us_federal"
    US_STATE = "us_state"
    EU = "eu"
    UK = "uk"
    INTERNATIONAL = "international"
    OTHER = "other"


class Regulation(BaseModel):
    """Regulation entity"""

    __tablename__ = "regulations"

    # Basic Information
    title = Column(String(500), nullable=False, index=True)
    reference_number = Column(String(100), unique=True, nullable=False, index=True)
    jurisdiction = Column(Enum(JurisdictionType), nullable=False, index=True)
    category = Column(Enum(RegulationCategory), nullable=False, index=True)

    # Content
    content = Column(Text, nullable=False)
    summary = Column(Text)

    # Metadata
    effective_date = Column(DateTime)
    expiration_date = Column(DateTime, nullable=True)
    status = Column(
        Enum(RegulationStatus), nullable=False, default=RegulationStatus.ACTIVE
    )

    # Additional Information
    source_url = Column(String(1000))
    issuing_authority = Column(String(255))
    keywords = Column(JSON, default=list)  # List of keywords
    tags = Column(JSON, default=list)  # List of tags

    # Versioning
    current_version = Column(Integer, default=1)

    # Relationships
    versions = relationship(
        "RegulationVersion",
        back_populates="regulation",
        cascade="all, delete-orphan",
    )
    changes = relationship(
        "RegulatoryChange",
        back_populates="regulation",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Regulation {self.reference_number}: {self.title}>"


class RegulationVersion(BaseModel):
    """Regulation version entity for tracking changes over time"""

    __tablename__ = "regulation_versions"

    # Foreign Key
    regulation_id = Column(UUID(as_uuid=True), ForeignKey("regulations.id"), nullable=False, index=True)

    # Version Information
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)

    # Change Tracking
    published_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    change_summary = Column(Text)
    change_details = Column(JSON, default=dict)  # Detailed diff information

    # Status
    is_current = Column(Boolean, default=False)

    # Metadata
    changed_by = Column(String(255))  # Who made the change (system/user)
    change_reason = Column(Text)

    # Relationships
    regulation = relationship("Regulation", back_populates="versions")

    def __repr__(self):
        return f"<RegulationVersion {self.regulation_id} v{self.version_number}>"
