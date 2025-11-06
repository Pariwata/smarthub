#!/usr/bin/env python
"""
SmartHub CLI - Command Line Interface for ChatGPT-Notion Integration
"""

import argparse
import sys
import os
from dotenv import load_dotenv
from smarthub_integration import SmartHubIntegration


def setup_parser():
    """Setup command line argument parser"""
    parser = argparse.ArgumentParser(
        description="SmartHub - ChatGPT to Notion Integration CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate content and create a Notion page
  python cli.py create "Write about AI ethics"
  
  # Generate structured content
  python cli.py create "Sustainable energy" --fields "Title,Summary,Key Points"
  
  # Update an existing page
  python cli.py update PAGE_ID "Content" "Write more details about this topic"
  
  # Delete a page
  python cli.py delete PAGE_ID
  
  # Read a page
  python cli.py read PAGE_ID
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new Notion page with AI-generated content')
    create_parser.add_argument('prompt', help='Prompt for content generation')
    create_parser.add_argument('--fields', help='Comma-separated list of fields for structured content')
    create_parser.add_argument('--model', default='gpt-3.5-turbo', help='ChatGPT model to use (default: gpt-3.5-turbo)')
    
    # Update command
    update_parser = subparsers.add_parser('update', help='Update an existing Notion page')
    update_parser.add_argument('page_id', help='ID of the page to update')
    update_parser.add_argument('property', help='Property name to update')
    update_parser.add_argument('prompt', help='Prompt for content generation')
    update_parser.add_argument('--model', default='gpt-3.5-turbo', help='ChatGPT model to use')
    
    # Read command
    read_parser = subparsers.add_parser('read', help='Read a Notion page')
    read_parser.add_argument('page_id', help='ID of the page to read')
    
    # Delete command
    delete_parser = subparsers.add_parser('delete', help='Delete (archive) a Notion page')
    delete_parser.add_argument('page_id', help='ID of the page to delete')
    
    # Enhance command
    enhance_parser = subparsers.add_parser('enhance', help='Read a page and enhance it with AI')
    enhance_parser.add_argument('page_id', help='ID of the page to enhance')
    enhance_parser.add_argument('property', help='Property to update')
    enhance_parser.add_argument('prompt', help='Enhancement prompt')
    enhance_parser.add_argument('--model', default='gpt-3.5-turbo', help='ChatGPT model to use')
    
    # Batch create command
    batch_parser = subparsers.add_parser('batch', help='Create multiple pages from a file')
    batch_parser.add_argument('file', help='File containing prompts (one per line)')
    batch_parser.add_argument('--model', default='gpt-3.5-turbo', help='ChatGPT model to use')
    
    return parser


def cmd_create(hub, args):
    """Handle create command"""
    try:
        property_mapping = None
        if args.fields:
            fields = [f.strip() for f in args.fields.split(',')]
            property_mapping = {field: field for field in fields}
        
        print(f"Generating content...")
        page = hub.generate_and_create(
            prompt=args.prompt,
            property_mapping=property_mapping,
            model=args.model
        )
        
        print(f"✓ Successfully created page!")
        print(f"  Page ID: {page.get('id')}")
        print(f"  URL: https://notion.so/{page.get('id', '').replace('-', '')}")
        return 0
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1


def cmd_update(hub, args):
    """Handle update command"""
    try:
        print(f"Generating content...")
        page = hub.update_page_with_ai(
            page_id=args.page_id,
            updates={args.property: args.prompt},
            model=args.model
        )
        
        print(f"✓ Successfully updated page!")
        print(f"  Page ID: {page.get('id')}")
        return 0
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1


def cmd_read(hub, args):
    """Handle read command"""
    try:
        print(f"Reading page...")
        page = hub.notion.read_page(args.page_id)
        
        print(f"✓ Page Details:")
        print(f"  ID: {page.get('id')}")
        print(f"  Created: {page.get('created_time')}")
        print(f"  Last Edited: {page.get('last_edited_time')}")
        print(f"\n  Properties:")
        for key, value in page.get('properties', {}).items():
            print(f"    {key}: {value}")
        return 0
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1


def cmd_delete(hub, args):
    """Handle delete command"""
    try:
        print(f"Deleting page...")
        result = hub.delete_page(args.page_id)
        
        print(f"✓ Successfully archived page!")
        print(f"  Page ID: {result.get('id')}")
        return 0
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1


def cmd_enhance(hub, args):
    """Handle enhance command"""
    try:
        print(f"Reading and enhancing page...")
        page = hub.read_and_enhance(
            page_id=args.page_id,
            enhancement_prompt=args.prompt,
            target_property=args.property,
            model=args.model
        )
        
        print(f"✓ Successfully enhanced page!")
        print(f"  Page ID: {page.get('id')}")
        return 0
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1


def cmd_batch(hub, args):
    """Handle batch command"""
    try:
        if not os.path.exists(args.file):
            print(f"✗ File not found: {args.file}", file=sys.stderr)
            return 1
        
        with open(args.file, 'r') as f:
            prompts = [line.strip() for line in f if line.strip()]
        
        if not prompts:
            print(f"✗ No prompts found in file", file=sys.stderr)
            return 1
        
        print(f"Processing {len(prompts)} prompts...")
        results = hub.batch_generate_and_create(prompts, model=args.model)
        
        success_count = sum(1 for r in results if 'error' not in r)
        error_count = len(results) - success_count
        
        print(f"\n✓ Batch processing complete!")
        print(f"  Success: {success_count}")
        print(f"  Errors: {error_count}")
        
        if error_count > 0:
            print(f"\n  Failed prompts:")
            for result in results:
                if 'error' in result:
                    print(f"    - {result.get('prompt', 'Unknown')[:50]}...")
        
        return 0 if error_count == 0 else 1
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1


def main():
    """Main CLI entry point"""
    # Parse arguments first
    parser = setup_parser()
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Load environment variables
    load_dotenv()
    
    # Check for required environment variables
    if not os.getenv('OPENAI_API_KEY'):
        print("✗ Error: OPENAI_API_KEY not set in environment", file=sys.stderr)
        print("  Please set it in your .env file or environment variables", file=sys.stderr)
        return 1
    
    if not os.getenv('NOTION_API_KEY'):
        print("✗ Error: NOTION_API_KEY not set in environment", file=sys.stderr)
        print("  Please set it in your .env file or environment variables", file=sys.stderr)
        return 1
    
    if not os.getenv('NOTION_DATABASE_ID'):
        print("✗ Error: NOTION_DATABASE_ID not set in environment", file=sys.stderr)
        print("  Please set it in your .env file or environment variables", file=sys.stderr)
        return 1
    
    # Initialize SmartHub
    try:
        hub = SmartHubIntegration()
    except Exception as e:
        print(f"✗ Error initializing SmartHub: {e}", file=sys.stderr)
        return 1
    
    # Execute command
    commands = {
        'create': cmd_create,
        'update': cmd_update,
        'read': cmd_read,
        'delete': cmd_delete,
        'enhance': cmd_enhance,
        'batch': cmd_batch
    }
    
    return commands[args.command](hub, args)


if __name__ == '__main__':
    sys.exit(main())
