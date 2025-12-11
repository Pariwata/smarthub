/**
 * SmartHub Email Management System
 * Main entry point
 *
 * Workflow: Check (new/period) -> Categorize -> Analyze -> Refine Categorize -> Manage
 */

// Export main components for programmatic use
const EmailManagementSystem = require('./EmailManagementSystem');
const EmailFetchService = require('./services/EmailFetchService');
const InitialCategorizer = require('./categorizers/InitialCategorizer');
const EmailAnalyzer = require('./analyzers/EmailAnalyzer');
const RefinedCategorizer = require('./categorizers/RefinedCategorizer');
const EmailManager = require('./managers/EmailManager');
const Email = require('./models/Email');
const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');

// Main exports
module.exports = {
  // Main system
  EmailManagementSystem,

  // Individual components
  EmailFetchService,
  InitialCategorizer,
  EmailAnalyzer,
  RefinedCategorizer,
  EmailManager,

  // Models
  Email,

  // Utilities
  config,
  validateConfig,
  logger,

  // Factory function for quick setup
  createSystem: (customConfig = {}) => new EmailManagementSystem(customConfig),

  // Quick processing functions
  async processNewEmails(options = {}) {
    const system = new EmailManagementSystem(options);
    try {
      return await system.processNewEmails(options);
    } finally {
      system.disconnect();
    }
  },

  async processRecentEmails(days = 7, options = {}) {
    const system = new EmailManagementSystem(options);
    try {
      return await system.processRecentEmails(days, options);
    } finally {
      system.disconnect();
    }
  },

  async processEmailsByPeriod(startDate, endDate, options = {}) {
    const system = new EmailManagementSystem(options);
    try {
      return await system.processEmailsByPeriod(startDate, endDate, options);
    } finally {
      system.disconnect();
    }
  }
};

// If run directly, show usage info
if (require.main === module) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           SmartHub Email Management System v1.0.0                  ║
╚═══════════════════════════════════════════════════════════════════╝

This is a comprehensive email management system that processes emails
through the following pipeline:

  1. CHECK     - Fetch new emails or emails from a specific period
  2. CATEGORIZE - Initial rule-based categorization
  3. ANALYZE   - Deep content analysis (sentiment, urgency, keywords)
  4. REFINE    - Refined categorization based on analysis
  5. MANAGE    - Apply actions (label, move, archive, etc.)

Usage:
  CLI:         node src/cli.js <command> [options]
  Programmatic: const { EmailManagementSystem } = require('./src');

Quick Start:
  1. Copy .env.example to .env
  2. Configure your IMAP settings
  3. Run: npm install
  4. Run: node src/cli.js check --new

For CLI help:
  node src/cli.js help

Documentation:
  See README.md for full documentation

`);

  // Show configuration status
  const validation = validateConfig();
  if (!validation.valid) {
    console.log('⚠️  Configuration Issues:');
    validation.errors.forEach(e => console.log(`   - ${e}`));
    console.log('\nPlease configure .env file before using the system.\n');
  } else {
    console.log('✅ Configuration OK\n');
  }
}
