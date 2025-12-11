/**
 * Initial Categorizer
 * Rule-based categorization of emails before detailed analysis
 * Fast, first-pass categorization based on sender, subject, and basic content patterns
 */

const { config } = require('../config');
const logger = require('../utils/logger');

class InitialCategorizer {
  constructor() {
    this.categories = config.categories;
    this.rules = this._initializeRules();
  }

  /**
   * Initialize categorization rules
   */
  _initializeRules() {
    return {
      // Sender domain patterns
      senderDomains: {
        social: [
          'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
          'tiktok.com', 'snapchat.com', 'pinterest.com', 'reddit.com',
          'facebookmail.com', 'x.com', 'threads.net'
        ],
        promotions: [
          'marketing.', 'promo.', 'deals.', 'offers.',
          'newsletter.', 'campaign.', 'mailchimp.com',
          'sendgrid.net', 'constantcontact.com', 'klaviyo.com'
        ],
        financial: [
          'paypal.com', 'stripe.com', 'square.com', 'venmo.com',
          'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citi.com',
          'capitalone.com', 'amex.com', 'discover.com', 'mint.com'
        ],
        updates: [
          'notifications.', 'alerts.', 'no-reply.', 'noreply.',
          'support.', 'info.', 'updates.', 'status.'
        ],
        newsletters: [
          'substack.com', 'mailchi.mp', 'beehiiv.com', 'convertkit.com',
          'buttondown.email', 'revue.co'
        ]
      },

      // Subject line patterns
      subjectPatterns: {
        promotions: [
          /\b(sale|discount|off|deal|save|free|offer|limited time|expires?|promo)\b/i,
          /\d+%\s*(off|discount)/i,
          /\$\d+\s*(off|cashback)/i,
          /\b(black friday|cyber monday|flash sale|clearance)\b/i
        ],
        updates: [
          /\b(order|shipping|delivery|tracking|shipped|delivered)\b/i,
          /\b(confirmation|receipt|invoice|statement)\b/i,
          /\b(password reset|verify|verification|confirm)\b/i,
          /\b(update|notification|alert|reminder)\b/i
        ],
        social: [
          /\b(commented|liked|mentioned|tagged|followed|shared)\b/i,
          /\b(friend request|connection|message from)\b/i,
          /\b(new follower|new like|new comment)\b/i
        ],
        financial: [
          /\b(payment|transaction|transfer|deposit|withdrawal)\b/i,
          /\b(balance|statement|bill|invoice)\b/i,
          /\b(credit card|debit card|bank account)\b/i
        ],
        forums: [
          /\b(digest|summary|weekly|daily)\b.*\b(forum|list|group)\b/i,
          /\[[\w-]+\]/i, // Mailing list prefix like [list-name]
          /^re:\s*\[/i
        ],
        spam: [
          /\b(winner|won|lottery|prize|congratulations)\b/i,
          /\b(urgent|act now|immediate action|wire transfer)\b/i,
          /\b(nigerian|inheritance|beneficiary)\b/i,
          /\b(viagra|cialis|pharmacy|medication)\b/i
        ],
        newsletters: [
          /\b(newsletter|digest|weekly|monthly|roundup)\b/i,
          /\b(edition|issue|volume)\b.*\d+/i
        ],
        work: [
          /\b(meeting|calendar|schedule|agenda|project)\b/i,
          /\b(deadline|milestone|review|approval)\b/i,
          /\b(team|sprint|standup|retrospective)\b/i
        ]
      },

      // Content patterns for quick categorization
      contentPatterns: {
        promotions: [
          /\b(unsubscribe|opt.out|email preferences)\b/i,
          /\b(shop now|buy now|order now|get it now)\b/i,
          /\b(limited offer|exclusive|members only)\b/i
        ],
        spam: [
          /\b(click here to claim|act immediately)\b/i,
          /\b(100% free|no obligation|risk free)\b/i,
          /\b(million dollars|large sum|cash prize)\b/i
        ],
        newsletters: [
          /\b(read more|continue reading|full article)\b/i,
          /\b(this week in|top stories|highlights)\b/i
        ]
      },

      // Trusted sender patterns (for primary/personal categorization)
      trustedPatterns: {
        personal: [
          // Emails from known contacts would be added dynamically
        ],
        work: [
          // Work domain would be configured
        ]
      }
    };
  }

  /**
   * Categorize a single email
   */
  categorize(email) {
    logger.emailCategorize(`Categorizing email: ${email.subject.substring(0, 50)}...`);

    const scores = this._calculateCategoryScores(email);
    const topCategory = this._selectTopCategory(scores);

    email.initialCategory = topCategory.category;
    email.categoryConfidence = topCategory.confidence;

    logger.emailCategorize(`Initial category: ${topCategory.category}`, {
      confidence: topCategory.confidence,
      scores
    });

    return email;
  }

  /**
   * Categorize multiple emails
   */
  categorizeAll(emails) {
    logger.emailCategorize(`Categorizing ${emails.length} emails...`);

    const categorized = emails.map(email => this.categorize(email));

    // Generate summary
    const summary = this._generateCategorySummary(categorized);
    logger.emailCategorize('Categorization complete', summary);

    return {
      emails: categorized,
      summary
    };
  }

  /**
   * Calculate scores for each category
   */
  _calculateCategoryScores(email) {
    const scores = {};

    // Initialize all category scores
    Object.keys(this.categories).forEach(cat => {
      scores[this.categories[cat].id] = 0;
    });

    // Score based on sender domain
    this._scoreSenderDomain(email, scores);

    // Score based on subject patterns
    this._scoreSubjectPatterns(email, scores);

    // Score based on content patterns
    this._scoreContentPatterns(email, scores);

    // Score based on email properties
    this._scoreEmailProperties(email, scores);

    return scores;
  }

  /**
   * Score based on sender domain
   */
  _scoreSenderDomain(email, scores) {
    const domain = email.getSenderDomain();
    if (!domain) return;

    for (const [category, domains] of Object.entries(this.rules.senderDomains)) {
      for (const pattern of domains) {
        if (domain.includes(pattern) || pattern.includes(domain)) {
          scores[category] = (scores[category] || 0) + 30;
        }
      }
    }
  }

  /**
   * Score based on subject line patterns
   */
  _scoreSubjectPatterns(email, scores) {
    const subject = email.subject || '';

    for (const [category, patterns] of Object.entries(this.rules.subjectPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(subject)) {
          scores[category] = (scores[category] || 0) + 20;
        }
      }
    }
  }

  /**
   * Score based on content patterns
   */
  _scoreContentPatterns(email, scores) {
    const content = (email.textBody || '').substring(0, 2000); // Check first 2000 chars

    for (const [category, patterns] of Object.entries(this.rules.contentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          scores[category] = (scores[category] || 0) + 15;
        }
      }
    }
  }

  /**
   * Score based on email properties
   */
  _scoreEmailProperties(email, scores) {
    // Has unsubscribe header or link -> likely promotional/newsletter
    if (email.htmlBody && /unsubscribe/i.test(email.htmlBody)) {
      scores.promotions = (scores.promotions || 0) + 10;
      scores.newsletters = (scores.newsletters || 0) + 10;
    }

    // Has many recipients -> likely mass email
    if (email.to && email.to.length > 5) {
      scores.forums = (scores.forums || 0) + 10;
    }

    // Has attachments -> could be work-related
    if (email.hasAttachments) {
      scores.work = (scores.work || 0) + 5;
      scores.primary = (scores.primary || 0) + 5;
    }

    // Is flagged/starred -> important
    if (email.isStarred || email.isImportant) {
      scores.primary = (scores.primary || 0) + 15;
    }

    // Reply-to different from sender -> possibly promotional
    if (email.replyTo && email.replyTo.length > 0) {
      const replyToEmail = email.replyTo[0].address || email.replyTo[0];
      const senderEmail = email.getSenderEmail();
      if (replyToEmail !== senderEmail) {
        scores.promotions = (scores.promotions || 0) + 5;
      }
    }
  }

  /**
   * Select top category based on scores
   */
  _selectTopCategory(scores) {
    let topCategory = 'primary';
    let maxScore = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topCategory = category;
      }
    }

    // If no strong signal, default to primary
    if (maxScore < 10) {
      topCategory = 'primary';
    }

    // Calculate confidence (0-1)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

    return {
      category: topCategory,
      confidence: Math.min(confidence, 1)
    };
  }

  /**
   * Generate summary of categorization results
   */
  _generateCategorySummary(emails) {
    const summary = {
      total: emails.length,
      byCategory: {},
      avgConfidence: 0
    };

    let totalConfidence = 0;

    for (const email of emails) {
      const cat = email.initialCategory || 'uncategorized';
      summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;
      totalConfidence += email.categoryConfidence || 0;
    }

    summary.avgConfidence = emails.length > 0
      ? (totalConfidence / emails.length).toFixed(2)
      : 0;

    return summary;
  }

  /**
   * Add custom sender rule
   */
  addSenderRule(domain, category) {
    if (!this.rules.senderDomains[category]) {
      this.rules.senderDomains[category] = [];
    }
    this.rules.senderDomains[category].push(domain);
  }

  /**
   * Add custom subject pattern
   */
  addSubjectPattern(pattern, category) {
    if (!this.rules.subjectPatterns[category]) {
      this.rules.subjectPatterns[category] = [];
    }
    this.rules.subjectPatterns[category].push(
      pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i')
    );
  }

  /**
   * Get category info
   */
  getCategoryInfo(categoryId) {
    return Object.values(this.categories).find(c => c.id === categoryId);
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return this.categories;
  }
}

module.exports = InitialCategorizer;
