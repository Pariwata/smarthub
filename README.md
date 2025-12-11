# SmartHub Email Management System

A comprehensive Node.js email management system that processes emails through an intelligent pipeline: **Check → Categorize → Analyze → Refine → Manage**

## Features

- **Email Fetching**: Fetch new/unseen emails or emails from a specific date range via IMAP
- **Initial Categorization**: Rule-based categorization by sender, subject patterns, and content
- **Deep Analysis**: NLP-powered analysis including sentiment, urgency, keywords, entities, spam/phishing detection
- **Refined Categorization**: ML-ready refined categorization based on analysis results
- **Email Management**: Automated actions including labeling, moving, archiving, flagging, and forwarding

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd smarthub

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your email settings
```

## Configuration

Create a `.env` file with your email server settings:

```env
# IMAP Settings (for receiving emails)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true

# SMTP Settings (for sending/forwarding)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Settings
LOG_LEVEL=info
MAX_EMAILS_PER_FETCH=100
```

### Gmail Setup

For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the App Password in `IMAP_PASSWORD` and `SMTP_PASSWORD`

## Usage

### CLI Commands

```bash
# Check for new emails
node src/cli.js check --new

# Check emails from last 7 days
node src/cli.js check --recent 7

# Check emails from a specific period
node src/cli.js check --period 2024-01-01 2024-01-31

# Full processing pipeline for new emails
node src/cli.js process --new

# Process recent emails and save results
node src/cli.js process --recent 7 --save

# View mailbox status
node src/cli.js status

# Generate management report
node src/cli.js report

# View/manage rules
node src/cli.js rules list

# Show help
node src/cli.js help
```

### Programmatic Usage

```javascript
const { EmailManagementSystem, createSystem } = require('./src');

// Create system instance
const system = createSystem();

// Process new emails through full pipeline
async function processEmails() {
  try {
    // Full pipeline: fetch → categorize → analyze → refine → manage
    const results = await system.processNewEmails();

    console.log(`Processed ${results.emails.length} emails`);
    console.log('Summary:', results.summary);

    // Get specific email groups
    const urgent = system.getUrgentEmails();
    const suspicious = system.getSuspiciousEmails();
    const actionItems = system.getEmailsWithActionItems();

    // Get emails by category
    const workEmails = system.getEmailsByCategory('work');
    const promotions = system.getEmailsByCategory('promotions');

    // Generate report
    const report = system.generateReport();

  } finally {
    system.disconnect();
  }
}

// Process emails from a date range
async function processDateRange() {
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-01-31');

  const results = await system.processEmailsByPeriod(startDate, endDate);
  console.log(results.summary);
}

// Quick one-liner functions
const { processNewEmails, processRecentEmails } = require('./src');

// Process new emails
const results = await processNewEmails();

// Process last 7 days
const weekResults = await processRecentEmails(7);
```

### Using Individual Components

```javascript
const {
  EmailFetchService,
  InitialCategorizer,
  EmailAnalyzer,
  RefinedCategorizer,
  EmailManager
} = require('./src');

// Fetch emails only
const fetcher = new EmailFetchService();
await fetcher.connect();
const emails = await fetcher.fetchNewEmails();
fetcher.disconnect();

// Categorize emails
const categorizer = new InitialCategorizer();
const categorized = categorizer.categorizeAll(emails);

// Analyze emails
const analyzer = new EmailAnalyzer();
const analyzed = analyzer.analyzeAll(categorized.emails);

// Refine categorization
const refiner = new RefinedCategorizer();
const refined = refiner.refineAll(analyzed.emails);

// Manage emails
const manager = new EmailManager();
const results = await manager.processAll(refined.emails);
```

## Processing Pipeline

### 1. Check/Fetch
Fetches emails from your mailbox using IMAP:
- New/unseen emails
- Emails from specific date range
- Recent emails (last N days)

### 2. Initial Categorization
Rule-based categorization using:
- Sender domain patterns
- Subject line patterns
- Content patterns
- Email properties (attachments, recipients, flags)

**Categories:**
- Primary, Work, Personal
- Social, Promotions, Updates
- Financial, Newsletters, Forums
- Spam

### 3. Analysis
Deep NLP analysis:
- **Sentiment**: Positive/Negative/Neutral with confidence score
- **Urgency**: High/Medium/Normal/Low with indicators
- **Keywords**: TF-IDF extracted keywords
- **Topics**: NLP-extracted topics
- **Entities**: People, organizations, places, emails, phones
- **Spam Score**: 0-100 spam likelihood
- **Phishing Risk**: 0-100 phishing likelihood
- **Action Items**: Extracted action items from content
- **Reading Time**: Estimated reading time
- **Complexity**: Simple/Moderate/Complex

### 4. Refined Categorization
Uses analysis results to refine initial categorization:
- Override based on spam/phishing scores
- Adjust based on urgency and sentiment
- Detect financial, work, personal indicators
- Calculate priority: Urgent/High/Normal/Low

### 5. Management
Automated actions based on categorization and analysis:
- **Move**: To appropriate folders (Spam, Archive, etc.)
- **Label**: Add category-based labels
- **Flag**: Mark important/urgent emails
- **Archive**: Auto-archive old, low-priority emails
- **Delete**: Auto-delete high-confidence spam
- **Forward**: Forward based on rules
- **Notify**: Create notifications for urgent emails
- **Warn**: Flag suspicious/phishing emails

## Email Categories

| Category | Description | Priority |
|----------|-------------|----------|
| Primary | Important personal/work emails | 1 |
| Work | Work-related correspondence | 1 |
| Personal | Personal from known contacts | 1 |
| Financial | Banking, bills, payments | 1 |
| Updates | Notifications, confirmations | 2 |
| Social | Social media notifications | 3 |
| Forums | Mailing lists, forums | 3 |
| Newsletters | Newsletter subscriptions | 3 |
| Promotions | Marketing, deals, offers | 4 |
| Spam | Unwanted/suspicious emails | 5 |

## Project Structure

```
smarthub/
├── src/
│   ├── config/
│   │   └── index.js           # Configuration management
│   ├── models/
│   │   └── Email.js           # Email model/entity
│   ├── services/
│   │   └── EmailFetchService.js   # IMAP email fetching
│   ├── categorizers/
│   │   ├── InitialCategorizer.js  # Rule-based categorization
│   │   └── RefinedCategorizer.js  # Analysis-based refinement
│   ├── analyzers/
│   │   └── EmailAnalyzer.js   # NLP analysis engine
│   ├── managers/
│   │   └── EmailManager.js    # Email management actions
│   ├── utils/
│   │   └── logger.js          # Logging utility
│   ├── EmailManagementSystem.js   # Main orchestrator
│   ├── cli.js                 # CLI interface
│   └── index.js               # Main entry point
├── data/                      # Local data storage
│   ├── emails/               # Stored emails
│   ├── archive/              # Archived emails
│   ├── logs/                 # Application logs
│   └── rules.json            # Management rules
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Management Rules

Add custom rules to automate email management:

```javascript
const system = createSystem();

// Auto-archive old promotions
system.addRule('autoArchive', {
  name: 'Archive old promotions',
  category: 'promotions',
  olderThanDays: 30
});

// Auto-label emails from specific sender
system.addRule('autoLabel', {
  name: 'Label work emails',
  from: '@company.com',
  label: 'Work'
});

// Auto-move newsletters
system.addRule('autoMove', {
  name: 'Move newsletters',
  category: 'newsletters',
  folder: 'Newsletters'
});
```

## API Reference

### EmailManagementSystem

```javascript
// Core methods
await system.connect()
system.disconnect()

// Processing
await system.processNewEmails(options)
await system.processRecentEmails(days, options)
await system.processEmailsByPeriod(startDate, endDate, options)

// Individual pipeline stages
await system.fetchNewEmails(options)
system.categorizeEmails(emails)
system.analyzeEmails(emails)
system.refineCategorization(emails)
await system.manageEmails(emails, options)

// Query methods
system.getEmailsByCategory(category)
system.getEmailsByPriority(priority)
system.getUrgentEmails()
system.getSuspiciousEmails()
system.getEmailsWithActionItems()
system.searchEmails(query, options)

// Utilities
system.generateReport()
system.exportToJSON(filePath)
system.getStatistics()

// Rules management
system.addRule(ruleType, rule)
system.getRules()
```

### Analysis Results

Each analyzed email contains:

```javascript
email.analysis = {
  sentiment: { score: 0.5, label: 'positive', confidence: 0.8 },
  urgency: { level: 'high', score: 5, indicators: ['urgent', 'asap'] },
  keywords: [{ term: 'meeting', score: 0.8 }],
  topics: ['project', 'deadline'],
  entities: {
    people: ['John Smith'],
    organizations: ['Acme Corp'],
    places: ['New York'],
    emails: ['contact@example.com'],
    phones: ['555-0123']
  },
  language: { detected: 'en', confidence: 0.95 },
  readingTime: 2,
  spamScore: 15,
  phishingRisk: 5,
  complexity: { level: 'moderate', avgWordsPerSentence: 18 },
  actionItems: ['Review the proposal', 'Send feedback'],
  dates: ['next Monday', 'January 15'],
  urls: { links: [...], count: 5, hasTrackingPixels: true }
}
```

## Dependencies

- **imap**: IMAP client for email fetching
- **mailparser**: Email parsing
- **nodemailer**: SMTP for sending/forwarding
- **natural**: NLP toolkit (TF-IDF, sentiment, tokenization)
- **compromise**: NLP entity extraction
- **winston**: Logging
- **dotenv**: Environment configuration
- **uuid**: Unique ID generation

## License

MIT
