/**
 * Email Fetch Service
 * Handles fetching emails from IMAP server - new emails or specific period
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { config } = require('../config');
const logger = require('../utils/logger');
const Email = require('../models/Email');

class EmailFetchService {
  constructor(customConfig = {}) {
    this.imapConfig = { ...config.imap, ...customConfig };
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to IMAP server
   */
  connect() {
    return new Promise((resolve, reject) => {
      logger.emailFetch('Connecting to IMAP server...', { host: this.imapConfig.host });

      this.connection = new Imap({
        user: this.imapConfig.user,
        password: this.imapConfig.password,
        host: this.imapConfig.host,
        port: this.imapConfig.port,
        tls: this.imapConfig.tls,
        tlsOptions: this.imapConfig.tlsOptions,
        authTimeout: this.imapConfig.authTimeout,
        connTimeout: this.imapConfig.connTimeout
      });

      this.connection.once('ready', () => {
        this.isConnected = true;
        logger.emailFetch('Connected to IMAP server successfully');
        resolve();
      });

      this.connection.once('error', (err) => {
        logger.error('IMAP connection error', { error: err.message });
        reject(err);
      });

      this.connection.once('end', () => {
        this.isConnected = false;
        logger.emailFetch('IMAP connection ended');
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
      logger.emailFetch('Disconnected from IMAP server');
    }
  }

  /**
   * Open a mailbox folder
   */
  openBox(boxName = 'INBOX', readOnly = true) {
    return new Promise((resolve, reject) => {
      this.connection.openBox(boxName, readOnly, (err, box) => {
        if (err) {
          logger.error('Error opening mailbox', { box: boxName, error: err.message });
          reject(err);
        } else {
          logger.emailFetch(`Opened mailbox: ${boxName}`, { totalMessages: box.messages.total });
          resolve(box);
        }
      });
    });
  }

  /**
   * Get list of available mailboxes
   */
  getMailboxes() {
    return new Promise((resolve, reject) => {
      this.connection.getBoxes((err, boxes) => {
        if (err) {
          logger.error('Error getting mailboxes', { error: err.message });
          reject(err);
        } else {
          resolve(boxes);
        }
      });
    });
  }

  /**
   * Fetch new/unseen emails
   */
  async fetchNewEmails(options = {}) {
    const {
      folder = 'INBOX',
      limit = config.app.maxEmailsPerFetch,
      markAsSeen = false
    } = options;

    logger.emailFetch('Fetching new emails...', { folder, limit });

    await this.openBox(folder, !markAsSeen);

    return new Promise((resolve, reject) => {
      this.connection.search(['UNSEEN'], (err, uids) => {
        if (err) {
          logger.error('Error searching for unseen emails', { error: err.message });
          reject(err);
          return;
        }

        if (!uids || uids.length === 0) {
          logger.emailFetch('No new emails found');
          resolve([]);
          return;
        }

        const limitedUids = uids.slice(0, limit);
        logger.emailFetch(`Found ${uids.length} new emails, fetching ${limitedUids.length}`);

        this._fetchEmailsByUids(limitedUids, folder)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Fetch emails from a specific date range
   */
  async fetchEmailsByPeriod(startDate, endDate, options = {}) {
    const {
      folder = 'INBOX',
      limit = config.app.maxEmailsPerFetch,
      includeRead = true
    } = options;

    logger.emailFetch('Fetching emails by period...', {
      folder,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    await this.openBox(folder, true);

    // Format dates for IMAP search
    const sinceDate = this._formatDateForIMAP(startDate);
    const beforeDate = this._formatDateForIMAP(new Date(endDate.getTime() + 86400000)); // Add one day

    return new Promise((resolve, reject) => {
      const searchCriteria = [
        ['SINCE', sinceDate],
        ['BEFORE', beforeDate]
      ];

      if (!includeRead) {
        searchCriteria.push('UNSEEN');
      }

      this.connection.search(searchCriteria, (err, uids) => {
        if (err) {
          logger.error('Error searching emails by period', { error: err.message });
          reject(err);
          return;
        }

        if (!uids || uids.length === 0) {
          logger.emailFetch('No emails found in the specified period');
          resolve([]);
          return;
        }

        const limitedUids = uids.slice(0, limit);
        logger.emailFetch(`Found ${uids.length} emails in period, fetching ${limitedUids.length}`);

        this._fetchEmailsByUids(limitedUids, folder)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Fetch emails from the last N days
   */
  async fetchRecentEmails(days = 7, options = {}) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    logger.emailFetch(`Fetching emails from last ${days} days`);

    return this.fetchEmailsByPeriod(startDate, endDate, options);
  }

  /**
   * Fetch emails by specific UIDs
   */
  async fetchByUIDs(uids, folder = 'INBOX') {
    if (!uids || uids.length === 0) {
      return [];
    }

    await this.openBox(folder, true);
    return this._fetchEmailsByUids(uids, folder);
  }

  /**
   * Fetch a single email by UID
   */
  async fetchSingleEmail(uid, folder = 'INBOX') {
    const emails = await this.fetchByUIDs([uid], folder);
    return emails.length > 0 ? emails[0] : null;
  }

  /**
   * Search emails by criteria
   */
  async searchEmails(criteria, options = {}) {
    const {
      folder = 'INBOX',
      limit = config.app.maxEmailsPerFetch
    } = options;

    await this.openBox(folder, true);

    return new Promise((resolve, reject) => {
      this.connection.search(criteria, (err, uids) => {
        if (err) {
          logger.error('Error searching emails', { error: err.message });
          reject(err);
          return;
        }

        if (!uids || uids.length === 0) {
          resolve([]);
          return;
        }

        const limitedUids = uids.slice(0, limit);
        this._fetchEmailsByUids(limitedUids, folder)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Search emails by sender
   */
  async fetchFromSender(senderEmail, options = {}) {
    logger.emailFetch(`Fetching emails from sender: ${senderEmail}`);
    return this.searchEmails([['FROM', senderEmail]], options);
  }

  /**
   * Search emails by subject
   */
  async fetchBySubject(subjectQuery, options = {}) {
    logger.emailFetch(`Fetching emails with subject containing: ${subjectQuery}`);
    return this.searchEmails([['SUBJECT', subjectQuery]], options);
  }

  /**
   * Get mailbox status (total, unseen, etc.)
   */
  async getMailboxStatus(folder = 'INBOX') {
    const box = await this.openBox(folder, true);
    return {
      name: folder,
      total: box.messages.total,
      new: box.messages.new,
      uidvalidity: box.uidvalidity,
      uidnext: box.uidnext,
      flags: box.flags,
      permFlags: box.permFlags
    };
  }

  /**
   * Internal: Fetch emails by UIDs
   */
  _fetchEmailsByUids(uids, folder) {
    return new Promise((resolve, reject) => {
      const emails = [];
      let completed = 0;
      const total = uids.length;

      if (total === 0) {
        resolve([]);
        return;
      }

      const fetch = this.connection.fetch(uids, {
        bodies: '',
        struct: true
      });

      fetch.on('message', (msg, seqno) => {
        let uid = null;
        let attributes = null;
        let buffer = '';

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });

        msg.once('attributes', (attrs) => {
          uid = attrs.uid;
          attributes = attrs;
        });

        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(buffer);
            const email = Email.fromIMAPData(
              { uid, flags: attributes.flags, folder },
              parsed
            );
            emails.push(email);
            completed++;

            if (completed === total) {
              logger.emailFetch(`Successfully fetched ${emails.length} emails`);
              resolve(emails);
            }
          } catch (parseErr) {
            logger.error('Error parsing email', { uid, error: parseErr.message });
            completed++;
            if (completed === total) {
              resolve(emails);
            }
          }
        });
      });

      fetch.once('error', (err) => {
        logger.error('Fetch error', { error: err.message });
        reject(err);
      });

      fetch.once('end', () => {
        // All messages fetched
      });
    });
  }

  /**
   * Format date for IMAP search
   */
  _formatDateForIMAP(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  }

  /**
   * Batch fetch with progress callback
   */
  async fetchWithProgress(fetchMethod, options = {}, onProgress = null) {
    const batchSize = config.app.batchSize;
    const allEmails = [];
    let batch = 0;

    // This method would need to be implemented differently
    // depending on how we want to handle batching
    // For now, we'll use the standard fetch
    const emails = await fetchMethod.call(this, options);

    if (onProgress) {
      onProgress({
        total: emails.length,
        fetched: emails.length,
        percentage: 100
      });
    }

    return emails;
  }
}

module.exports = EmailFetchService;
