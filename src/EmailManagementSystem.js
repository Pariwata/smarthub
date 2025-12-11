/**
 * Email Management System
 * Main orchestrator that combines all components:
 * Fetch -> Categorize -> Analyze -> Refine Categorize -> Manage
 */

const EmailFetchService = require('./services/EmailFetchService');
const InitialCategorizer = require('./categorizers/InitialCategorizer');
const EmailAnalyzer = require('./analyzers/EmailAnalyzer');
const RefinedCategorizer = require('./categorizers/RefinedCategorizer');
const EmailManager = require('./managers/EmailManager');
const logger = require('./utils/logger');
const { config, validateConfig } = require('./config');

class EmailManagementSystem {
  constructor(customConfig = {}) {
    // Validate configuration
    const validation = validateConfig();
    if (!validation.valid) {
      logger.warn('Configuration validation warnings:', validation.errors);
    }

    // Initialize components
    this.fetchService = new EmailFetchService(customConfig.imap);
    this.initialCategorizer = new InitialCategorizer();
    this.analyzer = new EmailAnalyzer();
    this.refinedCategorizer = new RefinedCategorizer();
    this.manager = new EmailManager(customConfig);

    // Processing state
    this.isConnected = false;
    this.processedEmails = [];
  }

  /**
   * Connect to email server
   */
  async connect() {
    logger.info('Connecting to email server...');
    await this.fetchService.connect();
    this.isConnected = true;
    logger.info('Connected successfully');
  }

  /**
   * Disconnect from email server
   */
  disconnect() {
    this.fetchService.disconnect();
    this.manager.disconnect();
    this.isConnected = false;
    logger.info('Disconnected from email server');
  }

  /**
   * Full pipeline: Fetch -> Categorize -> Analyze -> Refine -> Manage
   */
  async processNewEmails(options = {}) {
    logger.info('Starting email processing pipeline for new emails...');

    // Step 1: Fetch new emails
    const emails = await this.fetchNewEmails(options);
    if (emails.length === 0) {
      logger.info('No new emails to process');
      return { emails: [], summary: { total: 0 } };
    }

    // Step 2-5: Process emails through pipeline
    return this._processPipeline(emails, options);
  }

  /**
   * Process emails from a specific period
   */
  async processEmailsByPeriod(startDate, endDate, options = {}) {
    logger.info('Starting email processing pipeline for period...', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Step 1: Fetch emails from period
    const emails = await this.fetchEmailsByPeriod(startDate, endDate, options);
    if (emails.length === 0) {
      logger.info('No emails found in the specified period');
      return { emails: [], summary: { total: 0 } };
    }

    // Step 2-5: Process emails through pipeline
    return this._processPipeline(emails, options);
  }

  /**
   * Process recent emails (last N days)
   */
  async processRecentEmails(days = 7, options = {}) {
    logger.info(`Starting email processing pipeline for last ${days} days...`);

    const emails = await this.fetchRecentEmails(days, options);
    if (emails.length === 0) {
      logger.info('No recent emails to process');
      return { emails: [], summary: { total: 0 } };
    }

    return this._processPipeline(emails, options);
  }

  /**
   * Core processing pipeline
   */
  async _processPipeline(emails, options = {}) {
    const results = {
      emails: [],
      stages: {},
      summary: {}
    };

    const { skipStages = [] } = options;

    // Stage 2: Initial Categorization
    if (!skipStages.includes('categorize')) {
      logger.info('Stage 2: Initial Categorization...');
      const categorizeResult = this.categorizeEmails(emails);
      results.stages.initialCategorization = categorizeResult.summary;
      emails = categorizeResult.emails;
    }

    // Stage 3: Analysis
    if (!skipStages.includes('analyze')) {
      logger.info('Stage 3: Analysis...');
      const analyzeResult = this.analyzeEmails(emails);
      results.stages.analysis = analyzeResult.summary;
      emails = analyzeResult.emails;
    }

    // Stage 4: Refined Categorization
    if (!skipStages.includes('refine')) {
      logger.info('Stage 4: Refined Categorization...');
      const refineResult = this.refineCategorization(emails);
      results.stages.refinedCategorization = refineResult.summary;
      emails = refineResult.emails;
    }

    // Stage 5: Management
    if (!skipStages.includes('manage')) {
      logger.info('Stage 5: Management...');
      const manageResult = await this.manageEmails(emails, options);
      results.stages.management = manageResult;
      emails = manageResult.processed.map(r => r.email);
    }

    // Store processed emails
    this.processedEmails = emails;

    // Generate final summary
    results.emails = emails;
    results.summary = this._generateFinalSummary(results);

    logger.info('Email processing pipeline complete', results.summary);

    return results;
  }

  /**
   * Step 1a: Fetch new/unseen emails
   */
  async fetchNewEmails(options = {}) {
    logger.info('Fetching new emails...');
    if (!this.isConnected) {
      await this.connect();
    }
    return this.fetchService.fetchNewEmails(options);
  }

  /**
   * Step 1b: Fetch emails by period
   */
  async fetchEmailsByPeriod(startDate, endDate, options = {}) {
    logger.info('Fetching emails by period...');
    if (!this.isConnected) {
      await this.connect();
    }
    return this.fetchService.fetchEmailsByPeriod(startDate, endDate, options);
  }

  /**
   * Step 1c: Fetch recent emails
   */
  async fetchRecentEmails(days = 7, options = {}) {
    logger.info(`Fetching emails from last ${days} days...`);
    if (!this.isConnected) {
      await this.connect();
    }
    return this.fetchService.fetchRecentEmails(days, options);
  }

  /**
   * Step 2: Initial categorization
   */
  categorizeEmails(emails) {
    logger.info(`Categorizing ${emails.length} emails...`);
    return this.initialCategorizer.categorizeAll(emails);
  }

  /**
   * Step 3: Analyze emails
   */
  analyzeEmails(emails) {
    logger.info(`Analyzing ${emails.length} emails...`);
    return this.analyzer.analyzeAll(emails);
  }

  /**
   * Step 4: Refined categorization
   */
  refineCategorization(emails) {
    logger.info(`Refining categorization for ${emails.length} emails...`);
    return this.refinedCategorizer.refineAll(emails);
  }

  /**
   * Step 5: Manage emails
   */
  async manageEmails(emails, options = {}) {
    logger.info(`Managing ${emails.length} emails...`);

    if (options.connectForManagement) {
      await this.manager.connect();
    }

    const results = await this.manager.processAll(emails, options);

    if (options.connectForManagement) {
      this.manager.disconnect();
    }

    return results;
  }

  /**
   * Get emails by category
   */
  getEmailsByCategory(category) {
    return this.processedEmails.filter(
      email => (email.refinedCategory || email.initialCategory) === category
    );
  }

  /**
   * Get emails by priority
   */
  getEmailsByPriority(priority) {
    return this.processedEmails.filter(email => email.priority === priority);
  }

  /**
   * Get urgent emails
   */
  getUrgentEmails() {
    return this.processedEmails.filter(
      email => email.priority === 'urgent' ||
               email.analysis?.urgency?.level === 'high'
    );
  }

  /**
   * Get suspicious emails
   */
  getSuspiciousEmails() {
    return this.processedEmails.filter(
      email => email.analysis?.spamScore >= 50 ||
               email.analysis?.phishingRisk >= 50
    );
  }

  /**
   * Get emails with action items
   */
  getEmailsWithActionItems() {
    return this.processedEmails.filter(
      email => email.analysis?.actionItems?.length > 0
    );
  }

  /**
   * Search processed emails
   */
  searchEmails(query, options = {}) {
    const {
      searchIn = ['subject', 'textBody', 'from'],
      caseSensitive = false
    } = options;

    const searchQuery = caseSensitive ? query : query.toLowerCase();

    return this.processedEmails.filter(email => {
      for (const field of searchIn) {
        let value = '';

        if (field === 'from') {
          value = email.getSenderEmail() || '';
        } else {
          value = email[field] || '';
        }

        if (!caseSensitive) {
          value = value.toLowerCase();
        }

        if (value.includes(searchQuery)) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Get mailbox status
   */
  async getMailboxStatus(folder = 'INBOX') {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.fetchService.getMailboxStatus(folder);
  }

  /**
   * Get available mailboxes
   */
  async getMailboxes() {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.fetchService.getMailboxes();
  }

  /**
   * Add a management rule
   */
  addRule(ruleType, rule) {
    return this.manager.addRule(ruleType, rule);
  }

  /**
   * Get all rules
   */
  getRules() {
    return this.manager.getRules();
  }

  /**
   * Generate management report
   */
  generateReport() {
    return this.manager.generateReport(this.processedEmails);
  }

  /**
   * Generate final summary
   */
  _generateFinalSummary(results) {
    const summary = {
      totalProcessed: results.emails.length,
      timestamp: new Date().toISOString(),
      stages: {}
    };

    // Include stage summaries
    for (const [stage, stageResult] of Object.entries(results.stages)) {
      if (stageResult) {
        summary.stages[stage] = typeof stageResult === 'object'
          ? stageResult
          : { completed: true };
      }
    }

    // Category distribution
    summary.categoryDistribution = {};
    summary.priorityDistribution = {};

    for (const email of results.emails) {
      const cat = email.refinedCategory || email.initialCategory || 'uncategorized';
      summary.categoryDistribution[cat] = (summary.categoryDistribution[cat] || 0) + 1;

      const priority = email.priority || 'normal';
      summary.priorityDistribution[priority] = (summary.priorityDistribution[priority] || 0) + 1;
    }

    return summary;
  }

  /**
   * Export processed emails to JSON
   */
  exportToJSON(filePath) {
    const fs = require('fs');
    const data = {
      exportedAt: new Date().toISOString(),
      totalEmails: this.processedEmails.length,
      emails: this.processedEmails.map(e => e.toJSON())
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    logger.info(`Exported ${this.processedEmails.length} emails to ${filePath}`);
    return filePath;
  }

  /**
   * Get processing statistics
   */
  getStatistics() {
    if (this.processedEmails.length === 0) {
      return { message: 'No emails processed yet' };
    }

    const stats = {
      totalEmails: this.processedEmails.length,
      byCategory: {},
      byPriority: {},
      sentimentDistribution: {},
      avgSpamScore: 0,
      avgPhishingRisk: 0,
      urgentCount: 0,
      withActionItems: 0,
      withAttachments: 0
    };

    let totalSpamScore = 0;
    let totalPhishingRisk = 0;

    for (const email of this.processedEmails) {
      // Category
      const cat = email.refinedCategory || email.initialCategory || 'uncategorized';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

      // Priority
      const priority = email.priority || 'normal';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

      // Sentiment
      const sentiment = email.analysis?.sentiment?.label || 'unknown';
      stats.sentimentDistribution[sentiment] = (stats.sentimentDistribution[sentiment] || 0) + 1;

      // Scores
      totalSpamScore += email.analysis?.spamScore || 0;
      totalPhishingRisk += email.analysis?.phishingRisk || 0;

      // Counts
      if (email.priority === 'urgent' || email.analysis?.urgency?.level === 'high') {
        stats.urgentCount++;
      }
      if (email.analysis?.actionItems?.length > 0) {
        stats.withActionItems++;
      }
      if (email.hasAttachments) {
        stats.withAttachments++;
      }
    }

    stats.avgSpamScore = (totalSpamScore / this.processedEmails.length).toFixed(2);
    stats.avgPhishingRisk = (totalPhishingRisk / this.processedEmails.length).toFixed(2);

    return stats;
  }
}

module.exports = EmailManagementSystem;
