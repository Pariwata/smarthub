/**
 * Email API Routes
 * REST API endpoints for email management operations
 */

const express = require('express');
const router = express.Router();
const EmailManagementSystem = require('../EmailManagementSystem');
const logger = require('../utils/logger');

// Create system instance (singleton for the API)
let system = null;
let isProcessing = false;
let lastResults = null;

/**
 * Initialize or get the system instance
 */
function getSystem() {
  if (!system) {
    system = new EmailManagementSystem();
  }
  return system;
}

/**
 * GET /api/status
 * Get system and mailbox status
 */
router.get('/status', async (req, res) => {
  try {
    const sys = getSystem();
    await sys.connect();

    const folder = req.query.folder || 'INBOX';
    const status = await sys.getMailboxStatus(folder);

    res.json({
      success: true,
      connected: sys.isConnected,
      mailbox: status,
      processedCount: sys.processedEmails?.length || 0,
      isProcessing
    });
  } catch (error) {
    logger.error('Status error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/mailboxes
 * Get list of available mailboxes
 */
router.get('/mailboxes', async (req, res) => {
  try {
    const sys = getSystem();
    await sys.connect();
    const mailboxes = await sys.getMailboxes();

    res.json({ success: true, mailboxes });
  } catch (error) {
    logger.error('Mailboxes error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/check
 * Check/fetch emails based on criteria
 */
router.post('/check', async (req, res) => {
  try {
    const { type = 'new', days = 7, startDate, endDate, folder = 'INBOX', limit = 50 } = req.body;

    const sys = getSystem();
    await sys.connect();

    let emails = [];
    const options = { folder, limit };

    switch (type) {
      case 'new':
        emails = await sys.fetchNewEmails(options);
        break;
      case 'recent':
        emails = await sys.fetchRecentEmails(days, options);
        break;
      case 'period':
        emails = await sys.fetchEmailsByPeriod(new Date(startDate), new Date(endDate), options);
        break;
      default:
        emails = await sys.fetchNewEmails(options);
    }

    res.json({
      success: true,
      count: emails.length,
      emails: emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Check error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/process
 * Run full processing pipeline
 */
router.post('/process', async (req, res) => {
  if (isProcessing) {
    return res.status(409).json({ success: false, error: 'Processing already in progress' });
  }

  try {
    isProcessing = true;
    const { type = 'new', days = 7, startDate, endDate, skipStages = [] } = req.body;

    const sys = getSystem();
    const options = { skipStages };

    let results;

    switch (type) {
      case 'new':
        results = await sys.processNewEmails(options);
        break;
      case 'recent':
        results = await sys.processRecentEmails(days, options);
        break;
      case 'period':
        results = await sys.processEmailsByPeriod(new Date(startDate), new Date(endDate), options);
        break;
      default:
        results = await sys.processNewEmails(options);
    }

    lastResults = results;

    res.json({
      success: true,
      count: results.emails.length,
      summary: results.summary,
      emails: results.emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Process error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  } finally {
    isProcessing = false;
  }
});

/**
 * GET /api/emails
 * Get processed emails with optional filters
 */
router.get('/emails', (req, res) => {
  try {
    const sys = getSystem();
    let emails = sys.processedEmails || [];

    // Apply filters
    const { category, priority, search, limit = 100, offset = 0 } = req.query;

    if (category) {
      emails = emails.filter(e =>
        (e.refinedCategory || e.initialCategory) === category
      );
    }

    if (priority) {
      emails = emails.filter(e => e.priority === priority);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      emails = emails.filter(e =>
        e.subject?.toLowerCase().includes(searchLower) ||
        e.getSenderEmail()?.toLowerCase().includes(searchLower) ||
        e.textBody?.toLowerCase().includes(searchLower)
      );
    }

    const total = emails.length;
    emails = emails.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      total,
      count: emails.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      emails: emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Emails error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/emails/:id
 * Get a single email by ID
 */
router.get('/emails/:id', (req, res) => {
  try {
    const sys = getSystem();
    const email = sys.processedEmails?.find(e => e.id === req.params.id);

    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    res.json({
      success: true,
      email: formatEmailForResponse(email, true)
    });
  } catch (error) {
    logger.error('Email detail error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/emails/category/:category
 * Get emails by category
 */
router.get('/emails/category/:category', (req, res) => {
  try {
    const sys = getSystem();
    const emails = sys.getEmailsByCategory(req.params.category) || [];

    res.json({
      success: true,
      category: req.params.category,
      count: emails.length,
      emails: emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Category emails error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/emails/priority/:priority
 * Get emails by priority
 */
router.get('/emails/priority/:priority', (req, res) => {
  try {
    const sys = getSystem();
    const emails = sys.getEmailsByPriority(req.params.priority) || [];

    res.json({
      success: true,
      priority: req.params.priority,
      count: emails.length,
      emails: emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Priority emails error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/urgent
 * Get urgent emails
 */
router.get('/urgent', (req, res) => {
  try {
    const sys = getSystem();
    const emails = sys.getUrgentEmails() || [];

    res.json({
      success: true,
      count: emails.length,
      emails: emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Urgent emails error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/suspicious
 * Get suspicious/spam/phishing emails
 */
router.get('/suspicious', (req, res) => {
  try {
    const sys = getSystem();
    const emails = sys.getSuspiciousEmails() || [];

    res.json({
      success: true,
      count: emails.length,
      emails: emails.map(e => formatEmailForResponse(e))
    });
  } catch (error) {
    logger.error('Suspicious emails error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/action-items
 * Get emails with action items
 */
router.get('/action-items', (req, res) => {
  try {
    const sys = getSystem();
    const emails = sys.getEmailsWithActionItems() || [];

    res.json({
      success: true,
      count: emails.length,
      emails: emails.map(e => ({
        ...formatEmailForResponse(e),
        actionItems: e.analysis?.actionItems || []
      }))
    });
  } catch (error) {
    logger.error('Action items error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/statistics
 * Get email statistics
 */
router.get('/statistics', (req, res) => {
  try {
    const sys = getSystem();
    const stats = sys.getStatistics();

    res.json({ success: true, statistics: stats });
  } catch (error) {
    logger.error('Statistics error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/report
 * Generate management report
 */
router.get('/report', (req, res) => {
  try {
    const sys = getSystem();
    const report = sys.generateReport();

    res.json({ success: true, report });
  } catch (error) {
    logger.error('Report error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/manage/:id
 * Apply management action to an email
 */
router.post('/manage/:id', async (req, res) => {
  try {
    const { action, params = {} } = req.body;
    const sys = getSystem();
    const email = sys.processedEmails?.find(e => e.id === req.params.id);

    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    // Apply action
    switch (action) {
      case 'archive':
        await sys.manager.archiveEmail(email);
        break;
      case 'delete':
        await sys.manager.deleteEmail(email);
        break;
      case 'move':
        await sys.manager.moveEmail(email, params.folder);
        break;
      case 'label':
        sys.manager.addLabel(email, params.label);
        break;
      case 'unlabel':
        sys.manager.removeLabel(email, params.label);
        break;
      case 'flag':
        await sys.manager.flagEmail(email, params.flag || 'important');
        break;
      case 'markRead':
        await sys.manager.markAsRead(email);
        break;
      case 'markUnread':
        await sys.manager.markAsUnread(email);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    res.json({
      success: true,
      action,
      email: formatEmailForResponse(email)
    });
  } catch (error) {
    logger.error('Manage error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/rules
 * Get all management rules
 */
router.get('/rules', (req, res) => {
  try {
    const sys = getSystem();
    const rules = sys.getRules();

    res.json({ success: true, rules });
  } catch (error) {
    logger.error('Rules error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/rules
 * Add a new rule
 */
router.post('/rules', (req, res) => {
  try {
    const { type, rule } = req.body;
    const sys = getSystem();
    const newRule = sys.addRule(type, rule);

    res.json({ success: true, rule: newRule });
  } catch (error) {
    logger.error('Add rule error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/categories
 * Get all available categories
 */
router.get('/categories', (req, res) => {
  const { config } = require('../config');
  res.json({
    success: true,
    categories: Object.values(config.categories)
  });
});

/**
 * Format email for API response
 */
function formatEmailForResponse(email, includeBody = false) {
  const formatted = {
    id: email.id,
    uid: email.uid,
    subject: email.subject,
    from: email.getSenderEmail(),
    fromName: email.getSenderName(),
    to: email.to?.map(t => t.address || t) || [],
    date: email.date,
    preview: email.getPreview(150),
    category: email.refinedCategory || email.initialCategory,
    initialCategory: email.initialCategory,
    priority: email.priority,
    status: email.status,
    labels: email.labels,
    flags: email.flags,
    isRead: email.isRead,
    isStarred: email.isStarred,
    hasAttachments: email.hasAttachments,
    attachmentCount: email.attachments?.length || 0,
    analysis: email.analysis ? {
      sentiment: email.analysis.sentiment,
      urgency: email.analysis.urgency,
      spamScore: email.analysis.spamScore,
      phishingRisk: email.analysis.phishingRisk,
      keywords: email.analysis.keywords?.slice(0, 5),
      topics: email.analysis.topics?.slice(0, 5),
      readingTime: email.analysis.readingTime,
      actionItems: email.analysis.actionItems
    } : null,
    categoryConfidence: email.categoryConfidence,
    subcategories: email.subcategories
  };

  if (includeBody) {
    formatted.textBody = email.textBody;
    formatted.htmlBody = email.htmlBody;
    formatted.attachments = email.attachments;
    formatted.fullAnalysis = email.analysis;
  }

  return formatted;
}

module.exports = router;
