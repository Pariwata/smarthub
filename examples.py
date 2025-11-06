"""
Example usage of SmartHub Integration
Demonstrates how to use the ChatGPT-Notion integration
"""

from smarthub_integration import SmartHubIntegration
import os
from dotenv import load_dotenv


def example_basic_usage():
    """Example: Basic content generation and creation"""
    print("=== Basic Usage Example ===")
    
    # Initialize integration
    hub = SmartHubIntegration()
    
    # Generate content and create Notion page
    prompt = "Write a brief summary about artificial intelligence and its applications in 2024"
    
    try:
        page = hub.generate_and_create(prompt)
        print(f"✓ Created page with ID: {page.get('id')}")
    except Exception as e:
        print(f"✗ Error: {e}")


def example_structured_content():
    """Example: Generate structured content with multiple fields"""
    print("\n=== Structured Content Example ===")
    
    hub = SmartHubIntegration()
    
    # Define property mapping for structured content
    property_mapping = {
        "Title": "A catchy title for the topic",
        "Summary": "A brief summary",
        "Key Points": "Main points to remember",
        "Category": "The category this belongs to"
    }
    
    prompt = "Create content about sustainable energy solutions"
    
    try:
        page = hub.generate_and_create(
            prompt=prompt,
            property_mapping=property_mapping
        )
        print(f"✓ Created structured page with ID: {page.get('id')}")
    except Exception as e:
        print(f"✗ Error: {e}")


def example_read_and_update():
    """Example: Read existing page and update with AI enhancement"""
    print("\n=== Read and Update Example ===")
    
    hub = SmartHubIntegration()
    
    # Replace with actual page ID
    page_id = "YOUR_PAGE_ID_HERE"
    
    try:
        # Read and enhance existing content
        updated_page = hub.read_and_enhance(
            page_id=page_id,
            enhancement_prompt="Expand and improve this content with more details",
            target_property="Content"
        )
        print(f"✓ Updated page with ID: {updated_page.get('id')}")
    except Exception as e:
        print(f"✗ Error: {e}")


def example_batch_generation():
    """Example: Generate multiple pages at once"""
    print("\n=== Batch Generation Example ===")
    
    hub = SmartHubIntegration()
    
    prompts = [
        "Write about the benefits of cloud computing",
        "Explain machine learning basics",
        "Discuss cybersecurity best practices"
    ]
    
    try:
        results = hub.batch_generate_and_create(prompts)
        print(f"✓ Created {len(results)} pages")
        for i, result in enumerate(results, 1):
            if "error" not in result:
                print(f"  Page {i}: {result.get('id')}")
    except Exception as e:
        print(f"✗ Error: {e}")


def example_update_specific_fields():
    """Example: Update specific fields with AI-generated content"""
    print("\n=== Update Specific Fields Example ===")
    
    hub = SmartHubIntegration()
    
    # Replace with actual page ID
    page_id = "YOUR_PAGE_ID_HERE"
    
    # Define what to update
    updates = {
        "Summary": "Write a concise summary about quantum computing",
        "Tags": "List 3-5 relevant tags for quantum computing"
    }
    
    try:
        updated_page = hub.update_page_with_ai(
            page_id=page_id,
            updates=updates
        )
        print(f"✓ Updated page fields for ID: {updated_page.get('id')}")
    except Exception as e:
        print(f"✗ Error: {e}")


def example_delete_page():
    """Example: Delete (archive) a page"""
    print("\n=== Delete Page Example ===")
    
    hub = SmartHubIntegration()
    
    # Replace with actual page ID
    page_id = "YOUR_PAGE_ID_HERE"
    
    try:
        result = hub.delete_page(page_id)
        print(f"✓ Archived page with ID: {result.get('id')}")
    except Exception as e:
        print(f"✗ Error: {e}")


def example_search_and_update():
    """Example: Search for pages and update them"""
    print("\n=== Search and Update Example ===")
    
    hub = SmartHubIntegration()
    
    # Example filter (adjust based on your database schema)
    filter_conditions = {
        "property": "Status",
        "select": {
            "equals": "Draft"
        }
    }
    
    try:
        results = hub.search_and_update(
            filter_conditions=filter_conditions,
            update_prompt="Add a professional conclusion to this content",
            target_property="Conclusion"
        )
        print(f"✓ Updated {len(results)} pages")
    except Exception as e:
        print(f"✗ Error: {e}")


def main():
    """Run all examples"""
    print("SmartHub Integration Examples")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Check if API keys are configured
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠ Warning: OPENAI_API_KEY not set in .env file")
    if not os.getenv('NOTION_API_KEY'):
        print("⚠ Warning: NOTION_API_KEY not set in .env file")
    if not os.getenv('NOTION_DATABASE_ID'):
        print("⚠ Warning: NOTION_DATABASE_ID not set in .env file")
    
    print("\nNote: Update page IDs in examples before running read/update/delete operations")
    print()
    
    # Run examples (commented out to avoid API calls without proper setup)
    # Uncomment the examples you want to run:
    
    # example_basic_usage()
    # example_structured_content()
    # example_read_and_update()
    # example_batch_generation()
    # example_update_specific_fields()
    # example_delete_page()
    # example_search_and_update()
    
    print("\nTo run these examples:")
    print("1. Copy .env.example to .env")
    print("2. Fill in your API keys and database ID")
    print("3. Uncomment the example functions you want to run")
    print("4. Run: python examples.py")


if __name__ == "__main__":
    main()
