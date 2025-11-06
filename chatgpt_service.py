"""
ChatGPT Service Module
Handles interactions with OpenAI's ChatGPT API
"""

from openai import OpenAI
from typing import Optional, List, Dict
import os


class ChatGPTService:
    """Service class for interacting with ChatGPT API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize ChatGPT service
        
        Args:
            api_key: OpenAI API key. If not provided, uses OPENAI_API_KEY env variable
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = OpenAI(api_key=self.api_key)
        
    def generate_content(
        self, 
        prompt: str, 
        model: str = "gpt-3.5-turbo",
        max_tokens: Optional[int] = None,
        temperature: float = 0.7
    ) -> str:
        """
        Generate content using ChatGPT
        
        Args:
            prompt: The prompt to send to ChatGPT
            model: The model to use (default: gpt-3.5-turbo)
            max_tokens: Maximum tokens in response
            temperature: Creativity level (0.0 to 2.0)
            
        Returns:
            Generated text content
        """
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating content with ChatGPT: {str(e)}")
    
    def generate_structured_content(
        self,
        prompt: str,
        fields: List[str],
        model: str = "gpt-3.5-turbo"
    ) -> Dict[str, str]:
        """
        Generate structured content based on specified fields
        
        Args:
            prompt: The base prompt
            fields: List of field names to generate content for
            model: The model to use
            
        Returns:
            Dictionary with field names as keys and generated content as values
        """
        structured_prompt = f"{prompt}\n\nPlease provide the following information:\n"
        for field in fields:
            structured_prompt += f"- {field}\n"
        structured_prompt += "\nFormat your response as a list with each field clearly labeled."
        
        response = self.generate_content(structured_prompt, model=model)
        
        # Parse the response into a dictionary
        result = {}
        lines = response.strip().split('\n')
        current_field = None
        current_content = []
        
        for line in lines:
            # Try to match field names
            matched_field = None
            for field in fields:
                if field.lower() in line.lower() and ':' in line:
                    matched_field = field
                    break
            
            if matched_field:
                if current_field:
                    result[current_field] = ' '.join(current_content).strip()
                current_field = matched_field
                # Get content after the colon
                content = line.split(':', 1)[1].strip() if ':' in line else ''
                current_content = [content] if content else []
            elif current_field:
                current_content.append(line.strip())
        
        # Add the last field
        if current_field:
            result[current_field] = ' '.join(current_content).strip()
        
        return result
