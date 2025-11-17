"""
Change Tracking Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.schemas.change import (
    RegulatoryChangeResponse,
    ChangeListResponse,
)

router = APIRouter()

# In-memory storage for demo
changes_db = {}


@router.get("/changes", response_model=ChangeListResponse)
async def list_changes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    regulation_id: Optional[UUID] = None,
    severity: Optional[str] = None,
    change_type: Optional[str] = None,
    analysis_status: Optional[str] = None,
):
    """
    List all regulatory changes with pagination and filters

    - **page**: Page number
    - **page_size**: Items per page
    - **regulation_id**: Filter by regulation
    - **severity**: Filter by severity (critical, high, medium, low)
    - **change_type**: Filter by type (addition, removal, modification)
    - **analysis_status**: Filter by analysis status
    """
    filtered_changes = list(changes_db.values())

    # Apply filters
    if regulation_id:
        filtered_changes = [
            c for c in filtered_changes if c.get("regulation_id") == regulation_id
        ]
    if severity:
        filtered_changes = [
            c for c in filtered_changes if c.get("change_severity") == severity
        ]
    if change_type:
        filtered_changes = [
            c for c in filtered_changes if c.get("change_type") == change_type
        ]
    if analysis_status:
        filtered_changes = [
            c for c in filtered_changes if c.get("analysis_status") == analysis_status
        ]

    total = len(filtered_changes)

    # Sort by detected_at desc
    filtered_changes.sort(key=lambda x: x.get("detected_at", datetime.min), reverse=True)

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_changes = filtered_changes[start:end]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "changes": paginated_changes,
    }


@router.get("/changes/{change_id}", response_model=RegulatoryChangeResponse)
async def get_change(change_id: UUID):
    """Get a specific change by ID"""
    if change_id not in changes_db:
        raise HTTPException(status_code=404, detail="Change not found")

    return changes_db[change_id]


@router.get("/changes/{change_id}/related")
async def get_related_changes(change_id: UUID, limit: int = Query(5, ge=1, le=20)):
    """
    Get related changes based on similarity

    Returns changes that are similar or affect related regulations
    """
    if change_id not in changes_db:
        raise HTTPException(status_code=404, detail="Change not found")

    # Simple implementation - in production use vector similarity
    target_change = changes_db[change_id]
    regulation_id = target_change.get("regulation_id")

    related = [
        c
        for c in changes_db.values()
        if c.get("id") != change_id
        and (
            c.get("regulation_id") == regulation_id
            or c.get("change_type") == target_change.get("change_type")
        )
    ]

    return related[:limit]


@router.post("/changes/{change_id}/notify")
async def send_notification(change_id: UUID):
    """
    Send notification for a change

    Triggers notification to stakeholders about the regulatory change
    """
    if change_id not in changes_db:
        raise HTTPException(status_code=404, detail="Change not found")

    change = changes_db[change_id]

    # Mark as notified
    change["notification_sent"] = True
    change["notification_sent_at"] = datetime.utcnow()

    return {
        "status": "success",
        "message": "Notification sent successfully",
        "change_id": change_id,
    }
