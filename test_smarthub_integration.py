"""
Unit tests for SmartHub Integration
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from smarthub_integration import SmartHubIntegration


class TestSmartHubIntegration:
    """Test cases for SmartHubIntegration"""
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_init_success(self, mock_load_dotenv, mock_chatgpt, mock_notion):
        """Test successful initialization"""
        hub = SmartHubIntegration(
            openai_api_key="test_openai_key",
            notion_api_key="test_notion_key",
            notion_database_id="test_db_id"
        )
        
        assert hub.chatgpt is not None
        assert hub.notion is not None
        mock_load_dotenv.assert_called_once()
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_generate_and_create_simple(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test simple content generation and creation"""
        # Setup mocks
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_chatgpt.generate_content.return_value = "Generated content"
        mock_notion.create_page.return_value = {"id": "page_123"}
        
        # Test
        hub = SmartHubIntegration()
        result = hub.generate_and_create("Test prompt")
        
        assert result["id"] == "page_123"
        mock_chatgpt.generate_content.assert_called_once()
        mock_notion.create_page.assert_called_once()
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_generate_and_create_structured(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test structured content generation and creation"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_chatgpt.generate_structured_content.return_value = {
            "Title": "Test Title",
            "Summary": "Test Summary"
        }
        mock_notion.create_page.return_value = {"id": "page_123"}
        
        hub = SmartHubIntegration()
        result = hub.generate_and_create(
            "Test prompt",
            property_mapping={"Title": "desc1", "Summary": "desc2"}
        )
        
        assert result["id"] == "page_123"
        mock_chatgpt.generate_structured_content.assert_called_once()
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_read_and_enhance(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test reading and enhancing a page"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_notion.read_page.return_value = {
            "id": "page_123",
            "properties": {"Content": "Original content"}
        }
        mock_chatgpt.generate_content.return_value = "Enhanced content"
        mock_notion.update_page.return_value = {"id": "page_123"}
        
        hub = SmartHubIntegration()
        result = hub.read_and_enhance(
            page_id="page_123",
            enhancement_prompt="Enhance this",
            target_property="Content"
        )
        
        assert result["id"] == "page_123"
        mock_notion.read_page.assert_called_once()
        mock_chatgpt.generate_content.assert_called_once()
        mock_notion.update_page.assert_called_once()
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_batch_generate_and_create(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test batch generation and creation"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_chatgpt.generate_content.return_value = "Generated content"
        mock_notion.create_page.side_effect = [
            {"id": "page_1"},
            {"id": "page_2"}
        ]
        
        hub = SmartHubIntegration()
        results = hub.batch_generate_and_create(["Prompt 1", "Prompt 2"])
        
        assert len(results) == 2
        assert results[0]["id"] == "page_1"
        assert results[1]["id"] == "page_2"
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_batch_generate_error_handling(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test batch generation with error handling"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_chatgpt.generate_content.side_effect = [
            "Generated content",
            Exception("API Error")
        ]
        mock_notion.create_page.return_value = {"id": "page_1"}
        
        hub = SmartHubIntegration()
        results = hub.batch_generate_and_create(["Prompt 1", "Prompt 2"])
        
        assert len(results) == 2
        assert results[0]["id"] == "page_1"
        assert "error" in results[1]
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_update_page_with_ai(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test updating page with AI-generated content"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_chatgpt.generate_content.side_effect = ["Content 1", "Content 2"]
        mock_notion.update_page.return_value = {"id": "page_123"}
        
        hub = SmartHubIntegration()
        result = hub.update_page_with_ai(
            page_id="page_123",
            updates={"Field1": "Prompt 1", "Field2": "Prompt 2"}
        )
        
        assert result["id"] == "page_123"
        assert mock_chatgpt.generate_content.call_count == 2
        mock_notion.update_page.assert_called_once()
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_delete_page(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test page deletion"""
        mock_notion = Mock()
        mock_notion_class.return_value = mock_notion
        
        mock_notion.delete_page.return_value = {"id": "page_123", "archived": True}
        
        hub = SmartHubIntegration()
        result = hub.delete_page("page_123")
        
        assert result["id"] == "page_123"
        assert result["archived"] == True
        mock_notion.delete_page.assert_called_once_with("page_123")
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_search_and_update(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test search and update functionality"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_notion.query_database.return_value = [
            {"id": "page_1", "properties": {"Title": "Page 1"}},
            {"id": "page_2", "properties": {"Title": "Page 2"}}
        ]
        mock_chatgpt.generate_content.side_effect = ["Content 1", "Content 2"]
        mock_notion.update_page.side_effect = [
            {"id": "page_1"},
            {"id": "page_2"}
        ]
        
        hub = SmartHubIntegration()
        results = hub.search_and_update(
            filter_conditions={"property": "Status"},
            update_prompt="Update content",
            target_property="Content"
        )
        
        assert len(results) == 2
        assert results[0]["id"] == "page_1"
        assert results[1]["id"] == "page_2"
        mock_notion.query_database.assert_called_once()
        assert mock_chatgpt.generate_content.call_count == 2
        assert mock_notion.update_page.call_count == 2
    
    @patch('smarthub_integration.NotionService')
    @patch('smarthub_integration.ChatGPTService')
    @patch('smarthub_integration.load_dotenv')
    def test_search_and_update_with_errors(self, mock_load_dotenv, mock_chatgpt_class, mock_notion_class):
        """Test search and update with error handling"""
        mock_chatgpt = Mock()
        mock_notion = Mock()
        mock_chatgpt_class.return_value = mock_chatgpt
        mock_notion_class.return_value = mock_notion
        
        mock_notion.query_database.return_value = [
            {"id": "page_1", "properties": {"Title": "Page 1"}},
            {"id": "page_2", "properties": {"Title": "Page 2"}}
        ]
        mock_chatgpt.generate_content.side_effect = ["Content 1", Exception("API Error")]
        mock_notion.update_page.return_value = {"id": "page_1"}
        
        hub = SmartHubIntegration()
        results = hub.search_and_update(
            filter_conditions={"property": "Status"},
            update_prompt="Update content",
            target_property="Content"
        )
        
        assert len(results) == 2
        assert results[0]["id"] == "page_1"
        assert "error" in results[1]
