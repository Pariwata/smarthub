/**
 * Refined Categorizer
 * Uses analysis results to refine initial categorization
 * Provides more accurate categorization and subcategories
 */

const { config } = require('../config');
const logger = require('../utils/logger');

class RefinedCategorizer {
  constructor() {
    this.categories = config.categories;
    this.confidenceThreshold = config.analysis.confidenceThreshold;
    this.priorityKeywords = config.management.priorityKeywords;
  }

  /**
   * Refine categorization for a single email based on analysis
   */
  refine(email) {
    logger.emailCategorize(`Refining category for: ${email.subject.substring(0, 50)}...`);

    if (!email.analysis) {
      logger.warn('Email has no analysis data, using initial category');
      email.refinedCategory = email.initialCategory;
      return email;
    }

    const refinement = this._calculateRefinedCategory(email);

    email.refinedCategory = refinement.category;
    email.categoryConfidence = refinement.confidence;
    email.subcategories = refinement.subcategories;
    email.priority = refinement.priority;

    logger.emailCategorize(`Refined category: ${refinement.category}`, {
      initialCategory: email.initialCategory,
      confidence: refinement.confidence,
      subcategories: refinement.subcategories,
      priority: refinement.priority
    });

    return email;
  }

  /**
   * Refine multiple emails
   */
  refineAll(emails) {
    logger.emailCategorize(`Refining ${emails.length} emails...`);

    const refined = emails.map(email => this.refine(email));

    const summary = this._generateRefinementSummary(refined);
    logger.emailCategorize('Refinement complete', summary);

    return {
      emails: refined,
      summary
    };
  }

  /**
   * Calculate refined category based on analysis
   */
  _calculateRefinedCategory(email) {
    const analysis = email.analysis;
    const initial = email.initialCategory;
    const initialConfidence = email.categoryConfidence || 0.5;

    let category = initial;
    let confidence = initialConfidence;
    const subcategories = [];

    // Spam detection override
    if (analysis.spamScore >= 70) {
      category = 'spam';
      confidence = Math.min(analysis.spamScore / 100 + 0.3, 1);
      subcategories.push('high-spam-score');
    }
    // Phishing detection override
    else if (analysis.phishingRisk >= 60) {
      category = 'spam';
      confidence = Math.min(analysis.phishingRisk / 100 + 0.3, 1);
      subcategories.push('phishing-risk');
    }
    // Refine based on analysis
    else {
      const refinementResult = this._applyRefinementRules(email, initial);
      category = refinementResult.category;
      confidence = refinementResult.confidence;
      subcategories.push(...refinementResult.subcategories);
    }

    // Determine priority
    const priority = this._calculatePriority(email, category);

    return {
      category,
      confidence: parseFloat(confidence.toFixed(3)),
      subcategories,
      priority
    };
  }

  /**
   * Apply refinement rules based on analysis
   */
  _applyRefinementRules(email, initialCategory) {
    const analysis = email.analysis;
    const subcategories = [];
    let category = initialCategory;
    let confidence = email.categoryConfidence || 0.5;

    // Rule 1: High urgency emails should be promoted to primary/work
    if (analysis.urgency?.level === 'high') {
      if (['promotions', 'updates', 'newsletters'].includes(initialCategory)) {
        category = 'primary';
        confidence += 0.1;
      }
      subcategories.push('urgent');
    }

    // Rule 2: Financial keywords/entities -> financial category
    if (this._hasFinancialIndicators(email)) {
      if (initialCategory !== 'spam') {
        category = 'financial';
        confidence += 0.15;
        subcategories.push('financial-related');
      }
    }

    // Rule 3: Work-related content detection
    if (this._hasWorkIndicators(email)) {
      if (!['spam', 'promotions'].includes(initialCategory)) {
        category = 'work';
        confidence += 0.1;
        subcategories.push('work-related');
      }
    }

    // Rule 4: Personal correspondence detection
    if (this._hasPersonalIndicators(email)) {
      if (!['spam', 'promotions', 'newsletters'].includes(initialCategory)) {
        category = 'personal';
        confidence += 0.1;
        subcategories.push('personal-correspondence');
      }
    }

    // Rule 5: Action items present -> might be important
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      subcategories.push('has-action-items');
      confidence += 0.05;
    }

    // Rule 6: Has attachments -> potentially important
    if (email.hasAttachments) {
      subcategories.push('has-attachments');
      if (!['spam', 'promotions'].includes(category)) {
        confidence += 0.05;
      }
    }

    // Rule 7: Sentiment-based adjustments
    if (analysis.sentiment?.label === 'negative' && analysis.sentiment.score < -0.5) {
      subcategories.push('negative-sentiment');
      // Negative emails might need attention
      if (category === 'updates') {
        confidence -= 0.1; // Might be a complaint
      }
    }

    // Rule 8: Newsletter content patterns
    if (this._hasNewsletterPatterns(email)) {
      if (!['spam', 'work', 'personal', 'financial'].includes(category)) {
        category = 'newsletters';
        confidence += 0.1;
      }
    }

    // Rule 9: Low confidence - use topic analysis
    if (confidence < this.confidenceThreshold) {
      const topicCategory = this._categorizeByTopics(email);
      if (topicCategory) {
        category = topicCategory.category;
        confidence = Math.max(confidence, topicCategory.confidence);
      }
    }

    return {
      category,
      confidence: Math.min(confidence, 1),
      subcategories
    };
  }

  /**
   * Check for financial indicators
   */
  _hasFinancialIndicators(email) {
    const financialKeywords = [
      'payment', 'invoice', 'receipt', 'transaction', 'balance',
      'transfer', 'deposit', 'withdrawal', 'credit', 'debit',
      'statement', 'bill', 'account', 'bank', 'tax', 'refund'
    ];

    const content = `${email.subject} ${email.textBody}`.toLowerCase();
    const matchCount = financialKeywords.filter(kw => content.includes(kw)).length;

    // Also check entities for organizations that might be financial
    const orgs = email.analysis?.entities?.organizations || [];
    const financialOrgs = orgs.filter(org =>
      /bank|credit|finance|pay|capital/i.test(org)
    );

    return matchCount >= 2 || financialOrgs.length > 0;
  }

  /**
   * Check for work-related indicators
   */
  _hasWorkIndicators(email) {
    const workKeywords = [
      'meeting', 'project', 'deadline', 'task', 'team', 'sprint',
      'review', 'approval', 'schedule', 'agenda', 'report', 'client',
      'colleague', 'manager', 'department', 'budget', 'proposal'
    ];

    const content = `${email.subject} ${email.textBody}`.toLowerCase();
    const matchCount = workKeywords.filter(kw => content.includes(kw)).length;

    // Check for calendar-related patterns
    const hasCalendarPatterns = /\b(meeting|call|sync)\s+(at|on|for)\s+\d/i.test(content);

    return matchCount >= 2 || hasCalendarPatterns;
  }

  /**
   * Check for personal correspondence indicators
   */
  _hasPersonalIndicators(email) {
    const analysis = email.analysis;

    // Direct addressing patterns
    const content = email.textBody || '';
    const hasPersonalGreeting = /^(hi|hey|hello|dear)\s+\w+/im.test(content);

    // Single recipient (more likely personal)
    const singleRecipient = !email.to || email.to.length <= 1;

    // People entities mentioned
    const peopleCount = analysis?.entities?.people?.length || 0;

    // No unsubscribe link
    const hasUnsubscribe = /unsubscribe/i.test(email.htmlBody || '');

    return hasPersonalGreeting && singleRecipient && !hasUnsubscribe;
  }

  /**
   * Check for newsletter patterns
   */
  _hasNewsletterPatterns(email) {
    const content = `${email.subject} ${email.htmlBody || email.textBody}`;

    const patterns = [
      /\b(newsletter|digest|weekly|monthly|edition)\b/i,
      /\b(unsubscribe|email preferences|manage subscriptions)\b/i,
      /\b(view in browser|web version)\b/i,
      /\b(top stories|this week|highlights|roundup)\b/i
    ];

    const matchCount = patterns.filter(p => p.test(content)).length;
    return matchCount >= 2;
  }

  /**
   * Categorize based on extracted topics
   */
  _categorizeByTopics(email) {
    const topics = email.analysis?.topics || [];
    const keywords = email.analysis?.keywords?.map(k => k.term) || [];
    const allTerms = [...topics, ...keywords];

    const categoryMapping = {
      work: ['project', 'meeting', 'team', 'deadline', 'task', 'report', 'review'],
      financial: ['payment', 'invoice', 'bank', 'money', 'account', 'balance'],
      social: ['friend', 'invite', 'event', 'party', 'birthday', 'share'],
      promotions: ['sale', 'discount', 'offer', 'deal', 'free', 'limited'],
      updates: ['update', 'notification', 'confirm', 'shipping', 'delivery']
    };

    let bestCategory = null;
    let bestScore = 0;

    for (const [category, categoryTerms] of Object.entries(categoryMapping)) {
      const score = allTerms.filter(term =>
        categoryTerms.some(ct => term.toLowerCase().includes(ct))
      ).length;

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    if (bestCategory && bestScore >= 2) {
      return {
        category: bestCategory,
        confidence: Math.min(0.5 + (bestScore * 0.1), 0.8)
      };
    }

    return null;
  }

  /**
   * Calculate priority based on various factors
   */
  _calculatePriority(email, category) {
    const analysis = email.analysis;
    let priorityScore = 0;

    // Category-based priority
    const categoryPriority = this.categories[category.toUpperCase()]?.priority || 3;
    priorityScore += (5 - categoryPriority) * 2;

    // Urgency-based priority
    if (analysis?.urgency?.level === 'high') priorityScore += 4;
    else if (analysis?.urgency?.level === 'medium') priorityScore += 2;

    // Sender importance (starred/important flags)
    if (email.isStarred) priorityScore += 2;
    if (email.isImportant) priorityScore += 2;

    // Action items present
    if (analysis?.actionItems?.length > 0) priorityScore += 1;

    // Priority keywords in subject
    const subject = (email.subject || '').toLowerCase();
    if (this.priorityKeywords.some(kw => subject.includes(kw.toLowerCase()))) {
      priorityScore += 3;
    }

    // Negative sentiment with urgency (potential complaint/issue)
    if (analysis?.sentiment?.label === 'negative' && analysis?.urgency?.level !== 'low') {
      priorityScore += 1;
    }

    // Map score to priority level
    if (priorityScore >= 8) return 'urgent';
    if (priorityScore >= 5) return 'high';
    if (priorityScore >= 2) return 'normal';
    return 'low';
  }

  /**
   * Generate summary of refinement results
   */
  _generateRefinementSummary(emails) {
    const summary = {
      total: emails.length,
      categoryChanges: 0,
      byCategory: {},
      byPriority: { urgent: 0, high: 0, normal: 0, low: 0 },
      avgConfidence: 0,
      subcategoryDistribution: {}
    };

    let totalConfidence = 0;

    for (const email of emails) {
      // Track category changes
      if (email.initialCategory !== email.refinedCategory) {
        summary.categoryChanges++;
      }

      // Category distribution
      const cat = email.refinedCategory || 'uncategorized';
      summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;

      // Priority distribution
      const priority = email.priority || 'normal';
      summary.byPriority[priority]++;

      // Confidence
      totalConfidence += email.categoryConfidence || 0;

      // Subcategory distribution
      for (const subcat of (email.subcategories || [])) {
        summary.subcategoryDistribution[subcat] =
          (summary.subcategoryDistribution[subcat] || 0) + 1;
      }
    }

    summary.avgConfidence = emails.length > 0
      ? parseFloat((totalConfidence / emails.length).toFixed(3))
      : 0;

    return summary;
  }

  /**
   * Get category recommendations for an email
   */
  getRecommendations(email) {
    const recommendations = [];

    // Based on spam/phishing scores
    if (email.analysis?.spamScore >= 50) {
      recommendations.push({
        action: 'move_to_spam',
        reason: `High spam score (${email.analysis.spamScore})`,
        confidence: email.analysis.spamScore / 100
      });
    }

    if (email.analysis?.phishingRisk >= 50) {
      recommendations.push({
        action: 'flag_suspicious',
        reason: `Potential phishing risk (${email.analysis.phishingRisk})`,
        confidence: email.analysis.phishingRisk / 100
      });
    }

    // Based on urgency
    if (email.analysis?.urgency?.level === 'high') {
      recommendations.push({
        action: 'mark_important',
        reason: 'High urgency detected',
        confidence: 0.8
      });
    }

    // Based on age and status
    if (email.getAgeInDays() > 30 && email.priority === 'low') {
      recommendations.push({
        action: 'archive',
        reason: 'Old, low-priority email',
        confidence: 0.7
      });
    }

    return recommendations;
  }
}

module.exports = RefinedCategorizer;
