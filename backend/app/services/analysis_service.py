"""
Analysis Service
Comprehensive analysis service that orchestrates change detection and AI analysis
"""
from typing import Dict, List, Optional
from datetime import datetime
import logging

from .change_detection_service import ChangeDetectionService
from .ai_service import AIService

logger = logging.getLogger(__name__)


class AnalysisService:
    """
    Service for comprehensive regulatory change analysis
    Orchestrates change detection, AI analysis, and impact assessment
    """

    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None,
        ai_model: str = "gpt-4-turbo-preview",
    ):
        """
        Initialize Analysis Service

        Args:
            openai_api_key: OpenAI API key
            anthropic_api_key: Anthropic API key
            ai_model: AI model to use
        """
        self.change_detector = ChangeDetectionService()
        self.ai_service = AIService(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key,
            model=ai_model,
        )

    async def analyze_change(
        self,
        old_content: str,
        new_content: str,
        regulation_context: Dict,
        use_ai: bool = True,
    ) -> Dict:
        """
        Perform comprehensive analysis of regulatory change

        Args:
            old_content: Previous version content
            new_content: New version content
            regulation_context: Context about the regulation
            use_ai: Whether to use AI for enhanced analysis

        Returns:
            Comprehensive analysis report
        """
        logger.info(
            f"Starting analysis for regulation: {regulation_context.get('id', 'unknown')}"
        )

        # Step 1: Detect changes
        change_details = self.change_detector.detect_changes(old_content, new_content)

        # Step 2: Get affected sections
        affected_sections = self.change_detector.identify_affected_sections(
            new_content, change_details["sections"]
        )

        # Initialize analysis result
        analysis = {
            "regulation_id": regulation_context.get("id"),
            "regulation_title": regulation_context.get("title"),
            "jurisdiction": regulation_context.get("jurisdiction"),
            "analysis_date": datetime.utcnow().isoformat(),
            "change_detection": {
                "type": change_details["change_type"],
                "severity": change_details["severity"],
                "similarity_score": change_details["similarity_score"],
                "affected_sections": affected_sections,
                "statistics": change_details["statistics"],
            },
            "ai_analysis": {},
            "recommendations": [],
            "risk_assessment": {},
        }

        # Step 3: AI-powered analysis (if enabled)
        if use_ai:
            try:
                # Generate summary
                summary = await self.ai_service.summarize_change(
                    old_content, new_content, change_details
                )
                analysis["ai_analysis"]["summary"] = summary

                # Extract key points
                key_points = await self.ai_service.extract_key_points(
                    summary, change_details
                )
                analysis["ai_analysis"]["key_points"] = key_points

                # Generate recommendations
                recommendations = await self.ai_service.generate_recommendations(
                    change_details, regulation_context
                )
                analysis["recommendations"] = recommendations

                # Analyze compliance impact
                compliance_impact = await self.ai_service.analyze_compliance_impact(
                    change_details
                )
                analysis["ai_analysis"]["compliance_impact"] = compliance_impact

                # Calculate risk score
                risk_score = await self.ai_service.calculate_risk_score(change_details)
                analysis["risk_assessment"] = {
                    "risk_score": risk_score,
                    "risk_level": self._get_risk_level(risk_score),
                }

                logger.info("AI analysis completed successfully")

            except Exception as e:
                logger.error(f"Error in AI analysis: {e}")
                analysis["ai_analysis"]["error"] = str(e)

        return analysis

    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level"""
        if risk_score >= 0.8:
            return "critical"
        elif risk_score >= 0.6:
            return "high"
        elif risk_score >= 0.4:
            return "medium"
        elif risk_score >= 0.2:
            return "low"
        else:
            return "minimal"

    async def batch_analyze(
        self,
        changes: List[Dict],
        use_ai: bool = True,
    ) -> List[Dict]:
        """
        Analyze multiple changes in batch

        Args:
            changes: List of changes to analyze
            use_ai: Whether to use AI

        Returns:
            List of analysis results
        """
        results = []

        for change in changes:
            try:
                analysis = await self.analyze_change(
                    change["old_content"],
                    change["new_content"],
                    change["regulation_context"],
                    use_ai=use_ai,
                )
                results.append(analysis)
            except Exception as e:
                logger.error(f"Error analyzing change {change.get('id')}: {e}")
                results.append(
                    {
                        "regulation_id": change.get("id"),
                        "error": str(e),
                        "analysis_date": datetime.utcnow().isoformat(),
                    }
                )

        return results

    async def compare_regulations(
        self, regulation1: Dict, regulation2: Dict
    ) -> Dict:
        """
        Compare two different regulations for similarity

        Args:
            regulation1: First regulation
            regulation2: Second regulation

        Returns:
            Comparison report
        """
        content1 = regulation1.get("content", "")
        content2 = regulation2.get("content", "")

        # Calculate similarity
        similarity = self.change_detector._calculate_similarity(content1, content2)

        # Get change statistics
        change_details = self.change_detector.detect_changes(content1, content2)

        return {
            "regulation1_id": regulation1.get("id"),
            "regulation2_id": regulation2.get("id"),
            "similarity_score": similarity,
            "difference_score": 1.0 - similarity,
            "change_statistics": change_details["statistics"],
            "comparison_date": datetime.utcnow().isoformat(),
        }

    async def generate_impact_report(
        self, change_analysis: Dict, business_context: Optional[Dict] = None
    ) -> Dict:
        """
        Generate detailed impact report

        Args:
            change_analysis: Analysis of change
            business_context: Optional business context

        Returns:
            Impact report
        """
        report = {
            "executive_summary": change_analysis.get("ai_analysis", {}).get(
                "summary", "No summary available"
            ),
            "change_overview": {
                "type": change_analysis["change_detection"]["type"],
                "severity": change_analysis["change_detection"]["severity"],
                "affected_sections": change_analysis["change_detection"][
                    "affected_sections"
                ],
            },
            "risk_assessment": change_analysis.get("risk_assessment", {}),
            "recommendations": change_analysis.get("recommendations", []),
            "key_points": change_analysis.get("ai_analysis", {}).get(
                "key_points", []
            ),
            "compliance_impact": change_analysis.get("ai_analysis", {}).get(
                "compliance_impact", {}
            ),
            "generated_at": datetime.utcnow().isoformat(),
        }

        # Add business context if provided
        if business_context:
            report["business_context"] = business_context

        return report

    async def identify_related_changes(
        self,
        change_id: str,
        all_changes: List[Dict],
        threshold: float = 0.7,
    ) -> List[str]:
        """
        Identify related changes based on content similarity

        Args:
            change_id: ID of the change
            all_changes: List of all changes
            threshold: Similarity threshold

        Returns:
            List of related change IDs
        """
        target_change = next(
            (c for c in all_changes if c.get("id") == change_id), None
        )
        if not target_change:
            return []

        target_content = target_change.get("new_content", "")
        related = []

        for change in all_changes:
            if change.get("id") == change_id:
                continue

            similarity = self.change_detector._calculate_similarity(
                target_content, change.get("new_content", "")
            )

            if similarity >= threshold:
                related.append(
                    {
                        "change_id": change.get("id"),
                        "similarity": similarity,
                    }
                )

        # Sort by similarity
        related.sort(key=lambda x: x["similarity"], reverse=True)

        return [r["change_id"] for r in related[:5]]  # Return top 5
