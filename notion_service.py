"""
Notion Database Service Module
Handles CRUD operations with Notion databases
"""

from notion_client import Client
from typing import Optional, Dict, List, Any
import os


class NotionService:
    """Service class for interacting with Notion API"""
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        database_id: Optional[str] = None
    ):
        """
        Initialize Notion service
        
        Args:
            api_key: Notion API key. If not provided, uses NOTION_API_KEY env variable
            database_id: Notion database ID. If not provided, uses NOTION_DATABASE_ID env variable
        """
        self.api_key = api_key or os.getenv('NOTION_API_KEY')
        self.database_id = database_id or os.getenv('NOTION_DATABASE_ID')
        
        if not self.api_key:
            raise ValueError("Notion API key is required")
        if not self.database_id:
            raise ValueError("Notion database ID is required")
        
        self.client = Client(auth=self.api_key)
    
    def create_page(self, properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new page in the Notion database
        
        Args:
            properties: Dictionary of properties to set for the page
                       Format: {field_name: value}
                       
        Returns:
            Created page object
        """
        try:
            # Convert properties to Notion format
            notion_properties = self._convert_to_notion_properties(properties)
            
            response = self.client.pages.create(
                parent={"database_id": self.database_id},
                properties=notion_properties
            )
            
            return response
        except Exception as e:
            raise Exception(f"Error creating Notion page: {str(e)}")
    
    def read_page(self, page_id: str) -> Dict[str, Any]:
        """
        Read a page from Notion
        
        Args:
            page_id: The ID of the page to read
            
        Returns:
            Page object with properties
        """
        try:
            response = self.client.pages.retrieve(page_id=page_id)
            return self._convert_from_notion_properties(response)
        except Exception as e:
            raise Exception(f"Error reading Notion page: {str(e)}")
    
    def update_page(self, page_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing page in Notion
        
        Args:
            page_id: The ID of the page to update
            properties: Dictionary of properties to update
                       
        Returns:
            Updated page object
        """
        try:
            notion_properties = self._convert_to_notion_properties(properties)
            
            response = self.client.pages.update(
                page_id=page_id,
                properties=notion_properties
            )
            
            return response
        except Exception as e:
            raise Exception(f"Error updating Notion page: {str(e)}")
    
    def delete_page(self, page_id: str) -> Dict[str, Any]:
        """
        Delete (archive) a page in Notion
        
        Args:
            page_id: The ID of the page to delete
            
        Returns:
            Archived page object
        """
        try:
            response = self.client.pages.update(
                page_id=page_id,
                archived=True
            )
            
            return response
        except Exception as e:
            raise Exception(f"Error deleting Notion page: {str(e)}")
    
    def query_database(
        self, 
        filter_conditions: Optional[Dict[str, Any]] = None,
        sorts: Optional[List[Dict[str, str]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Query the Notion database
        
        Args:
            filter_conditions: Optional filter conditions
            sorts: Optional sort conditions
            
        Returns:
            List of pages matching the query
        """
        try:
            query_params = {
                "database_id": self.database_id
            }
            
            if filter_conditions:
                query_params["filter"] = filter_conditions
            
            if sorts:
                query_params["sorts"] = sorts
            
            response = self.client.databases.query(**query_params)
            
            # Convert results
            results = []
            for page in response.get("results", []):
                results.append(self._convert_from_notion_properties(page))
            
            return results
        except Exception as e:
            raise Exception(f"Error querying Notion database: {str(e)}")
    
    def _convert_to_notion_properties(self, properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert simple property dictionary to Notion format
        
        Args:
            properties: Dictionary with simple key-value pairs
            
        Returns:
            Dictionary in Notion properties format
        """
        notion_properties = {}
        
        for key, value in properties.items():
            if isinstance(value, str):
                # Text property
                notion_properties[key] = {
                    "rich_text": [
                        {
                            "text": {
                                "content": value
                            }
                        }
                    ]
                }
            elif isinstance(value, bool):
                # Checkbox property
                notion_properties[key] = {
                    "checkbox": value
                }
            elif isinstance(value, (int, float)):
                # Number property
                notion_properties[key] = {
                    "number": value
                }
            elif isinstance(value, list):
                # Multi-select or select property
                notion_properties[key] = {
                    "multi_select": [{"name": str(item)} for item in value]
                }
            else:
                # Default to rich text
                notion_properties[key] = {
                    "rich_text": [
                        {
                            "text": {
                                "content": str(value)
                            }
                        }
                    ]
                }
        
        return notion_properties
    
    def _convert_from_notion_properties(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert Notion page properties to simple dictionary
        
        Args:
            page: Notion page object
            
        Returns:
            Simplified dictionary with property values
        """
        result = {
            "id": page.get("id"),
            "created_time": page.get("created_time"),
            "last_edited_time": page.get("last_edited_time"),
            "properties": {}
        }
        
        properties = page.get("properties", {})
        
        for key, value in properties.items():
            prop_type = value.get("type")
            
            if prop_type == "title":
                title_list = value.get("title", [])
                result["properties"][key] = "".join([t.get("plain_text", "") for t in title_list])
            elif prop_type == "rich_text":
                text_list = value.get("rich_text", [])
                result["properties"][key] = "".join([t.get("plain_text", "") for t in text_list])
            elif prop_type == "number":
                result["properties"][key] = value.get("number")
            elif prop_type == "checkbox":
                result["properties"][key] = value.get("checkbox")
            elif prop_type == "select":
                select_value = value.get("select")
                result["properties"][key] = select_value.get("name") if select_value else None
            elif prop_type == "multi_select":
                multi_select = value.get("multi_select", [])
                result["properties"][key] = [item.get("name") for item in multi_select]
            else:
                result["properties"][key] = value
        
        return result
