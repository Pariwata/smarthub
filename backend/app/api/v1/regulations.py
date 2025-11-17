"""
Regulation Management Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from uuid import UUID

from app.schemas.regulation import (
    RegulationCreate,
    RegulationUpdate,
    RegulationResponse,
    RegulationListResponse,
    RegulationVersionResponse,
    CompareVersionsRequest,
)
from app.services import ChangeDetectionService

router = APIRouter()

# In-memory storage for demo (replace with database in production)
regulations_db = {}
versions_db = {}

change_detector = ChangeDetectionService()


@router.post("/regulations", response_model=RegulationResponse, status_code=201)
async def create_regulation(regulation: RegulationCreate):
    """
    Create a new regulation

    - **title**: Regulation title
    - **reference_number**: Unique reference number
    - **jurisdiction**: Jurisdiction (e.g., us_federal, eu)
    - **category**: Category (e.g., law, regulation)
    - **content**: Full regulation content
    """
    from uuid import uuid4
    from datetime import datetime

    # Check if reference number already exists
    if any(
        r.get("reference_number") == regulation.reference_number
        for r in regulations_db.values()
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Regulation with reference number {regulation.reference_number} already exists",
        )

    reg_id = uuid4()
    version_id = uuid4()

    # Create regulation
    new_regulation = {
        "id": reg_id,
        "status": "active",
        "current_version": 1,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        **regulation.model_dump(),
    }

    # Create initial version
    new_version = {
        "id": version_id,
        "regulation_id": reg_id,
        "version_number": 1,
        "content": regulation.content,
        "published_date": datetime.utcnow(),
        "change_summary": "Initial version",
        "is_current": True,
        "created_at": datetime.utcnow(),
    }

    regulations_db[reg_id] = new_regulation
    versions_db[version_id] = new_version

    return new_regulation


@router.get("/regulations", response_model=RegulationListResponse)
async def list_regulations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    jurisdiction: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
):
    """
    List all regulations with pagination and filters

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 10, max: 100)
    - **jurisdiction**: Filter by jurisdiction
    - **category**: Filter by category
    - **status**: Filter by status
    """
    filtered_regs = list(regulations_db.values())

    # Apply filters
    if jurisdiction:
        filtered_regs = [r for r in filtered_regs if r.get("jurisdiction") == jurisdiction]
    if category:
        filtered_regs = [r for r in filtered_regs if r.get("category") == category]
    if status:
        filtered_regs = [r for r in filtered_regs if r.get("status") == status]

    total = len(filtered_regs)

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_regs = filtered_regs[start:end]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "regulations": paginated_regs,
    }


@router.get("/regulations/{regulation_id}", response_model=RegulationResponse)
async def get_regulation(regulation_id: UUID):
    """Get a specific regulation by ID"""
    if regulation_id not in regulations_db:
        raise HTTPException(status_code=404, detail="Regulation not found")

    return regulations_db[regulation_id]


@router.put("/regulations/{regulation_id}", response_model=RegulationResponse)
async def update_regulation(regulation_id: UUID, update: RegulationUpdate):
    """
    Update a regulation (creates a new version if content changes)
    """
    from uuid import uuid4
    from datetime import datetime

    if regulation_id not in regulations_db:
        raise HTTPException(status_code=404, detail="Regulation not found")

    regulation = regulations_db[regulation_id]
    update_data = update.model_dump(exclude_unset=True)

    # Check if content is being updated
    content_changed = "content" in update_data and update_data["content"] != regulation["content"]

    if content_changed:
        # Create new version
        new_version_number = regulation["current_version"] + 1
        version_id = uuid4()

        new_version = {
            "id": version_id,
            "regulation_id": regulation_id,
            "version_number": new_version_number,
            "content": update_data["content"],
            "published_date": datetime.utcnow(),
            "change_summary": f"Version {new_version_number} update",
            "is_current": True,
            "created_at": datetime.utcnow(),
        }

        # Mark old versions as not current
        for version in versions_db.values():
            if version["regulation_id"] == regulation_id:
                version["is_current"] = False

        versions_db[version_id] = new_version
        regulation["current_version"] = new_version_number

    # Update regulation
    for key, value in update_data.items():
        regulation[key] = value

    regulation["updated_at"] = datetime.utcnow()

    return regulation


@router.delete("/regulations/{regulation_id}", status_code=204)
async def delete_regulation(regulation_id: UUID):
    """Delete a regulation (soft delete - marks as archived)"""
    if regulation_id not in regulations_db:
        raise HTTPException(status_code=404, detail="Regulation not found")

    regulations_db[regulation_id]["status"] = "archived"


@router.get(
    "/regulations/{regulation_id}/versions",
    response_model=List[RegulationVersionResponse],
)
async def get_regulation_versions(regulation_id: UUID):
    """Get all versions of a regulation"""
    if regulation_id not in regulations_db:
        raise HTTPException(status_code=404, detail="Regulation not found")

    versions = [
        v for v in versions_db.values() if v["regulation_id"] == regulation_id
    ]
    versions.sort(key=lambda x: x["version_number"], reverse=True)

    return versions


@router.post("/regulations/{regulation_id}/compare")
async def compare_versions(regulation_id: UUID, request: CompareVersionsRequest):
    """
    Compare two versions of a regulation

    Returns detailed diff analysis
    """
    if regulation_id not in regulations_db:
        raise HTTPException(status_code=404, detail="Regulation not found")

    # Find versions
    version1 = next(
        (
            v
            for v in versions_db.values()
            if v["regulation_id"] == regulation_id
            and v["version_number"] == request.version1
        ),
        None,
    )
    version2 = next(
        (
            v
            for v in versions_db.values()
            if v["regulation_id"] == regulation_id
            and v["version_number"] == request.version2
        ),
        None,
    )

    if not version1 or not version2:
        raise HTTPException(status_code=404, detail="Version not found")

    # Perform comparison
    comparison = change_detector.compare_versions(
        version1["content"],
        version2["content"],
        str(regulation_id),
    )

    return comparison
