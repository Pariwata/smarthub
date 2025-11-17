"""
Common Schemas
"""
from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    version: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response"""

    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
