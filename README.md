# SmartHub - ChatGPT to Notion Integration

SmartHub is a Python-based integration service that connects OpenAI's ChatGPT with Notion databases. It enables automatic content generation using AI and seamlessly updates Notion databases with CRUD operations (Create, Read, Update, Delete).

## Features

- 🤖 **AI-Powered Content Generation**: Leverage ChatGPT to generate high-quality content
- 📝 **Full CRUD Operations**: Create, read, update, and delete Notion pages programmatically
- 🔄 **Batch Processing**: Generate and update multiple pages at once
- 🎯 **Structured Content**: Generate content for multiple fields simultaneously
- 🔍 **Smart Search & Update**: Query databases and update matching pages with AI-generated content
- 🛠️ **Easy Configuration**: Simple environment-based configuration

## Prerequisites

- Python 3.7 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Notion API key ([Create integration here](https://www.notion.so/my-integrations))
- Notion database ID ([Learn how to get it](https://developers.notion.com/docs/working-with-databases))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pariwata/smarthub.git
   cd smarthub
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NOTION_API_KEY=your_notion_api_key_here
   NOTION_DATABASE_ID=your_notion_database_id_here
   ```

## Quick Start

### Basic Usage

```python
from smarthub_integration import SmartHubIntegration

# Initialize the integration
hub = SmartHubIntegration()

# Generate content and create a Notion page
prompt = "Write a brief summary about artificial intelligence"
page = hub.generate_and_create(prompt)
print(f"Created page: {page['id']}")
```

### Structured Content Generation

```python
# Generate content for multiple fields
property_mapping = {
    "Title": "A catchy title",
    "Summary": "A brief summary",
    "Key Points": "Main points to remember"
}

page = hub.generate_and_create(
    prompt="Create content about sustainable energy",
    property_mapping=property_mapping
)
```

### Read and Update Existing Pages

```python
# Read a page and enhance it with AI
updated_page = hub.read_and_enhance(
    page_id="your-page-id",
    enhancement_prompt="Expand this content with more details",
    target_property="Content"
)
```

### Update Specific Fields

```python
# Update multiple fields with AI-generated content
updates = {
    "Summary": "Write a concise summary about quantum computing",
    "Tags": "List 5 relevant tags"
}

updated_page = hub.update_page_with_ai(
    page_id="your-page-id",
    updates=updates
)
```

### Delete Pages

```python
# Archive a page
result = hub.delete_page(page_id="your-page-id")
```

### Batch Operations

```python
# Create multiple pages at once
prompts = [
    "Write about cloud computing",
    "Explain machine learning",
    "Discuss cybersecurity"
]

results = hub.batch_generate_and_create(prompts)
```

### Search and Update

```python
# Find pages and update them with AI
filter_conditions = {
    "property": "Status",
    "select": {"equals": "Draft"}
}

results = hub.search_and_update(
    filter_conditions=filter_conditions,
    update_prompt="Add a professional conclusion",
    target_property="Conclusion"
)
```

## Module Overview

### `chatgpt_service.py`
Handles interactions with OpenAI's ChatGPT API:
- Generate simple text content
- Generate structured content for multiple fields
- Configurable model selection and parameters

### `notion_service.py`
Manages Notion database operations:
- Create new pages
- Read existing pages
- Update page properties
- Delete (archive) pages
- Query databases with filters and sorting

### `smarthub_integration.py`
Main integration service connecting ChatGPT and Notion:
- Combined operations (generate + create, read + enhance, etc.)
- Batch processing capabilities
- Search and bulk update features

### `examples.py`
Comprehensive examples demonstrating all features

## API Reference

### SmartHubIntegration

#### `__init__(openai_api_key=None, notion_api_key=None, notion_database_id=None)`
Initialize the integration service.

#### `generate_and_create(prompt, property_mapping=None, model="gpt-3.5-turbo")`
Generate content with ChatGPT and create a Notion page.

#### `read_and_enhance(page_id, enhancement_prompt, target_property, model="gpt-3.5-turbo")`
Read a page, enhance it with AI, and update it.

#### `update_page_with_ai(page_id, updates, model="gpt-3.5-turbo")`
Update specific fields with AI-generated content.

#### `delete_page(page_id)`
Delete (archive) a Notion page.

#### `batch_generate_and_create(prompts, property_mapping=None, model="gpt-3.5-turbo")`
Generate and create multiple pages at once.

#### `search_and_update(filter_conditions, update_prompt, target_property, model="gpt-3.5-turbo")`
Search for pages and update them with AI content.

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `NOTION_API_KEY`: Your Notion integration token
- `NOTION_DATABASE_ID`: The ID of your Notion database

### Notion Database Setup

1. Create a new database in Notion
2. Add properties as needed (Title, Content, Summary, etc.)
3. Create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
4. Share your database with the integration
5. Copy the database ID from the URL

### Supported Property Types

The integration automatically handles:
- Text (rich_text, title)
- Numbers
- Checkboxes
- Select / Multi-select
- Dates

## Examples

Run the examples file to see all features in action:

```bash
python examples.py
```

Edit `examples.py` to uncomment specific examples you want to run.

## Error Handling

All methods include comprehensive error handling:

```python
try:
    page = hub.generate_and_create(prompt)
except Exception as e:
    print(f"Error: {e}")
```

## Best Practices

1. **API Rate Limits**: Be mindful of OpenAI and Notion API rate limits
2. **Error Handling**: Always wrap API calls in try-except blocks
3. **Environment Variables**: Never commit `.env` file with real credentials
4. **Batch Operations**: Use batch methods for multiple operations to improve efficiency
5. **Model Selection**: Use `gpt-3.5-turbo` for faster/cheaper responses, `gpt-4` for better quality

## Troubleshooting

### "API key is required" error
- Ensure `.env` file exists and contains valid API keys
- Check that environment variables are properly loaded

### "Database ID not found" error
- Verify the database ID is correct
- Ensure your integration has access to the database

### Notion property errors
- Check that property names match your database schema
- Ensure property types are compatible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/Pariwata/smarthub).

## Changelog

### Version 1.0.0
- Initial release
- ChatGPT integration
- Notion CRUD operations
- Batch processing
- Search and update functionality