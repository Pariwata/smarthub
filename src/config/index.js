/**
 * Configuration Management
 * Centralizes all application configuration with environment variable support
 */

require('dotenv').config();

const config = {
  // IMAP Configuration for receiving emails
  imap: {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT, 10) || 993,
    user: process.env.IMAP_USER || '',
    password: process.env.IMAP_PASSWORD || '',
    tls: process.env.IMAP_TLS !== 'false',
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 30000,
    connTimeout: 30000
  },

  // SMTP Configuration for sending emails
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    secure: process.env.SMTP_SECURE === 'true'
  },

  // Application Settings
  app: {
    logLevel: process.env.LOG_LEVEL || 'info',
    dataDir: process.env.DATA_DIR || './data',
    maxEmailsPerFetch: parseInt(process.env.MAX_EMAILS_PER_FETCH, 10) || 100,
    batchSize: parseInt(process.env.EMAIL_FETCH_BATCH_SIZE, 10) || 50
  },

  // Analysis Settings
  analysis: {
    confidenceThreshold: parseFloat(process.env.ANALYSIS_CONFIDENCE_THRESHOLD) || 0.7,
    autoCategorize: process.env.AUTO_CATEGORIZE !== 'false',
    enableSpamDetection: process.env.ENABLE_SPAM_DETECTION !== 'false'
  },

  // Management Settings
  management: {
    autoArchiveDays: parseInt(process.env.AUTO_ARCHIVE_DAYS, 10) || 30,
    autoDeleteSpam: process.env.AUTO_DELETE_SPAM === 'true',
    priorityKeywords: (process.env.PRIORITY_KEYWORDS || 'urgent,important,asap,deadline').split(',')
  },

  // Email Categories Definition
  categories: {
    PRIMARY: {
      id: 'primary',
      name: 'Primary',
      description: 'Important personal and work emails',
      priority: 1
    },
    SOCIAL: {
      id: 'social',
      name: 'Social',
      description: 'Social media notifications and updates',
      priority: 3
    },
    PROMOTIONS: {
      id: 'promotions',
      name: 'Promotions',
      description: 'Marketing emails, deals, and offers',
      priority: 4
    },
    UPDATES: {
      id: 'updates',
      name: 'Updates',
      description: 'Notifications, confirmations, and receipts',
      priority: 2
    },
    FORUMS: {
      id: 'forums',
      name: 'Forums',
      description: 'Mailing lists and forum notifications',
      priority: 3
    },
    SPAM: {
      id: 'spam',
      name: 'Spam',
      description: 'Unwanted or suspicious emails',
      priority: 5
    },
    WORK: {
      id: 'work',
      name: 'Work',
      description: 'Work-related correspondence',
      priority: 1
    },
    PERSONAL: {
      id: 'personal',
      name: 'Personal',
      description: 'Personal correspondence from known contacts',
      priority: 1
    },
    FINANCIAL: {
      id: 'financial',
      name: 'Financial',
      description: 'Banking, bills, and financial notifications',
      priority: 1
    },
    NEWSLETTERS: {
      id: 'newsletters',
      name: 'Newsletters',
      description: 'Newsletter subscriptions',
      priority: 3
    }
  }
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const errors = [];

  if (!config.imap.user) {
    errors.push('IMAP_USER is required');
  }
  if (!config.imap.password) {
    errors.push('IMAP_PASSWORD is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = { config, validateConfig };
