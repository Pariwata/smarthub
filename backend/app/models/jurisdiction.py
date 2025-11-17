"""
Jurisdiction Database Model
"""
from sqlalchemy import Column, String, Text, JSON, Boolean
from .base import BaseModel


class Jurisdiction(BaseModel):
    """Jurisdiction entity for organizing regulations by geography/authority"""

    __tablename__ = "jurisdictions"

    # Basic Information
    name = Column(String(255), nullable=False, unique=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)

    # Hierarchy
    parent_code = Column(String(50), nullable=True)  # For nested jurisdictions
    level = Column(String(50))  # federal, state, local, international

    # Metadata
    country = Column(String(100))
    region = Column(String(100))
    active = Column(Boolean, default=True)

    # Additional Information
    official_language = Column(String(50))
    regulatory_bodies = Column(JSON, default=list)  # List of regulatory authorities
    contact_info = Column(JSON, default=dict)

    def __repr__(self):
        return f"<Jurisdiction {self.code}: {self.name}>"
