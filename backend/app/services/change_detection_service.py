"""
Change Detection Service
Core service for detecting and analyzing changes in regulations
"""
import difflib
from datetime import datetime
from typing import List, Dict, Tuple, Optional
from diff_match_patch import diff_match_patch
import re


class ChangeDetectionService:
    """Service for detecting changes between regulation versions"""

    def __init__(self):
        self.dmp = diff_match_patch()
        self.dmp.Diff_Timeout = 0  # No timeout for diff

    def detect_changes(
        self, old_content: str, new_content: str
    ) -> Dict[str, any]:
        """
        Detect changes between two versions of regulation content

        Args:
            old_content: Previous version content
            new_content: New version content

        Returns:
            Dictionary containing change analysis
        """
        # Perform diff analysis
        diffs = self.dmp.diff_main(old_content, new_content)
        self.dmp.diff_cleanupSemantic(diffs)

        # Calculate statistics
        stats = self._calculate_change_stats(diffs)

        # Extract changed sections
        sections = self._extract_changed_sections(diffs, old_content, new_content)

        # Determine change type
        change_type = self._determine_change_type(stats)

        # Calculate change severity
        severity = self._calculate_severity(stats, sections)

        return {
            "change_type": change_type,
            "severity": severity,
            "statistics": stats,
            "sections": sections,
            "raw_diff": self._format_diff(diffs),
            "similarity_score": self._calculate_similarity(old_content, new_content),
        }

    def _calculate_change_stats(self, diffs: List[Tuple]) -> Dict[str, int]:
        """Calculate statistics about the changes"""
        stats = {
            "additions": 0,
            "deletions": 0,
            "modifications": 0,
            "total_chars_added": 0,
            "total_chars_deleted": 0,
        }

        for op, text in diffs:
            if op == 1:  # Addition
                stats["additions"] += 1
                stats["total_chars_added"] += len(text)
            elif op == -1:  # Deletion
                stats["deletions"] += 1
                stats["total_chars_deleted"] += len(text)

        stats["modifications"] = min(stats["additions"], stats["deletions"])

        return stats

    def _extract_changed_sections(
        self, diffs: List[Tuple], old_content: str, new_content: str
    ) -> List[Dict]:
        """Extract specific sections that changed"""
        sections = []

        # Split content into logical sections (paragraphs, articles, etc.)
        old_sections = self._split_into_sections(old_content)
        new_sections = self._split_into_sections(new_content)

        # Find matching sections
        matcher = difflib.SequenceMatcher(None, old_sections, new_sections)

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag != "equal":
                sections.append(
                    {
                        "type": tag,
                        "old_section": old_sections[i1:i2] if i1 < i2 else [],
                        "new_section": new_sections[j1:j2] if j1 < j2 else [],
                        "section_number": i1,
                    }
                )

        return sections

    def _split_into_sections(self, content: str) -> List[str]:
        """Split content into logical sections"""
        # Split by double newlines (paragraphs)
        sections = re.split(r"\n\n+", content)

        # Also try to identify numbered sections
        section_pattern = r"(?:Section|Article|§|Chapter)\s+\d+"
        numbered_sections = []

        current_section = []
        for line in content.split("\n"):
            if re.match(section_pattern, line, re.IGNORECASE):
                if current_section:
                    numbered_sections.append("\n".join(current_section))
                current_section = [line]
            else:
                current_section.append(line)

        if current_section:
            numbered_sections.append("\n".join(current_section))

        # Use numbered sections if found, otherwise use paragraphs
        return numbered_sections if len(numbered_sections) > 1 else sections

    def _determine_change_type(self, stats: Dict) -> str:
        """Determine the primary type of change"""
        additions = stats["total_chars_added"]
        deletions = stats["total_chars_deleted"]

        if additions > deletions * 2:
            return "addition"
        elif deletions > additions * 2:
            return "removal"
        elif additions > 0 or deletions > 0:
            return "modification"
        else:
            return "clarification"

    def _calculate_severity(
        self, stats: Dict, sections: List[Dict]
    ) -> str:
        """Calculate severity of changes"""
        total_changes = stats["total_chars_added"] + stats["total_chars_deleted"]
        num_sections = len(sections)

        # Severity thresholds
        if total_changes > 5000 or num_sections > 10:
            return "critical"
        elif total_changes > 2000 or num_sections > 5:
            return "high"
        elif total_changes > 500 or num_sections > 2:
            return "medium"
        elif total_changes > 0:
            return "low"
        else:
            return "informational"

    def _format_diff(self, diffs: List[Tuple]) -> List[Dict]:
        """Format diff for human readability"""
        formatted = []
        for op, text in diffs:
            if op == 1:
                formatted.append({"type": "addition", "text": text})
            elif op == -1:
                formatted.append({"type": "deletion", "text": text})
            else:
                formatted.append({"type": "unchanged", "text": text})
        return formatted

    def _calculate_similarity(self, old_content: str, new_content: str) -> float:
        """Calculate similarity score between two texts"""
        matcher = difflib.SequenceMatcher(None, old_content, new_content)
        return matcher.ratio()

    def identify_affected_sections(
        self, content: str, change_sections: List[Dict]
    ) -> List[str]:
        """
        Identify sections affected by changes

        Args:
            content: Full regulation content
            change_sections: List of changed sections

        Returns:
            List of affected section identifiers
        """
        affected = []

        # Pattern for section identifiers
        section_patterns = [
            r"Section\s+(\d+(?:\.\d+)*)",
            r"Article\s+(\d+(?:\.\d+)*)",
            r"§\s*(\d+(?:\.\d+)*)",
            r"Chapter\s+(\d+(?:\.\d+)*)",
        ]

        for section in change_sections:
            for section_text in section.get("new_section", []):
                for pattern in section_patterns:
                    matches = re.findall(pattern, section_text, re.IGNORECASE)
                    affected.extend(matches)

        return list(set(affected))  # Remove duplicates

    def compare_versions(
        self,
        old_version: str,
        new_version: str,
        regulation_id: str = None,
    ) -> Dict:
        """
        Compare two versions and generate comprehensive change report

        Args:
            old_version: Old version content
            new_version: New version content
            regulation_id: Optional regulation ID for reference

        Returns:
            Comprehensive change report
        """
        changes = self.detect_changes(old_version, new_version)
        affected_sections = self.identify_affected_sections(
            new_version, changes["sections"]
        )

        report = {
            "regulation_id": regulation_id,
            "comparison_date": datetime.utcnow().isoformat(),
            "change_summary": {
                "type": changes["change_type"],
                "severity": changes["severity"],
                "similarity": changes["similarity_score"],
                "affected_sections": affected_sections,
            },
            "statistics": changes["statistics"],
            "detailed_changes": changes["sections"],
            "diff": changes["raw_diff"],
        }

        return report

    def calculate_change_score(
        self, old_content: str, new_content: str
    ) -> float:
        """
        Calculate a change score (0.0 to 1.0)
        0.0 = no change, 1.0 = complete change

        Args:
            old_content: Old content
            new_content: New content

        Returns:
            Change score as float
        """
        similarity = self._calculate_similarity(old_content, new_content)
        return 1.0 - similarity
