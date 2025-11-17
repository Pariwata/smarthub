"""
AI Service for Intelligent Analysis
Uses LLMs to provide intelligent insights on regulatory changes
"""
from typing import List, Dict, Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import json
import logging

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered regulatory analysis"""

    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None,
        model: str = "gpt-4-turbo-preview",
        max_tokens: int = 4096,
        temperature: float = 0.3,
    ):
        """
        Initialize AI Service

        Args:
            openai_api_key: OpenAI API key
            anthropic_api_key: Anthropic API key
            model: Model to use
            max_tokens: Maximum tokens for responses
            temperature: Temperature for generation
        """
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature

        # Initialize clients
        if openai_api_key:
            self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        if anthropic_api_key:
            self.anthropic_client = AsyncAnthropic(api_key=anthropic_api_key)

    async def summarize_change(
        self, old_content: str, new_content: str, change_details: Dict
    ) -> str:
        """
        Generate AI summary of regulatory change

        Args:
            old_content: Previous version
            new_content: New version
            change_details: Details from change detection

        Returns:
            AI-generated summary
        """
        prompt = f"""You are a legal and regulatory compliance expert. Analyze the following regulatory change and provide a concise summary.

OLD VERSION:
{old_content[:2000]}...

NEW VERSION:
{new_content[:2000]}...

CHANGE STATISTICS:
- Type: {change_details.get('change_type', 'N/A')}
- Severity: {change_details.get('severity', 'N/A')}
- Sections affected: {len(change_details.get('sections', []))}

Provide a 2-3 paragraph summary focusing on:
1. What changed
2. Why it matters
3. Potential business impact

Summary:"""

        try:
            if self.openai_api_key:
                response = await self._call_openai(prompt)
            elif self.anthropic_api_key:
                response = await self._call_anthropic(prompt)
            else:
                return "AI service not configured"

            return response
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return f"Error generating summary: {str(e)}"

    async def extract_key_points(
        self, change_summary: str, change_details: Dict
    ) -> List[str]:
        """
        Extract key points from regulatory change

        Args:
            change_summary: Summary of change
            change_details: Change details

        Returns:
            List of key points
        """
        prompt = f"""Extract 3-5 key points from this regulatory change summary:

{change_summary}

CHANGE DETAILS:
{json.dumps(change_details.get('statistics', {}), indent=2)}

Provide key points as a JSON array of strings. Focus on actionable insights.

Format: ["point 1", "point 2", "point 3"]"""

        try:
            if self.openai_api_key:
                response = await self._call_openai(prompt)
            elif self.anthropic_api_key:
                response = await self._call_anthropic(prompt)
            else:
                return []

            # Parse JSON response
            key_points = json.loads(response)
            return key_points if isinstance(key_points, list) else []

        except Exception as e:
            logger.error(f"Error extracting key points: {e}")
            return []

    async def generate_recommendations(
        self, change_details: Dict, regulation_context: Dict
    ) -> List[Dict]:
        """
        Generate compliance recommendations

        Args:
            change_details: Change analysis details
            regulation_context: Context about the regulation

        Returns:
            List of recommendations
        """
        prompt = f"""As a compliance advisor, provide actionable recommendations for this regulatory change:

REGULATION: {regulation_context.get('title', 'N/A')}
JURISDICTION: {regulation_context.get('jurisdiction', 'N/A')}
CHANGE TYPE: {change_details.get('change_type', 'N/A')}
SEVERITY: {change_details.get('severity', 'N/A')}

Provide 3-5 specific recommendations in JSON format:
[
  {{
    "priority": "high|medium|low",
    "action": "description of action",
    "timeline": "suggested timeline",
    "stakeholders": ["role1", "role2"]
  }}
]"""

        try:
            if self.openai_api_key:
                response = await self._call_openai(prompt)
            elif self.anthropic_api_key:
                response = await self._call_anthropic(prompt)
            else:
                return []

            recommendations = json.loads(response)
            return recommendations if isinstance(recommendations, list) else []

        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []

    async def analyze_compliance_impact(
        self, change_details: Dict, business_context: Optional[Dict] = None
    ) -> Dict:
        """
        Analyze compliance impact of change

        Args:
            change_details: Change details
            business_context: Optional business context

        Returns:
            Compliance impact analysis
        """
        context_str = (
            json.dumps(business_context, indent=2) if business_context else "N/A"
        )

        prompt = f"""Analyze the compliance impact of this regulatory change:

CHANGE DETAILS:
{json.dumps(change_details, indent=2)}

BUSINESS CONTEXT:
{context_str}

Provide analysis in JSON format:
{{
  "impact_level": "critical|high|medium|low",
  "affected_areas": ["area1", "area2"],
  "compliance_requirements": ["req1", "req2"],
  "estimated_effort": "description",
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}}"""

        try:
            if self.openai_api_key:
                response = await self._call_openai(prompt)
            elif self.anthropic_api_key:
                response = await self._call_anthropic(prompt)
            else:
                return {}

            impact = json.loads(response)
            return impact if isinstance(impact, dict) else {}

        except Exception as e:
            logger.error(f"Error analyzing compliance impact: {e}")
            return {}

    async def calculate_risk_score(
        self, change_details: Dict, historical_data: Optional[List[Dict]] = None
    ) -> float:
        """
        Calculate risk score for regulatory change

        Args:
            change_details: Change details
            historical_data: Optional historical change data

        Returns:
            Risk score (0.0 to 1.0)
        """
        # Base risk score on severity
        severity_scores = {
            "critical": 0.9,
            "high": 0.7,
            "medium": 0.5,
            "low": 0.3,
            "informational": 0.1,
        }

        base_score = severity_scores.get(
            change_details.get("severity", "medium"), 0.5
        )

        # Adjust based on change type
        type_multipliers = {
            "removal": 1.2,
            "modification": 1.0,
            "addition": 0.8,
            "clarification": 0.6,
        }

        multiplier = type_multipliers.get(
            change_details.get("change_type", "modification"), 1.0
        )

        # Calculate final score
        risk_score = min(base_score * multiplier, 1.0)

        return round(risk_score, 2)

    async def identify_dependencies(
        self, regulation_content: str, all_regulations: List[Dict]
    ) -> List[str]:
        """
        Identify related regulations using semantic similarity

        Args:
            regulation_content: Content to analyze
            all_regulations: List of all regulations

        Returns:
            List of related regulation IDs
        """
        # This is a simplified implementation
        # In production, use embeddings and vector similarity
        related = []

        # Extract key terms from regulation
        key_terms = set(regulation_content.lower().split())

        for reg in all_regulations:
            reg_terms = set(reg.get("content", "").lower().split())
            overlap = len(key_terms.intersection(reg_terms))

            if overlap > 50:  # Threshold for similarity
                related.append(reg.get("id"))

        return related[:5]  # Return top 5

    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        response = await self.openai_client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a legal and regulatory compliance expert.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
        )
        return response.choices[0].message.content.strip()

    async def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic API"""
        response = await self.anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text.strip()
