"""
Analysis Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID

from app.schemas.change import (
    ChangeAnalysisRequest,
    ChangeAnalysisResponse,
    ImpactReportRequest,
    ImpactReportResponse,
)
from app.services import AnalysisService
from app.config import settings

router = APIRouter()


def get_analysis_service():
    """Get analysis service instance"""
    return AnalysisService(
        openai_api_key=settings.OPENAI_API_KEY,
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        ai_model=settings.AI_MODEL,
    )


@router.post("/analysis/analyze-change", response_model=dict)
async def analyze_change(
    request: ChangeAnalysisRequest,
    analysis_service: AnalysisService = Depends(get_analysis_service),
):
    """
    Analyze a regulatory change between two versions

    Performs comprehensive analysis including:
    - Change detection
    - AI-powered summarization
    - Impact assessment
    - Risk scoring
    - Recommendations generation

    **Note**: This is a demo endpoint. In production, this would:
    1. Fetch regulation versions from database
    2. Perform async analysis
    3. Store results in database
    4. Return analysis results
    """
    # Demo implementation
    # In production, fetch from database
    from datetime import datetime

    # Mock regulation data
    regulation_context = {
        "id": str(request.regulation_id),
        "title": "Sample Regulation",
        "jurisdiction": "us_federal",
    }

    # Mock version contents
    old_content = f"Sample old content for version {request.old_version}"
    new_content = f"Sample new content for version {request.new_version} with significant changes to compliance requirements."

    # Perform analysis
    try:
        analysis = await analysis_service.analyze_change(
            old_content=old_content,
            new_content=new_content,
            regulation_context=regulation_context,
            use_ai=request.use_ai,
        )

        return analysis

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}",
        )


@router.post("/analysis/impact-report", response_model=dict)
async def generate_impact_report(
    request: ImpactReportRequest,
    analysis_service: AnalysisService = Depends(get_analysis_service),
):
    """
    Generate a detailed impact report for a change

    Includes:
    - Executive summary
    - Risk assessment
    - Recommendations
    - Compliance impact
    - Business context
    """
    # Demo implementation
    # In production, fetch change analysis from database
    from datetime import datetime

    mock_change_analysis = {
        "regulation_id": "sample-uuid",
        "regulation_title": "Sample Regulation",
        "jurisdiction": "us_federal",
        "analysis_date": datetime.utcnow(),
        "change_detection": {
            "type": "modification",
            "severity": "high",
            "similarity_score": 0.75,
            "affected_sections": ["Section 1", "Section 2"],
        },
        "ai_analysis": {
            "summary": "Significant changes to compliance requirements detected.",
            "key_points": [
                "New reporting requirements added",
                "Deadline changed from 30 to 15 days",
            ],
            "compliance_impact": {
                "impact_level": "high",
                "affected_areas": ["Reporting", "Compliance"],
            },
        },
        "recommendations": [
            {
                "priority": "high",
                "action": "Update reporting procedures",
                "timeline": "2 weeks",
                "stakeholders": ["Compliance Team", "IT"],
            }
        ],
        "risk_assessment": {
            "risk_score": 0.75,
            "risk_level": "high",
        },
    }

    try:
        report = await analysis_service.generate_impact_report(
            change_analysis=mock_change_analysis,
            business_context=request.business_context,
        )

        return report

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {str(e)}",
        )


@router.get("/analysis/regulations/{regulation_id}/timeline")
async def get_regulation_timeline(regulation_id: UUID):
    """
    Get timeline of all changes for a regulation

    Returns chronological history of changes
    """
    # Demo implementation
    from datetime import datetime, timedelta

    timeline = [
        {
            "version": 1,
            "date": (datetime.utcnow() - timedelta(days=365)).isoformat(),
            "change_type": "initial",
            "summary": "Initial version published",
        },
        {
            "version": 2,
            "date": (datetime.utcnow() - timedelta(days=180)).isoformat(),
            "change_type": "modification",
            "summary": "Updated reporting requirements",
        },
        {
            "version": 3,
            "date": datetime.utcnow().isoformat(),
            "change_type": "addition",
            "summary": "Added new compliance section",
        },
    ]

    return {
        "regulation_id": str(regulation_id),
        "timeline": timeline,
    }


@router.post("/analysis/compare-regulations")
async def compare_regulations(
    regulation1_id: UUID,
    regulation2_id: UUID,
    analysis_service: AnalysisService = Depends(get_analysis_service),
):
    """
    Compare two different regulations for similarity

    Useful for finding related regulations or understanding
    how different jurisdictions handle similar topics
    """
    # Demo implementation
    mock_reg1 = {
        "id": str(regulation1_id),
        "content": "Sample regulation 1 content about data privacy and protection.",
    }

    mock_reg2 = {
        "id": str(regulation2_id),
        "content": "Sample regulation 2 content about data privacy and security measures.",
    }

    try:
        comparison = await analysis_service.compare_regulations(mock_reg1, mock_reg2)

        return comparison

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Comparison failed: {str(e)}",
        )


@router.get("/analysis/dashboard/summary")
async def get_dashboard_summary():
    """
    Get dashboard summary statistics

    Returns overview of:
    - Total regulations tracked
    - Recent changes
    - Pending analyses
    - High-risk changes
    """
    from datetime import datetime, timedelta

    summary = {
        "timestamp": datetime.utcnow().isoformat(),
        "statistics": {
            "total_regulations": 150,
            "total_changes": 45,
            "pending_analysis": 8,
            "critical_changes": 3,
        },
        "recent_changes": [
            {
                "id": "change-1",
                "regulation": "GDPR Article 5",
                "severity": "high",
                "detected": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            },
            {
                "id": "change-2",
                "regulation": "CCPA Section 1798.100",
                "severity": "medium",
                "detected": (datetime.utcnow() - timedelta(days=5)).isoformat(),
            },
        ],
        "high_risk_items": [
            {
                "id": "change-3",
                "regulation": "SOX Section 404",
                "risk_score": 0.85,
                "deadline": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            }
        ],
    }

    return summary
