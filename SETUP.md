# SmartHub Setup Guide

This guide will walk you through setting up SmartHub to integrate ChatGPT with Notion.

## Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- An OpenAI account with API access
- A Notion account with API access

## Step 1: Clone the Repository

```bash
git clone https://github.com/Pariwata/smarthub.git
cd smarthub
```

## Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

For development (includes testing tools):

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Step 3: Get Your API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (you won't be able to see it again)

### Notion API Key

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Give it a name (e.g., "SmartHub")
4. Select the workspace to integrate with
5. Copy the "Internal Integration Token"

### Notion Database ID

1. Open your Notion database in a browser
2. The URL will look like: `https://notion.so/workspace/DATABASE_ID?v=...`
3. Copy the `DATABASE_ID` part (32 characters between the last `/` and `?`)
4. Alternatively, you can find it by:
   - Click on the database
   - Click "..." menu → "Copy link"
   - Extract the ID from the copied URL

## Step 4: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit the `.env` file and add your credentials:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
NOTION_API_KEY=secret_your-actual-notion-key-here
NOTION_DATABASE_ID=your-database-id-here
```

## Step 5: Share Database with Integration

**Important:** Your Notion integration needs access to your database!

1. Open your Notion database
2. Click the "..." menu in the top right
3. Scroll down and click "Add connections"
4. Select your integration (e.g., "SmartHub")
5. Click "Confirm"

## Step 6: Verify Setup

Test your configuration by running:

```bash
python cli.py --help
```

You should see the CLI help without errors.

## Step 7: Test the Integration

Try creating your first page:

```bash
python cli.py create "Write a brief introduction to artificial intelligence"
```

If successful, you should see:
```
✓ Successfully created page!
  Page ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  URL: https://notion.so/...
```

## Troubleshooting

### "API key is required" Error

- Ensure your `.env` file exists in the project root
- Check that the environment variable names are correct (no spaces)
- Verify that the API keys are valid and not expired

### "Database ID not found" Error

- Verify the database ID is correct (32 characters)
- Ensure the database is shared with your integration
- Check that you're using a database, not a regular page

### "Permission denied" Error

- Make sure you've shared the database with your integration
- Verify the integration has the correct permissions
- Try recreating the integration and updating the API key

### Import Errors

- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.7+)

## Advanced Configuration

### Using Different Models

You can specify which ChatGPT model to use:

```bash
python cli.py create "Your prompt" --model gpt-4
```

Available models:
- `gpt-3.5-turbo` (default, faster and cheaper)
- `gpt-4` (more capable, slower and more expensive)
- `gpt-4-turbo-preview` (latest GPT-4 with improvements)

### Structured Content Generation

Generate content for multiple fields at once:

```bash
python cli.py create "Topic: Climate Change" --fields "Title,Summary,Key Points,Conclusion"
```

### Batch Processing

Create a text file with prompts (one per line):

```text
Write about renewable energy
Explain machine learning basics
Discuss cybersecurity best practices
```

Then run:

```bash
python cli.py batch prompts.txt
```

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Keep API keys secret** - Don't share them publicly
3. **Rotate keys regularly** - Especially if you suspect they're compromised
4. **Use environment-specific keys** - Different keys for dev/prod
5. **Monitor API usage** - Keep track of costs and usage

## Next Steps

- Read the full [README.md](README.md) for API documentation
- Check out [examples.py](examples.py) for code examples
- Run tests: `python -m pytest test_*.py -v`
- Explore the modules: `chatgpt_service.py`, `notion_service.py`, `smarthub_integration.py`

## Getting Help

- Check the [README.md](README.md) for common use cases
- Review the code examples in [examples.py](examples.py)
- Open an issue on GitHub if you encounter problems

## Updating

To update to the latest version:

```bash
git pull origin main
pip install -r requirements.txt --upgrade
```
