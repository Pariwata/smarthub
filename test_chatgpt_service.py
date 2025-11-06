"""
Unit tests for ChatGPT Service
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from chatgpt_service import ChatGPTService


class TestChatGPTService:
    """Test cases for ChatGPTService"""
    
    def test_init_with_api_key(self):
        """Test initialization with API key"""
        service = ChatGPTService(api_key="test_key")
        assert service.api_key == "test_key"
    
    def test_init_without_api_key_raises_error(self):
        """Test initialization without API key raises ValueError"""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="OpenAI API key is required"):
                ChatGPTService()
    
    @patch.dict('os.environ', {'OPENAI_API_KEY': 'env_test_key'})
    def test_init_with_env_variable(self):
        """Test initialization using environment variable"""
        service = ChatGPTService()
        assert service.api_key == "env_test_key"
    
    @patch('chatgpt_service.OpenAI')
    def test_generate_content_success(self, mock_openai):
        """Test successful content generation"""
        # Setup mock
        mock_client = Mock()
        mock_openai.return_value = mock_client
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Generated content"
        mock_client.chat.completions.create.return_value = mock_response
        
        # Test
        service = ChatGPTService(api_key="test_key")
        result = service.generate_content("Test prompt")
        
        assert result == "Generated content"
        mock_client.chat.completions.create.assert_called_once()
    
    @patch('chatgpt_service.OpenAI')
    def test_generate_content_with_parameters(self, mock_openai):
        """Test content generation with custom parameters"""
        mock_client = Mock()
        mock_openai.return_value = mock_client
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Generated content"
        mock_client.chat.completions.create.return_value = mock_response
        
        service = ChatGPTService(api_key="test_key")
        service.generate_content(
            "Test prompt",
            model="gpt-4",
            max_tokens=100,
            temperature=0.5
        )
        
        call_args = mock_client.chat.completions.create.call_args[1]
        assert call_args['model'] == "gpt-4"
        assert call_args['max_tokens'] == 100
        assert call_args['temperature'] == 0.5
    
    @patch('chatgpt_service.OpenAI')
    def test_generate_content_error_handling(self, mock_openai):
        """Test error handling in content generation"""
        mock_client = Mock()
        mock_openai.return_value = mock_client
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        
        service = ChatGPTService(api_key="test_key")
        
        with pytest.raises(Exception, match="Error generating content with ChatGPT"):
            service.generate_content("Test prompt")
    
    @patch('chatgpt_service.OpenAI')
    def test_generate_structured_content(self, mock_openai):
        """Test structured content generation"""
        mock_client = Mock()
        mock_openai.return_value = mock_client
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = """
        Title: Test Title
        Summary: Test Summary
        Category: Test Category
        """
        mock_client.chat.completions.create.return_value = mock_response
        
        service = ChatGPTService(api_key="test_key")
        result = service.generate_structured_content(
            "Test prompt",
            ["Title", "Summary", "Category"]
        )
        
        assert isinstance(result, dict)
        assert "Title" in result
        assert "Summary" in result
        assert "Category" in result
    
    @patch('chatgpt_service.OpenAI')
    def test_generate_structured_content_with_model(self, mock_openai):
        """Test structured content generation with custom model"""
        mock_client = Mock()
        mock_openai.return_value = mock_client
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Field: Value"
        mock_client.chat.completions.create.return_value = mock_response
        
        service = ChatGPTService(api_key="test_key")
        service.generate_structured_content(
            "Test prompt",
            ["Field"],
            model="gpt-4"
        )
        
        # Verify the model parameter was passed
        call_args = mock_client.chat.completions.create.call_args[1]
        assert call_args['model'] == "gpt-4"
