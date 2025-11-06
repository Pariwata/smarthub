"""
Unit tests for Notion Service
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from notion_service import NotionService


class TestNotionService:
    """Test cases for NotionService"""
    
    def test_init_with_credentials(self):
        """Test initialization with API key and database ID"""
        service = NotionService(api_key="test_key", database_id="test_db_id")
        assert service.api_key == "test_key"
        assert service.database_id == "test_db_id"
    
    def test_init_without_api_key_raises_error(self):
        """Test initialization without API key raises ValueError"""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="Notion API key is required"):
                NotionService(database_id="test_db")
    
    def test_init_without_database_id_raises_error(self):
        """Test initialization without database ID raises ValueError"""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="Notion database ID is required"):
                NotionService(api_key="test_key")
    
    @patch.dict('os.environ', {
        'NOTION_API_KEY': 'env_key',
        'NOTION_DATABASE_ID': 'env_db_id'
    })
    def test_init_with_env_variables(self):
        """Test initialization using environment variables"""
        service = NotionService()
        assert service.api_key == "env_key"
        assert service.database_id == "env_db_id"
    
    @patch('notion_service.Client')
    def test_create_page_success(self, mock_client_class):
        """Test successful page creation"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        
        mock_response = {"id": "page_123", "created_time": "2024-01-01"}
        mock_client.pages.create.return_value = mock_response
        
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service.create_page({"Title": "Test Title"})
        
        assert result["id"] == "page_123"
        mock_client.pages.create.assert_called_once()
    
    @patch('notion_service.Client')
    def test_create_page_error_handling(self, mock_client_class):
        """Test error handling in page creation"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.pages.create.side_effect = Exception("API Error")
        
        service = NotionService(api_key="test_key", database_id="test_db")
        
        with pytest.raises(Exception, match="Error creating Notion page"):
            service.create_page({"Title": "Test"})
    
    @patch('notion_service.Client')
    def test_read_page_success(self, mock_client_class):
        """Test successful page reading"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        
        mock_response = {
            "id": "page_123",
            "properties": {
                "Title": {
                    "type": "title",
                    "title": [{"plain_text": "Test Title"}]
                }
            }
        }
        mock_client.pages.retrieve.return_value = mock_response
        
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service.read_page("page_123")
        
        assert result["id"] == "page_123"
        assert "properties" in result
    
    @patch('notion_service.Client')
    def test_update_page_success(self, mock_client_class):
        """Test successful page update"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        
        mock_response = {"id": "page_123", "last_edited_time": "2024-01-01"}
        mock_client.pages.update.return_value = mock_response
        
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service.update_page("page_123", {"Title": "Updated Title"})
        
        assert result["id"] == "page_123"
        mock_client.pages.update.assert_called_once()
    
    @patch('notion_service.Client')
    def test_delete_page_success(self, mock_client_class):
        """Test successful page deletion"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        
        mock_response = {"id": "page_123", "archived": True}
        mock_client.pages.update.return_value = mock_response
        
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service.delete_page("page_123")
        
        assert result["id"] == "page_123"
        assert result["archived"] == True
    
    @patch('notion_service.Client')
    def test_query_database_success(self, mock_client_class):
        """Test successful database query"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        
        mock_response = {
            "results": [
                {
                    "id": "page_1",
                    "properties": {
                        "Title": {
                            "type": "title",
                            "title": [{"plain_text": "Page 1"}]
                        }
                    }
                }
            ]
        }
        mock_client.databases.query.return_value = mock_response
        
        service = NotionService(api_key="test_key", database_id="test_db")
        results = service.query_database()
        
        assert len(results) == 1
        assert results[0]["id"] == "page_1"
    
    def test_convert_to_notion_properties_text(self):
        """Test conversion of text properties"""
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service._convert_to_notion_properties({"Title": "Test"})
        
        assert "Title" in result
        assert result["Title"]["rich_text"][0]["text"]["content"] == "Test"
    
    def test_convert_to_notion_properties_number(self):
        """Test conversion of number properties"""
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service._convert_to_notion_properties({"Count": 42})
        
        assert "Count" in result
        assert result["Count"]["number"] == 42
    
    def test_convert_to_notion_properties_checkbox(self):
        """Test conversion of checkbox properties"""
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service._convert_to_notion_properties({"Done": True})
        
        assert "Done" in result
        assert result["Done"]["checkbox"] == True
    
    def test_convert_to_notion_properties_list(self):
        """Test conversion of list properties"""
        service = NotionService(api_key="test_key", database_id="test_db")
        result = service._convert_to_notion_properties({"Tags": ["tag1", "tag2"]})
        
        assert "Tags" in result
        assert result["Tags"]["multi_select"][0]["name"] == "tag1"
        assert result["Tags"]["multi_select"][1]["name"] == "tag2"
    
    def test_convert_from_notion_properties_title(self):
        """Test conversion from Notion title property"""
        service = NotionService(api_key="test_key", database_id="test_db")
        
        page = {
            "id": "page_123",
            "properties": {
                "Title": {
                    "type": "title",
                    "title": [{"plain_text": "Test Title"}]
                }
            }
        }
        
        result = service._convert_from_notion_properties(page)
        assert result["properties"]["Title"] == "Test Title"
    
    def test_convert_from_notion_properties_rich_text(self):
        """Test conversion from Notion rich text property"""
        service = NotionService(api_key="test_key", database_id="test_db")
        
        page = {
            "id": "page_123",
            "properties": {
                "Content": {
                    "type": "rich_text",
                    "rich_text": [{"plain_text": "Test Content"}]
                }
            }
        }
        
        result = service._convert_from_notion_properties(page)
        assert result["properties"]["Content"] == "Test Content"
    
    def test_convert_from_notion_properties_number(self):
        """Test conversion from Notion number property"""
        service = NotionService(api_key="test_key", database_id="test_db")
        
        page = {
            "id": "page_123",
            "properties": {
                "Count": {
                    "type": "number",
                    "number": 42
                }
            }
        }
        
        result = service._convert_from_notion_properties(page)
        assert result["properties"]["Count"] == 42
