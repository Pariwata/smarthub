#!/usr/bin/env node

/**
 * Email Management System CLI
 * Command-line interface for managing emails
 */

const EmailManagementSystem = require('./EmailManagementSystem');
const logger = require('./utils/logger');
const { config } = require('./config');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// CLI Help
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           SmartHub Email Management System CLI                     ║
╚═══════════════════════════════════════════════════════════════════╝

Usage: node src/cli.js <command> [options]

Commands:
  check [options]       Check and fetch emails
  analyze [options]     Analyze fetched emails
  manage [options]      Manage emails (apply rules, labels, etc.)
  process [options]     Full pipeline: fetch -> categorize -> analyze -> manage
  status               Show mailbox status
  report               Generate management report
  rules                Manage email rules
  help                 Show this help message

Check Options:
  --new                 Fetch only new/unseen emails (default)
  --recent <days>       Fetch emails from last N days
  --period <start> <end> Fetch emails from date range (YYYY-MM-DD)
  --folder <name>       Mailbox folder to check (default: INBOX)
  --limit <n>           Maximum emails to fetch (default: 100)

Analyze Options:
  --file <path>         Analyze emails from JSON file
  --output <path>       Save analysis results to file

Manage Options:
  --auto                Apply automatic rules
  --dry-run             Show actions without executing
  --save                Save processed emails locally

Process Options:
  --new                 Process new emails
  --recent <days>       Process recent emails
  --skip <stages>       Skip stages (comma-separated: categorize,analyze,refine,manage)

Rules Commands:
  rules list            List all rules
  rules add <type>      Add a new rule (interactive)
  rules remove <id>     Remove a rule by ID

Examples:
  node src/cli.js check --new
  node src/cli.js check --recent 7
  node src/cli.js check --period 2024-01-01 2024-01-31
  node src/cli.js process --new
  node src/cli.js process --recent 3 --save
  node src/cli.js status
  node src/cli.js report

Environment Variables:
  IMAP_HOST             IMAP server host
  IMAP_PORT             IMAP server port
  IMAP_USER             Email username
  IMAP_PASSWORD         Email password/app password

Note: Copy .env.example to .env and configure your email settings.
`);
}

// Parse options from arguments
function parseOptions(args) {
  const options = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '--new':
        options.fetchType = 'new';
        break;
      case '--recent':
        options.fetchType = 'recent';
        options.days = parseInt(args[++i], 10) || 7;
        break;
      case '--period':
        options.fetchType = 'period';
        options.startDate = new Date(args[++i]);
        options.endDate = new Date(args[++i]);
        break;
      case '--folder':
        options.folder = args[++i];
        break;
      case '--limit':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--file':
        options.inputFile = args[++i];
        break;
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--auto':
        options.autoRules = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--save':
        options.saveLocally = true;
        break;
      case '--skip':
        options.skipStages = args[++i].split(',');
        break;
      default:
        if (!arg.startsWith('--')) {
          options.subCommand = arg;
        }
    }
    i++;
  }

  return options;
}

// Format email for display
function formatEmail(email, index) {
  const cat = email.refinedCategory || email.initialCategory || '-';
  const priority = email.priority || 'normal';
  const from = email.getSenderEmail() || 'Unknown';
  const subject = (email.subject || '(No Subject)').substring(0, 50);
  const date = email.date ? new Date(email.date).toLocaleDateString() : '-';

  return `${index + 1}. [${cat.toUpperCase().padEnd(12)}] [${priority.padEnd(6)}] ${date} | ${from.substring(0, 25).padEnd(25)} | ${subject}`;
}

// Display summary
function displaySummary(summary) {
  console.log('\n' + '='.repeat(70));
  console.log('PROCESSING SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Processed: ${summary.totalProcessed}`);
  console.log(`Timestamp: ${summary.timestamp}`);

  if (summary.categoryDistribution) {
    console.log('\nCategory Distribution:');
    for (const [cat, count] of Object.entries(summary.categoryDistribution)) {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`  ${cat.padEnd(15)} ${count.toString().padStart(4)} ${bar}`);
    }
  }

  if (summary.priorityDistribution) {
    console.log('\nPriority Distribution:');
    for (const [priority, count] of Object.entries(summary.priorityDistribution)) {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`  ${priority.padEnd(10)} ${count.toString().padStart(4)} ${bar}`);
    }
  }

  console.log('='.repeat(70) + '\n');
}

// Main CLI function
async function main() {
  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }

  const options = parseOptions(args.slice(1));
  const system = new EmailManagementSystem();

  try {
    switch (command) {
      case 'check':
        await handleCheck(system, options);
        break;

      case 'analyze':
        await handleAnalyze(system, options);
        break;

      case 'manage':
        await handleManage(system, options);
        break;

      case 'process':
        await handleProcess(system, options);
        break;

      case 'status':
        await handleStatus(system, options);
        break;

      case 'report':
        await handleReport(system, options);
        break;

      case 'rules':
        await handleRules(system, options);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    logger.error('CLI Error', { error: err.message, stack: err.stack });
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  } finally {
    system.disconnect();
  }
}

// Handle check command
async function handleCheck(system, options) {
  console.log('\n📬 Checking emails...\n');

  await system.connect();

  let emails = [];

  switch (options.fetchType) {
    case 'period':
      console.log(`Fetching emails from ${options.startDate.toDateString()} to ${options.endDate.toDateString()}`);
      emails = await system.fetchEmailsByPeriod(options.startDate, options.endDate, options);
      break;

    case 'recent':
      console.log(`Fetching emails from last ${options.days} days`);
      emails = await system.fetchRecentEmails(options.days, options);
      break;

    case 'new':
    default:
      console.log('Fetching new/unseen emails');
      emails = await system.fetchNewEmails(options);
      break;
  }

  console.log(`\nFound ${emails.length} emails:\n`);

  if (emails.length > 0) {
    emails.forEach((email, i) => {
      console.log(formatEmail(email, i));
    });
  } else {
    console.log('No emails found.');
  }
}

// Handle analyze command
async function handleAnalyze(system, options) {
  console.log('\n🔍 Analyzing emails...\n');

  let emails = [];

  if (options.inputFile) {
    const fs = require('fs');
    const Email = require('./models/Email');
    const data = JSON.parse(fs.readFileSync(options.inputFile, 'utf8'));
    emails = data.emails.map(e => new Email(e));
    console.log(`Loaded ${emails.length} emails from ${options.inputFile}`);
  } else {
    // Fetch and analyze
    await system.connect();
    emails = await system.fetchNewEmails(options);
  }

  if (emails.length === 0) {
    console.log('No emails to analyze.');
    return;
  }

  // Categorize
  console.log('Initial categorization...');
  const categorized = system.categorizeEmails(emails);

  // Analyze
  console.log('Deep analysis...');
  const analyzed = system.analyzeEmails(categorized.emails);

  // Refine
  console.log('Refined categorization...');
  const refined = system.refineCategorization(analyzed.emails);

  // Display results
  console.log(`\nAnalysis complete for ${refined.emails.length} emails:\n`);

  refined.emails.forEach((email, i) => {
    console.log(formatEmail(email, i));
    if (email.analysis) {
      console.log(`   Sentiment: ${email.analysis.sentiment?.label || '-'} | ` +
                  `Urgency: ${email.analysis.urgency?.level || '-'} | ` +
                  `Spam: ${email.analysis.spamScore || 0}% | ` +
                  `Keywords: ${(email.analysis.keywords || []).slice(0, 3).map(k => k.term).join(', ')}`);
    }
  });

  // Display summary
  console.log('\n' + '-'.repeat(70));
  console.log('Analysis Summary:');
  console.log(`  Sentiment: Positive=${analyzed.summary.sentiment?.positive || 0}, ` +
              `Neutral=${analyzed.summary.sentiment?.neutral || 0}, ` +
              `Negative=${analyzed.summary.sentiment?.negative || 0}`);
  console.log(`  Urgency: High=${analyzed.summary.urgency?.high || 0}, ` +
              `Medium=${analyzed.summary.urgency?.medium || 0}, ` +
              `Normal=${analyzed.summary.urgency?.normal || 0}`);
  console.log(`  Category changes after refinement: ${refined.summary.categoryChanges}`);

  // Save if requested
  if (options.outputFile) {
    system.processedEmails = refined.emails;
    system.exportToJSON(options.outputFile);
    console.log(`\nResults saved to ${options.outputFile}`);
  }
}

// Handle manage command
async function handleManage(system, options) {
  console.log('\n⚙️  Managing emails...\n');

  if (options.dryRun) {
    console.log('DRY RUN MODE - No actions will be executed\n');
  }

  // For demo, we'll just show what would happen
  const rules = system.getRules();
  console.log('Active Rules:');
  console.log(`  Auto-archive rules: ${rules.autoArchive?.length || 0}`);
  console.log(`  Auto-label rules: ${rules.autoLabel?.length || 0}`);
  console.log(`  Auto-move rules: ${rules.autoMove?.length || 0}`);
  console.log(`  Auto-delete rules: ${rules.autoDelete?.length || 0}`);

  if (system.processedEmails.length === 0) {
    console.log('\nNo processed emails in memory. Run "process" command first.');
    return;
  }

  console.log(`\nManaging ${system.processedEmails.length} emails...`);

  if (!options.dryRun) {
    const results = await system.manageEmails(system.processedEmails, options);
    console.log(`\nActions performed: ${JSON.stringify(results.actions)}`);
  } else {
    console.log('\nDry run - no actions taken.');
  }
}

// Handle process command (full pipeline)
async function handleProcess(system, options) {
  console.log('\n🚀 Starting full email processing pipeline...\n');

  let results;

  switch (options.fetchType) {
    case 'period':
      console.log(`Processing emails from ${options.startDate.toDateString()} to ${options.endDate.toDateString()}`);
      results = await system.processEmailsByPeriod(options.startDate, options.endDate, options);
      break;

    case 'recent':
      console.log(`Processing emails from last ${options.days} days`);
      results = await system.processRecentEmails(options.days, options);
      break;

    case 'new':
    default:
      console.log('Processing new/unseen emails');
      results = await system.processNewEmails(options);
      break;
  }

  if (results.emails.length === 0) {
    console.log('\nNo emails to process.');
    return;
  }

  // Display processed emails
  console.log(`\nProcessed ${results.emails.length} emails:\n`);
  results.emails.slice(0, 20).forEach((email, i) => {
    console.log(formatEmail(email, i));
  });

  if (results.emails.length > 20) {
    console.log(`  ... and ${results.emails.length - 20} more`);
  }

  // Display summary
  displaySummary(results.summary);

  // Save if requested
  if (options.saveLocally) {
    const outputPath = `./data/processed/emails_${Date.now()}.json`;
    system.exportToJSON(outputPath);
    console.log(`Emails saved to ${outputPath}`);
  }

  // Show urgent items
  const urgent = system.getUrgentEmails();
  if (urgent.length > 0) {
    console.log(`\n⚠️  ${urgent.length} URGENT emails require attention:`);
    urgent.forEach((email, i) => {
      console.log(`  ${i + 1}. ${email.subject.substring(0, 60)}`);
    });
  }

  // Show suspicious items
  const suspicious = system.getSuspiciousEmails();
  if (suspicious.length > 0) {
    console.log(`\n🚨 ${suspicious.length} SUSPICIOUS emails detected:`);
    suspicious.forEach((email, i) => {
      console.log(`  ${i + 1}. ${email.subject.substring(0, 60)} (Spam: ${email.analysis?.spamScore}%, Phishing: ${email.analysis?.phishingRisk}%)`);
    });
  }
}

// Handle status command
async function handleStatus(system, options) {
  console.log('\n📊 Mailbox Status\n');

  await system.connect();

  const folder = options.folder || 'INBOX';
  const status = await system.getMailboxStatus(folder);

  console.log(`Folder: ${status.name}`);
  console.log(`Total Messages: ${status.total}`);
  console.log(`New Messages: ${status.new}`);
  console.log(`UID Next: ${status.uidnext}`);
  console.log(`UID Validity: ${status.uidvalidity}`);

  // Try to list mailboxes
  try {
    const mailboxes = await system.getMailboxes();
    console.log('\nAvailable Mailboxes:');
    const printBoxes = (boxes, prefix = '') => {
      for (const [name, box] of Object.entries(boxes)) {
        console.log(`  ${prefix}${name}`);
        if (box.children) {
          printBoxes(box.children, prefix + '  ');
        }
      }
    };
    printBoxes(mailboxes);
  } catch (err) {
    // Ignore mailbox listing errors
  }
}

// Handle report command
async function handleReport(system, options) {
  console.log('\n📋 Generating Report...\n');

  if (system.processedEmails.length === 0) {
    console.log('No processed emails. Run "process" command first to generate a report.');
    return;
  }

  const report = system.generateReport();

  console.log('='.repeat(70));
  console.log('EMAIL MANAGEMENT REPORT');
  console.log('='.repeat(70));
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Total Emails: ${report.totalEmails}`);

  console.log('\nBy Category:');
  for (const [cat, count] of Object.entries(report.byCategory)) {
    console.log(`  ${cat.padEnd(15)} ${count}`);
  }

  console.log('\nBy Priority:');
  for (const [priority, count] of Object.entries(report.byPriority)) {
    console.log(`  ${priority.padEnd(10)} ${count}`);
  }

  console.log('\nBy Status:');
  for (const [status, count] of Object.entries(report.byStatus)) {
    console.log(`  ${status.padEnd(15)} ${count}`);
  }

  if (Object.keys(report.actionsTaken).length > 0) {
    console.log('\nActions Taken:');
    for (const [action, count] of Object.entries(report.actionsTaken)) {
      console.log(`  ${action.padEnd(15)} ${count}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    report.warnings.forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.warning}`);
    });
  }

  if (report.recommendations.length > 0) {
    console.log('\nRecommendations:');
    report.recommendations.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.message}`);
    });
  }

  console.log('='.repeat(70) + '\n');
}

// Handle rules command
async function handleRules(system, options) {
  const subCommand = options.subCommand || 'list';
  const rules = system.getRules();

  switch (subCommand) {
    case 'list':
      console.log('\n📑 Email Management Rules\n');

      const ruleTypes = ['autoArchive', 'autoDelete', 'autoLabel', 'autoMove', 'autoForward'];

      for (const type of ruleTypes) {
        console.log(`${type}:`);
        if (rules[type] && rules[type].length > 0) {
          rules[type].forEach(rule => {
            console.log(`  - ${rule.id}: ${rule.name}`);
            if (rule.from) console.log(`      From: ${rule.from}`);
            if (rule.subject) console.log(`      Subject: ${rule.subject}`);
            if (rule.category) console.log(`      Category: ${rule.category}`);
          });
        } else {
          console.log('  (none)');
        }
      }
      break;

    case 'add':
      console.log('\nTo add rules, use the API or edit data/rules.json directly.');
      console.log('\nExample rule format:');
      console.log(JSON.stringify({
        name: 'Archive old promotions',
        category: 'promotions',
        olderThanDays: 30
      }, null, 2));
      break;

    case 'remove':
      console.log('\nTo remove rules, use the API or edit data/rules.json directly.');
      break;

    default:
      console.log(`Unknown rules subcommand: ${subCommand}`);
  }
}

// Run CLI
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
