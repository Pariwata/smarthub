"""
SmartHub Integration Service
Connects ChatGPT with Notion for automated content generation and management
"""

from chatgpt_service import ChatGPTService
from notion_service import NotionService
from typing import Optional, Dict, List, Any
import os
from dotenv import load_dotenv


class SmartHubIntegration:
    """Main integration service connecting ChatGPT and Notion"""
    
    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        notion_api_key: Optional[str] = None,
        notion_database_id: Optional[str] = None
    ):
        """
        Initialize SmartHub integration
        
        Args:
            openai_api_key: OpenAI API key
            notion_api_key: Notion API key
            notion_database_id: Notion database ID
        """
        # Load environment variables
        load_dotenv()
        
        # Initialize services
        self.chatgpt = ChatGPTService(api_key=openai_api_key)
        self.notion = NotionService(
            api_key=notion_api_key,
            database_id=notion_database_id
        )
    
    def generate_and_create(
        self,
        prompt: str,
        property_mapping: Optional[Dict[str, str]] = None,
        model: str = "gpt-3.5-turbo"
    ) -> Dict[str, Any]:
        """
        Generate content with ChatGPT and create a new page in Notion
        
        Args:
            prompt: The prompt to send to ChatGPT
            property_mapping: Optional mapping of Notion properties to include
                            Format: {notion_field_name: description}
            model: ChatGPT model to use
            
        Returns:
            Created Notion page object
        """
        # Generate content
        if property_mapping:
            # Generate structured content for multiple fields
            fields = list(property_mapping.keys())
            enhanced_prompt = f"{prompt}\n\nGenerate content for: {', '.join(fields)}"
            content = self.chatgpt.generate_structured_content(
                enhanced_prompt,
                fields,
                model=model
            )
        else:
            # Generate simple content
            content = {"Content": self.chatgpt.generate_content(prompt, model=model)}
        
        # Create Notion page
        notion_page = self.notion.create_page(content)
        
        return notion_page
    
    def read_and_enhance(
        self,
        page_id: str,
        enhancement_prompt: str,
        target_property: str,
        model: str = "gpt-3.5-turbo"
    ) -> Dict[str, Any]:
        """
        Read a Notion page, enhance it with ChatGPT, and update it
        
        Args:
            page_id: The ID of the Notion page to read
            enhancement_prompt: Prompt for ChatGPT enhancement
            target_property: The property to update with enhanced content
            model: ChatGPT model to use
            
        Returns:
            Updated Notion page object
        """
        # Read existing page
        page_data = self.notion.read_page(page_id)
        
        # Extract current content
        current_content = str(page_data.get("properties", {}))
        
        # Generate enhancement
        full_prompt = f"{enhancement_prompt}\n\nCurrent content: {current_content}"
        enhanced_content = self.chatgpt.generate_content(full_prompt, model=model)
        
        # Update the page
        updated_page = self.notion.update_page(
            page_id,
            {target_property: enhanced_content}
        )
        
        return updated_page
    
    def batch_generate_and_create(
        self,
        prompts: List[str],
        property_mapping: Optional[Dict[str, str]] = None,
        model: str = "gpt-3.5-turbo"
    ) -> List[Dict[str, Any]]:
        """
        Generate multiple contents and create multiple Notion pages
        
        Args:
            prompts: List of prompts to process
            property_mapping: Optional property mapping for structured content
            model: ChatGPT model to use
            
        Returns:
            List of created Notion page objects
        """
        results = []
        
        for prompt in prompts:
            try:
                page = self.generate_and_create(prompt, property_mapping, model)
                results.append(page)
            except Exception as e:
                print(f"Error processing prompt '{prompt[:50]}...': {str(e)}")
                results.append({"error": str(e), "prompt": prompt})
        
        return results
    
    def update_page_with_ai(
        self,
        page_id: str,
        updates: Dict[str, str],
        model: str = "gpt-3.5-turbo"
    ) -> Dict[str, Any]:
        """
        Update a Notion page with AI-generated content for specific fields
        
        Args:
            page_id: The ID of the page to update
            updates: Dictionary mapping property names to prompts
                    Format: {property_name: prompt_for_that_property}
            model: ChatGPT model to use
            
        Returns:
            Updated Notion page object
        """
        generated_content = {}
        
        # Generate content for each field
        for property_name, prompt in updates.items():
            content = self.chatgpt.generate_content(prompt, model=model)
            generated_content[property_name] = content
        
        # Update the page
        updated_page = self.notion.update_page(page_id, generated_content)
        
        return updated_page
    
    def delete_page(self, page_id: str) -> Dict[str, Any]:
        """
        Delete (archive) a page in Notion
        
        Args:
            page_id: The ID of the page to delete
            
        Returns:
            Archived page object
        """
        return self.notion.delete_page(page_id)
    
    def search_and_update(
        self,
        filter_conditions: Dict[str, Any],
        update_prompt: str,
        target_property: str,
        model: str = "gpt-3.5-turbo"
    ) -> List[Dict[str, Any]]:
        """
        Search for pages in Notion and update them with AI-generated content
        
        Args:
            filter_conditions: Filter conditions for database query
            update_prompt: Prompt for generating update content
            target_property: Property to update
            model: ChatGPT model to use
            
        Returns:
            List of updated page objects
        """
        # Query database
        pages = self.notion.query_database(filter_conditions=filter_conditions)
        
        results = []
        for page in pages:
            try:
                page_id = page.get("id")
                # Generate content based on existing page data
                context = str(page.get("properties", {}))
                full_prompt = f"{update_prompt}\n\nContext: {context}"
                new_content = self.chatgpt.generate_content(full_prompt, model=model)
                
                # Update page
                updated_page = self.notion.update_page(
                    page_id,
                    {target_property: new_content}
                )
                results.append(updated_page)
            except Exception as e:
                print(f"Error updating page {page.get('id')}: {str(e)}")
                results.append({"error": str(e), "page_id": page.get("id")})
        
        return results
