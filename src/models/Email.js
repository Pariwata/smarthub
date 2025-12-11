/**
 * Email Model
 * Represents an email with all its properties and metadata
 */

const { v4: uuidv4 } = require('uuid');

class Email {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.messageId = data.messageId || null;
    this.uid = data.uid || null;

    // Core email properties
    this.subject = data.subject || '';
    this.from = data.from || [];
    this.to = data.to || [];
    this.cc = data.cc || [];
    this.bcc = data.bcc || [];
    this.replyTo = data.replyTo || [];

    // Content
    this.textBody = data.textBody || '';
    this.htmlBody = data.htmlBody || '';
    this.snippet = data.snippet || '';

    // Attachments
    this.attachments = data.attachments || [];
    this.hasAttachments = data.hasAttachments || false;

    // Dates
    this.date = data.date ? new Date(data.date) : new Date();
    this.receivedDate = data.receivedDate ? new Date(data.receivedDate) : new Date();
    this.fetchedAt = data.fetchedAt ? new Date(data.fetchedAt) : new Date();

    // Flags and status
    this.flags = data.flags || [];
    this.isRead = data.isRead || false;
    this.isStarred = data.isStarred || false;
    this.isImportant = data.isImportant || false;

    // Categorization (initial)
    this.initialCategory = data.initialCategory || null;

    // Analysis results
    this.analysis = data.analysis || {
      sentiment: null,
      urgency: null,
      topics: [],
      entities: [],
      keywords: [],
      language: null,
      readingTime: null,
      spamScore: 0,
      phishingRisk: 0
    };

    // Refined categorization (after analysis)
    this.refinedCategory = data.refinedCategory || null;
    this.categoryConfidence = data.categoryConfidence || 0;
    this.subcategories = data.subcategories || [];

    // Management metadata
    this.labels = data.labels || [];
    this.folder = data.folder || 'INBOX';
    this.priority = data.priority || 'normal'; // low, normal, high, urgent
    this.status = data.status || 'new'; // new, processed, archived, deleted
    this.actionsTaken = data.actionsTaken || [];

    // Custom metadata
    this.metadata = data.metadata || {};
  }

  /**
   * Get sender email address
   */
  getSenderEmail() {
    if (this.from && this.from.length > 0) {
      return this.from[0].address || this.from[0];
    }
    return null;
  }

  /**
   * Get sender name
   */
  getSenderName() {
    if (this.from && this.from.length > 0) {
      return this.from[0].name || this.getSenderEmail();
    }
    return null;
  }

  /**
   * Get domain of sender
   */
  getSenderDomain() {
    const email = this.getSenderEmail();
    if (email && email.includes('@')) {
      return email.split('@')[1].toLowerCase();
    }
    return null;
  }

  /**
   * Get a preview/snippet of the email content
   */
  getPreview(maxLength = 200) {
    if (this.snippet) {
      return this.snippet.substring(0, maxLength);
    }
    const content = this.textBody || this.htmlBody.replace(/<[^>]*>/g, '');
    return content.substring(0, maxLength).trim() + (content.length > maxLength ? '...' : '');
  }

  /**
   * Check if email contains specific keywords
   */
  containsKeywords(keywords) {
    const content = `${this.subject} ${this.textBody}`.toLowerCase();
    return keywords.some(keyword => content.includes(keyword.toLowerCase()));
  }

  /**
   * Get word count
   */
  getWordCount() {
    const content = this.textBody || this.htmlBody.replace(/<[^>]*>/g, '');
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate estimated reading time in minutes
   */
  getReadingTime() {
    const wordsPerMinute = 200;
    const wordCount = this.getWordCount();
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Check if email is from a specific period
   */
  isFromPeriod(startDate, endDate) {
    const emailDate = this.date.getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return emailDate >= start && emailDate <= end;
  }

  /**
   * Get age of email in days
   */
  getAgeInDays() {
    const now = new Date();
    const diffTime = Math.abs(now - this.date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Add an action to the email history
   */
  addAction(action, details = {}) {
    this.actionsTaken.push({
      action,
      details,
      timestamp: new Date()
    });
  }

  /**
   * Set analysis results
   */
  setAnalysis(analysisResults) {
    this.analysis = { ...this.analysis, ...analysisResults };
  }

  /**
   * Set refined category
   */
  setRefinedCategory(category, confidence = 0, subcategories = []) {
    this.refinedCategory = category;
    this.categoryConfidence = confidence;
    this.subcategories = subcategories;
  }

  /**
   * Get the final category (refined if available, otherwise initial)
   */
  getFinalCategory() {
    return this.refinedCategory || this.initialCategory;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      messageId: this.messageId,
      uid: this.uid,
      subject: this.subject,
      from: this.from,
      to: this.to,
      cc: this.cc,
      bcc: this.bcc,
      replyTo: this.replyTo,
      textBody: this.textBody,
      htmlBody: this.htmlBody,
      snippet: this.snippet,
      attachments: this.attachments,
      hasAttachments: this.hasAttachments,
      date: this.date,
      receivedDate: this.receivedDate,
      fetchedAt: this.fetchedAt,
      flags: this.flags,
      isRead: this.isRead,
      isStarred: this.isStarred,
      isImportant: this.isImportant,
      initialCategory: this.initialCategory,
      analysis: this.analysis,
      refinedCategory: this.refinedCategory,
      categoryConfidence: this.categoryConfidence,
      subcategories: this.subcategories,
      labels: this.labels,
      folder: this.folder,
      priority: this.priority,
      status: this.status,
      actionsTaken: this.actionsTaken,
      metadata: this.metadata
    };
  }

  /**
   * Create Email instance from raw IMAP data
   */
  static fromIMAPData(imapData, parsedContent) {
    return new Email({
      messageId: parsedContent.messageId,
      uid: imapData.uid,
      subject: parsedContent.subject || '(No Subject)',
      from: parsedContent.from?.value || [],
      to: parsedContent.to?.value || [],
      cc: parsedContent.cc?.value || [],
      bcc: parsedContent.bcc?.value || [],
      replyTo: parsedContent.replyTo?.value || [],
      textBody: parsedContent.text || '',
      htmlBody: parsedContent.html || '',
      attachments: (parsedContent.attachments || []).map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size
      })),
      hasAttachments: (parsedContent.attachments || []).length > 0,
      date: parsedContent.date || new Date(),
      flags: imapData.flags || [],
      isRead: (imapData.flags || []).includes('\\Seen'),
      isStarred: (imapData.flags || []).includes('\\Flagged'),
      folder: imapData.folder || 'INBOX'
    });
  }
}

module.exports = Email;
