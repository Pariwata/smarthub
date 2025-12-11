/**
 * Email Manager
 * Handles email management actions - archive, delete, move, label, etc.
 */

const Imap = require('imap');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');
const logger = require('../utils/logger');

class EmailManager {
  constructor(customConfig = {}) {
    this.imapConfig = { ...config.imap, ...customConfig };
    this.smtpConfig = { ...config.smtp, ...customConfig.smtp };
    this.connection = null;
    this.smtpTransport = null;
    this.isConnected = false;

    // Data storage paths
    this.dataDir = config.app.dataDir;
    this.emailStorePath = path.join(this.dataDir, 'emails');
    this.rulesPath = path.join(this.dataDir, 'rules.json');

    // Ensure directories exist
    this._ensureDirectories();

    // Management rules
    this.rules = this._loadRules();
  }

  /**
   * Ensure data directories exist
   */
  _ensureDirectories() {
    const dirs = [
      this.dataDir,
      this.emailStorePath,
      path.join(this.dataDir, 'archive'),
      path.join(this.dataDir, 'processed')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Load management rules
   */
  _loadRules() {
    try {
      if (fs.existsSync(this.rulesPath)) {
        return JSON.parse(fs.readFileSync(this.rulesPath, 'utf8'));
      }
    } catch (err) {
      logger.error('Error loading rules', { error: err.message });
    }

    return {
      autoArchive: [],
      autoDelete: [],
      autoLabel: [],
      autoMove: [],
      autoForward: []
    };
  }

  /**
   * Save management rules
   */
  _saveRules() {
    try {
      fs.writeFileSync(this.rulesPath, JSON.stringify(this.rules, null, 2));
    } catch (err) {
      logger.error('Error saving rules', { error: err.message });
    }
  }

  /**
   * Connect to IMAP server
   */
  connect() {
    return new Promise((resolve, reject) => {
      logger.emailManage('Connecting to IMAP server for management...');

      this.connection = new Imap({
        user: this.imapConfig.user,
        password: this.imapConfig.password,
        host: this.imapConfig.host,
        port: this.imapConfig.port,
        tls: this.imapConfig.tls,
        tlsOptions: this.imapConfig.tlsOptions
      });

      this.connection.once('ready', () => {
        this.isConnected = true;
        logger.emailManage('Connected to IMAP for management');
        resolve();
      });

      this.connection.once('error', (err) => {
        logger.error('IMAP management connection error', { error: err.message });
        reject(err);
      });

      this.connection.connect();
    });
  }

  /**
   * Disconnect from IMAP server
   */
  disconnect() {
    if (this.connection && this.isConnected) {
      this.connection.end();
      this.isConnected = false;
      logger.emailManage('Disconnected from IMAP');
    }
  }

  /**
   * Initialize SMTP transport for sending
   */
  initSMTP() {
    this.smtpTransport = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: {
        user: this.smtpConfig.user,
        pass: this.smtpConfig.password
      }
    });

    logger.emailManage('SMTP transport initialized');
  }

  /**
   * Process an email based on its analysis and categorization
   */
  async processEmail(email) {
    logger.emailManage(`Processing email: ${email.subject.substring(0, 50)}...`);

    const actions = [];

    // Apply auto-rules
    const autoActions = this._applyAutoRules(email);
    actions.push(...autoActions);

    // Apply category-based actions
    const categoryActions = this._applyCategoryActions(email);
    actions.push(...categoryActions);

    // Apply priority-based actions
    const priorityActions = this._applyPriorityActions(email);
    actions.push(...priorityActions);

    // Execute actions
    for (const action of actions) {
      await this._executeAction(email, action);
    }

    // Update email status
    email.status = 'processed';
    email.addAction('processed', { actions: actions.map(a => a.type) });

    logger.emailManage(`Processed email with ${actions.length} actions`);

    return {
      email,
      actionsPerformed: actions
    };
  }

  /**
   * Process multiple emails
   */
  async processAll(emails, options = {}) {
    logger.emailManage(`Processing ${emails.length} emails...`);

    const results = {
      processed: [],
      failed: [],
      actions: {}
    };

    for (const email of emails) {
      try {
        const result = await this.processEmail(email);
        results.processed.push(result);

        // Track action statistics
        for (const action of result.actionsPerformed) {
          results.actions[action.type] = (results.actions[action.type] || 0) + 1;
        }
      } catch (err) {
        logger.error('Failed to process email', {
          emailId: email.id,
          error: err.message
        });
        results.failed.push({ email, error: err.message });
      }
    }

    logger.emailManage('Batch processing complete', {
      processed: results.processed.length,
      failed: results.failed.length,
      actions: results.actions
    });

    return results;
  }

  /**
   * Apply automatic rules to email
   */
  _applyAutoRules(email) {
    const actions = [];
    const category = email.refinedCategory || email.initialCategory;

    // Auto-archive rule
    if (config.management.autoArchiveDays > 0) {
      const ageInDays = email.getAgeInDays();
      if (ageInDays > config.management.autoArchiveDays && email.priority === 'low') {
        actions.push({
          type: 'archive',
          reason: `Email older than ${config.management.autoArchiveDays} days with low priority`
        });
      }
    }

    // Auto-delete spam
    if (config.management.autoDeleteSpam && category === 'spam') {
      if (email.analysis?.spamScore >= 80) {
        actions.push({
          type: 'delete',
          reason: 'High spam score with auto-delete enabled'
        });
      }
    }

    // Custom rules
    for (const rule of this.rules.autoArchive) {
      if (this._matchesRule(email, rule)) {
        actions.push({ type: 'archive', reason: rule.name });
      }
    }

    for (const rule of this.rules.autoLabel) {
      if (this._matchesRule(email, rule)) {
        actions.push({ type: 'label', label: rule.label, reason: rule.name });
      }
    }

    for (const rule of this.rules.autoMove) {
      if (this._matchesRule(email, rule)) {
        actions.push({ type: 'move', folder: rule.folder, reason: rule.name });
      }
    }

    return actions;
  }

  /**
   * Apply category-based actions
   */
  _applyCategoryActions(email) {
    const actions = [];
    const category = email.refinedCategory || email.initialCategory;

    switch (category) {
      case 'spam':
        actions.push({
          type: 'move',
          folder: 'Spam',
          reason: 'Categorized as spam'
        });
        break;

      case 'promotions':
        actions.push({
          type: 'label',
          label: 'Promotions',
          reason: 'Categorized as promotion'
        });
        break;

      case 'social':
        actions.push({
          type: 'label',
          label: 'Social',
          reason: 'Categorized as social'
        });
        break;

      case 'updates':
        actions.push({
          type: 'label',
          label: 'Updates',
          reason: 'Categorized as update'
        });
        break;

      case 'financial':
        actions.push({
          type: 'label',
          label: 'Financial',
          reason: 'Categorized as financial'
        });
        actions.push({
          type: 'flag',
          flag: 'important',
          reason: 'Financial emails are important'
        });
        break;

      case 'work':
        actions.push({
          type: 'label',
          label: 'Work',
          reason: 'Categorized as work'
        });
        break;
    }

    return actions;
  }

  /**
   * Apply priority-based actions
   */
  _applyPriorityActions(email) {
    const actions = [];

    if (email.priority === 'urgent') {
      actions.push({
        type: 'flag',
        flag: 'flagged',
        reason: 'Urgent priority'
      });
      actions.push({
        type: 'notify',
        reason: 'Urgent email requires attention'
      });
    } else if (email.priority === 'high') {
      actions.push({
        type: 'flag',
        flag: 'important',
        reason: 'High priority'
      });
    }

    // Phishing warning
    if (email.analysis?.phishingRisk >= 50) {
      actions.push({
        type: 'warn',
        warning: 'Potential phishing attempt',
        reason: `Phishing risk score: ${email.analysis.phishingRisk}`
      });
    }

    return actions;
  }

  /**
   * Execute a single action on an email
   */
  async _executeAction(email, action) {
    logger.emailManage(`Executing action: ${action.type}`, { emailId: email.id, action });

    switch (action.type) {
      case 'move':
        await this.moveEmail(email, action.folder);
        break;

      case 'delete':
        await this.deleteEmail(email);
        break;

      case 'archive':
        await this.archiveEmail(email);
        break;

      case 'label':
        this.addLabel(email, action.label);
        break;

      case 'flag':
        await this.flagEmail(email, action.flag);
        break;

      case 'notify':
        this.createNotification(email, action);
        break;

      case 'warn':
        this.createWarning(email, action);
        break;

      case 'forward':
        await this.forwardEmail(email, action.to);
        break;

      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }

    email.addAction(action.type, action);
  }

  /**
   * Move email to a folder
   */
  async moveEmail(email, folder) {
    if (!this.isConnected) {
      logger.warn('Not connected to IMAP, simulating move');
      email.folder = folder;
      return;
    }

    return new Promise((resolve, reject) => {
      this.connection.openBox(email.folder || 'INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.connection.move(email.uid, folder, (moveErr) => {
          if (moveErr) {
            logger.error('Failed to move email', { error: moveErr.message });
            reject(moveErr);
          } else {
            logger.emailManage(`Moved email to ${folder}`);
            email.folder = folder;
            resolve();
          }
        });
      });
    });
  }

  /**
   * Delete an email
   */
  async deleteEmail(email) {
    if (!this.isConnected) {
      logger.warn('Not connected to IMAP, simulating delete');
      email.status = 'deleted';
      return;
    }

    return new Promise((resolve, reject) => {
      this.connection.openBox(email.folder || 'INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.connection.addFlags(email.uid, ['\\Deleted'], (flagErr) => {
          if (flagErr) {
            reject(flagErr);
            return;
          }

          this.connection.expunge([email.uid], (expErr) => {
            if (expErr) {
              logger.error('Failed to expunge email', { error: expErr.message });
            }
            email.status = 'deleted';
            logger.emailManage('Email deleted');
            resolve();
          });
        });
      });
    });
  }

  /**
   * Archive an email (move to Archive folder)
   */
  async archiveEmail(email) {
    // Save to local archive
    const archivePath = path.join(this.dataDir, 'archive', `${email.id}.json`);
    fs.writeFileSync(archivePath, JSON.stringify(email.toJSON(), null, 2));

    // Move on server
    await this.moveEmail(email, 'Archive');
    email.status = 'archived';

    logger.emailManage('Email archived');
  }

  /**
   * Add a label to an email
   */
  addLabel(email, label) {
    if (!email.labels.includes(label)) {
      email.labels.push(label);
      logger.emailManage(`Added label: ${label}`);
    }
  }

  /**
   * Remove a label from an email
   */
  removeLabel(email, label) {
    const index = email.labels.indexOf(label);
    if (index > -1) {
      email.labels.splice(index, 1);
      logger.emailManage(`Removed label: ${label}`);
    }
  }

  /**
   * Flag an email
   */
  async flagEmail(email, flag) {
    const flagMap = {
      'important': '\\Flagged',
      'flagged': '\\Flagged',
      'seen': '\\Seen',
      'read': '\\Seen'
    };

    const imapFlag = flagMap[flag] || flag;

    if (!this.isConnected) {
      logger.warn('Not connected to IMAP, updating local state only');
      if (flag === 'important' || flag === 'flagged') {
        email.isStarred = true;
        email.isImportant = true;
      }
      return;
    }

    return new Promise((resolve, reject) => {
      this.connection.openBox(email.folder || 'INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.connection.addFlags(email.uid, [imapFlag], (flagErr) => {
          if (flagErr) {
            logger.error('Failed to flag email', { error: flagErr.message });
            reject(flagErr);
          } else {
            email.flags.push(imapFlag);
            logger.emailManage(`Flagged email: ${flag}`);
            resolve();
          }
        });
      });
    });
  }

  /**
   * Mark email as read/seen
   */
  async markAsRead(email) {
    return this.flagEmail(email, 'seen');
  }

  /**
   * Mark email as unread
   */
  async markAsUnread(email) {
    if (!this.isConnected) {
      email.isRead = false;
      return;
    }

    return new Promise((resolve, reject) => {
      this.connection.openBox(email.folder || 'INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.connection.delFlags(email.uid, ['\\Seen'], (flagErr) => {
          if (flagErr) {
            reject(flagErr);
          } else {
            email.isRead = false;
            const index = email.flags.indexOf('\\Seen');
            if (index > -1) email.flags.splice(index, 1);
            logger.emailManage('Marked email as unread');
            resolve();
          }
        });
      });
    });
  }

  /**
   * Forward an email
   */
  async forwardEmail(email, to) {
    if (!this.smtpTransport) {
      this.initSMTP();
    }

    const mailOptions = {
      from: this.smtpConfig.user,
      to: to,
      subject: `Fwd: ${email.subject}`,
      text: `---------- Forwarded message ----------\n` +
            `From: ${email.getSenderEmail()}\n` +
            `Date: ${email.date}\n` +
            `Subject: ${email.subject}\n\n` +
            `${email.textBody}`,
      html: email.htmlBody ?
        `<p>---------- Forwarded message ----------</p>` +
        `<p>From: ${email.getSenderEmail()}<br>` +
        `Date: ${email.date}<br>` +
        `Subject: ${email.subject}</p>` +
        `<hr>${email.htmlBody}` : undefined
    };

    return new Promise((resolve, reject) => {
      this.smtpTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
          logger.error('Failed to forward email', { error: err.message });
          reject(err);
        } else {
          logger.emailManage(`Email forwarded to ${to}`);
          email.addAction('forwarded', { to });
          resolve(info);
        }
      });
    });
  }

  /**
   * Create a notification for an email
   */
  createNotification(email, action) {
    const notification = {
      type: 'email_notification',
      timestamp: new Date(),
      emailId: email.id,
      subject: email.subject,
      from: email.getSenderEmail(),
      priority: email.priority,
      reason: action.reason
    };

    logger.emailManage('Notification created', notification);
    // In a real app, this would push to a notification service
    return notification;
  }

  /**
   * Create a warning for an email
   */
  createWarning(email, action) {
    const warning = {
      type: 'email_warning',
      timestamp: new Date(),
      emailId: email.id,
      subject: email.subject,
      warning: action.warning,
      reason: action.reason
    };

    logger.warn('Email warning', warning);
    email.metadata.warnings = email.metadata.warnings || [];
    email.metadata.warnings.push(warning);
    return warning;
  }

  /**
   * Check if email matches a rule
   */
  _matchesRule(email, rule) {
    if (rule.from && !email.getSenderEmail()?.includes(rule.from)) {
      return false;
    }
    if (rule.subject && !email.subject?.toLowerCase().includes(rule.subject.toLowerCase())) {
      return false;
    }
    if (rule.category && email.refinedCategory !== rule.category) {
      return false;
    }
    if (rule.priority && email.priority !== rule.priority) {
      return false;
    }
    if (rule.olderThanDays && email.getAgeInDays() < rule.olderThanDays) {
      return false;
    }
    return true;
  }

  /**
   * Add a management rule
   */
  addRule(ruleType, rule) {
    if (!this.rules[ruleType]) {
      this.rules[ruleType] = [];
    }
    rule.id = `rule_${Date.now()}`;
    rule.createdAt = new Date();
    this.rules[ruleType].push(rule);
    this._saveRules();
    logger.emailManage(`Added rule: ${rule.name}`, { ruleType, rule });
    return rule;
  }

  /**
   * Remove a management rule
   */
  removeRule(ruleType, ruleId) {
    if (this.rules[ruleType]) {
      const index = this.rules[ruleType].findIndex(r => r.id === ruleId);
      if (index > -1) {
        this.rules[ruleType].splice(index, 1);
        this._saveRules();
        logger.emailManage(`Removed rule: ${ruleId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Get all rules
   */
  getRules() {
    return this.rules;
  }

  /**
   * Save email to local storage
   */
  saveEmailLocally(email) {
    const filePath = path.join(this.emailStorePath, `${email.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(email.toJSON(), null, 2));
    logger.emailManage(`Saved email locally: ${email.id}`);
    return filePath;
  }

  /**
   * Load email from local storage
   */
  loadEmailLocally(emailId) {
    const filePath = path.join(this.emailStorePath, `${emailId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const Email = require('../models/Email');
      return new Email(data);
    }
    return null;
  }

  /**
   * Generate management report
   */
  generateReport(emails) {
    const report = {
      generatedAt: new Date(),
      totalEmails: emails.length,
      byCategory: {},
      byPriority: {},
      byStatus: {},
      actionsTaken: {},
      warnings: [],
      recommendations: []
    };

    for (const email of emails) {
      // By category
      const cat = email.refinedCategory || email.initialCategory || 'uncategorized';
      report.byCategory[cat] = (report.byCategory[cat] || 0) + 1;

      // By priority
      const priority = email.priority || 'normal';
      report.byPriority[priority] = (report.byPriority[priority] || 0) + 1;

      // By status
      const status = email.status || 'new';
      report.byStatus[status] = (report.byStatus[status] || 0) + 1;

      // Actions taken
      for (const action of email.actionsTaken || []) {
        report.actionsTaken[action.action] =
          (report.actionsTaken[action.action] || 0) + 1;
      }

      // Collect warnings
      if (email.metadata?.warnings) {
        report.warnings.push(...email.metadata.warnings);
      }
    }

    // Generate recommendations
    if (report.byCategory.spam > emails.length * 0.2) {
      report.recommendations.push({
        type: 'spam_filter',
        message: 'High spam rate detected. Consider strengthening spam filters.'
      });
    }

    if (report.byPriority.urgent > 5) {
      report.recommendations.push({
        type: 'urgent_backlog',
        message: `${report.byPriority.urgent} urgent emails require attention.`
      });
    }

    return report;
  }
}

module.exports = EmailManager;
