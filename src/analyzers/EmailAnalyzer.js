/**
 * Email Analyzer
 * Deep analysis of email content - sentiment, urgency, keywords, entities, etc.
 */

const natural = require('natural');
const nlp = require('compromise');
const { config } = require('../config');
const logger = require('../utils/logger');

class EmailAnalyzer {
  constructor() {
    // Initialize NLP tools
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.stemmer = natural.PorterStemmer;

    // Initialize patterns
    this.urgencyPatterns = this._initUrgencyPatterns();
    this.spamPatterns = this._initSpamPatterns();
    this.phishingPatterns = this._initPhishingPatterns();
  }

  /**
   * Initialize urgency detection patterns
   */
  _initUrgencyPatterns() {
    return {
      high: [
        /\b(urgent|asap|immediately|emergency|critical|time.sensitive)\b/i,
        /\b(deadline today|due today|expires today|last chance)\b/i,
        /\b(action required|immediate action|respond immediately)\b/i,
        /!\s*urgent|urgent\s*!/i
      ],
      medium: [
        /\b(important|priority|soon|quickly|prompt|timely)\b/i,
        /\b(deadline|due date|by end of|before|reminder)\b/i,
        /\b(follow.up|waiting for|pending|outstanding)\b/i
      ],
      low: [
        /\b(when you have time|no rush|at your convenience|whenever)\b/i,
        /\b(fyi|for your information|just wanted to|thought you might)\b/i
      ]
    };
  }

  /**
   * Initialize spam detection patterns
   */
  _initSpamPatterns() {
    return [
      /\b(winner|won|lottery|prize|congratulations!+)\b/i,
      /\b(click here|act now|limited time|don't miss)\b/i,
      /\b(100% free|risk free|no obligation|guaranteed)\b/i,
      /\b(make money|earn \$|cash bonus|extra income)\b/i,
      /\b(weight loss|lose weight|diet|pills?)\b/i,
      /\b(viagra|cialis|pharmacy|medication|prescription)\b/i,
      /\b(nigerian|prince|inheritance|beneficiary|million dollars)\b/i,
      /\b(wire transfer|western union|moneygram|bitcoin)\b/i,
      /[A-Z]{10,}/g, // Excessive caps
      /!{3,}/g, // Multiple exclamation marks
      /\${2,}/g, // Multiple dollar signs
    ];
  }

  /**
   * Initialize phishing detection patterns
   */
  _initPhishingPatterns() {
    return [
      /\b(verify your account|confirm your identity|update your information)\b/i,
      /\b(suspended|locked|disabled|unauthorized)\s*(account|access)/i,
      /\b(security alert|unusual activity|suspicious login)\b/i,
      /\b(click.*(link|here|below).*verify)\b/i,
      /\b(password.*expired?|reset your password|change.*password)\b/i,
      /\b(bank|paypal|amazon|apple|microsoft|google).*\b(verify|confirm|update)/i,
      /dear\s*(customer|user|member|valued)/i,
      /\b(within 24 hours|within 48 hours|account will be)\b/i
    ];
  }

  /**
   * Analyze a single email
   */
  analyze(email) {
    logger.emailAnalyze(`Analyzing email: ${email.subject.substring(0, 50)}...`);

    const content = this._prepareContent(email);
    const analysis = {
      sentiment: this._analyzeSentiment(content),
      urgency: this._analyzeUrgency(content, email.subject),
      keywords: this._extractKeywords(content),
      topics: this._extractTopics(content),
      entities: this._extractEntities(content),
      language: this._detectLanguage(content),
      readingTime: email.getReadingTime(),
      spamScore: this._calculateSpamScore(content, email),
      phishingRisk: this._calculatePhishingRisk(content, email),
      complexity: this._analyzeComplexity(content),
      actionItems: this._extractActionItems(content),
      dates: this._extractDates(content),
      urls: this._extractUrls(email),
      statistics: this._calculateStatistics(content, email)
    };

    email.setAnalysis(analysis);

    logger.emailAnalyze('Analysis complete', {
      sentiment: analysis.sentiment.label,
      urgency: analysis.urgency.level,
      spamScore: analysis.spamScore,
      keywordsCount: analysis.keywords.length
    });

    return email;
  }

  /**
   * Analyze multiple emails
   */
  analyzeAll(emails) {
    logger.emailAnalyze(`Analyzing ${emails.length} emails...`);

    const analyzed = emails.map(email => this.analyze(email));

    const summary = this._generateAnalysisSummary(analyzed);
    logger.emailAnalyze('Batch analysis complete', summary);

    return {
      emails: analyzed,
      summary
    };
  }

  /**
   * Prepare content for analysis
   */
  _prepareContent(email) {
    // Combine subject and body, prefer text over HTML
    let content = email.textBody || '';
    if (!content && email.htmlBody) {
      content = email.htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    }
    return `${email.subject || ''} ${content}`.trim();
  }

  /**
   * Analyze sentiment
   */
  _analyzeSentiment(content) {
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    const score = this.sentimentAnalyzer.getSentiment(tokens);

    let label = 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';

    return {
      score: parseFloat(score.toFixed(3)),
      label,
      confidence: Math.min(Math.abs(score) + 0.5, 1)
    };
  }

  /**
   * Analyze urgency level
   */
  _analyzeUrgency(content, subject) {
    const combined = `${subject} ${content}`;
    let urgencyScore = 0;
    const indicators = [];

    // Check high urgency patterns
    for (const pattern of this.urgencyPatterns.high) {
      if (pattern.test(combined)) {
        urgencyScore += 3;
        const match = combined.match(pattern);
        if (match) indicators.push(match[0]);
      }
    }

    // Check medium urgency patterns
    for (const pattern of this.urgencyPatterns.medium) {
      if (pattern.test(combined)) {
        urgencyScore += 2;
        const match = combined.match(pattern);
        if (match) indicators.push(match[0]);
      }
    }

    // Check low urgency patterns (reduce score)
    for (const pattern of this.urgencyPatterns.low) {
      if (pattern.test(combined)) {
        urgencyScore -= 1;
      }
    }

    let level = 'normal';
    if (urgencyScore >= 5) level = 'high';
    else if (urgencyScore >= 3) level = 'medium';
    else if (urgencyScore <= 0) level = 'low';

    return {
      level,
      score: urgencyScore,
      indicators: [...new Set(indicators)].slice(0, 5)
    };
  }

  /**
   * Extract keywords using TF-IDF
   */
  _extractKeywords(content) {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(content.toLowerCase());

    const keywords = [];
    tfidf.listTerms(0).forEach(item => {
      if (item.term.length > 2 && !this._isStopWord(item.term)) {
        keywords.push({
          term: item.term,
          score: parseFloat(item.tfidf.toFixed(3))
        });
      }
    });

    return keywords.slice(0, 15);
  }

  /**
   * Extract topics using NLP
   */
  _extractTopics(content) {
    const doc = nlp(content);
    const topics = [];

    // Extract nouns as potential topics
    const nouns = doc.nouns().out('array');
    const uniqueNouns = [...new Set(nouns.map(n => n.toLowerCase()))];

    uniqueNouns.forEach(noun => {
      if (noun.length > 2 && !this._isStopWord(noun)) {
        topics.push(noun);
      }
    });

    return topics.slice(0, 10);
  }

  /**
   * Extract named entities
   */
  _extractEntities(content) {
    const doc = nlp(content);
    const entities = {
      people: [],
      organizations: [],
      places: [],
      emails: [],
      phones: []
    };

    // Extract people names
    entities.people = doc.people().out('array').slice(0, 5);

    // Extract organizations
    entities.organizations = doc.organizations().out('array').slice(0, 5);

    // Extract places
    entities.places = doc.places().out('array').slice(0, 5);

    // Extract email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    entities.emails = [...new Set(content.match(emailRegex) || [])].slice(0, 5);

    // Extract phone numbers
    const phoneRegex = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    entities.phones = [...new Set(content.match(phoneRegex) || [])].slice(0, 5);

    return entities;
  }

  /**
   * Detect language (basic detection)
   */
  _detectLanguage(content) {
    // Simple heuristic - check for common English words
    const englishWords = ['the', 'is', 'are', 'and', 'or', 'to', 'from', 'for'];
    const words = content.toLowerCase().split(/\s+/);
    const englishCount = words.filter(w => englishWords.includes(w)).length;

    return {
      detected: englishCount > 2 ? 'en' : 'unknown',
      confidence: Math.min(englishCount / 10, 1)
    };
  }

  /**
   * Calculate spam score (0-100)
   */
  _calculateSpamScore(content, email) {
    let score = 0;

    // Check spam patterns
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        score += 15;
      }
    }

    // Check sender characteristics
    const domain = email.getSenderDomain();
    if (domain) {
      // Suspicious domain patterns
      if (/\d{5,}/.test(domain)) score += 10;
      if (domain.length > 30) score += 5;
    }

    // Check for no-reply with promotional content
    if (email.getSenderEmail()?.includes('noreply') && score > 0) {
      score += 5;
    }

    // Many recipients
    if (email.to && email.to.length > 10) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate phishing risk (0-100)
   */
  _calculatePhishingRisk(content, email) {
    let risk = 0;

    // Check phishing patterns
    for (const pattern of this.phishingPatterns) {
      if (pattern.test(content)) {
        risk += 15;
      }
    }

    // Check for mismatched sender
    const senderDomain = email.getSenderDomain();
    const contentLower = content.toLowerCase();

    // Mentions big company but sent from different domain
    const bigCompanies = ['paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook', 'netflix', 'bank'];
    for (const company of bigCompanies) {
      if (contentLower.includes(company) && senderDomain && !senderDomain.includes(company)) {
        risk += 20;
      }
    }

    // Check for suspicious URLs
    const urls = this._extractUrls(email);
    for (const url of urls.links) {
      if (url.includes('@') || /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        risk += 15;
      }
    }

    return Math.min(risk, 100);
  }

  /**
   * Analyze text complexity
   */
  _analyzeComplexity(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const words = content.split(/\s+/).filter(w => w.length > 0);

    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgWordLength = words.length > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / words.length
      : 0;

    let level = 'simple';
    if (avgWordsPerSentence > 20 && avgWordLength > 6) level = 'complex';
    else if (avgWordsPerSentence > 15 || avgWordLength > 5) level = 'moderate';

    return {
      level,
      avgWordsPerSentence: parseFloat(avgWordsPerSentence.toFixed(1)),
      avgWordLength: parseFloat(avgWordLength.toFixed(1))
    };
  }

  /**
   * Extract action items from content
   */
  _extractActionItems(content) {
    const actionItems = [];
    const patterns = [
      /please\s+([^.!?\n]{10,60})/gi,
      /need(s?)\s+to\s+([^.!?\n]{10,60})/gi,
      /must\s+([^.!?\n]{10,60})/gi,
      /should\s+([^.!?\n]{10,60})/gi,
      /action\s*:\s*([^.!?\n]{10,60})/gi,
      /todo\s*:\s*([^.!?\n]{10,60})/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const item = (match[1] || match[2]).trim();
        if (item && !actionItems.includes(item)) {
          actionItems.push(item);
        }
      }
    }

    return actionItems.slice(0, 5);
  }

  /**
   * Extract dates mentioned in content
   */
  _extractDates(content) {
    const doc = nlp(content);
    const dates = doc.dates().out('array');
    return [...new Set(dates)].slice(0, 5);
  }

  /**
   * Extract URLs from email
   */
  _extractUrls(email) {
    const content = email.htmlBody || email.textBody || '';
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    const links = [...new Set(content.match(urlRegex) || [])];

    // Check for tracking pixels
    const trackingPixels = links.filter(url =>
      /track|pixel|open|beacon|click/i.test(url) ||
      /\.gif\?|\.png\?|1x1/i.test(url)
    );

    return {
      links: links.slice(0, 20),
      count: links.length,
      hasTrackingPixels: trackingPixels.length > 0,
      trackingPixelCount: trackingPixels.length
    };
  }

  /**
   * Calculate email statistics
   */
  _calculateStatistics(content, email) {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      characterCount: content.length,
      hasAttachments: email.hasAttachments,
      attachmentCount: email.attachments?.length || 0,
      recipientCount: (email.to?.length || 0) + (email.cc?.length || 0)
    };
  }

  /**
   * Check if word is a stop word
   */
  _isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'this', 'that',
      'these', 'those', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
      'their', 'he', 'she', 'him', 'her', 'his', 'hers', 'i', 'me', 'my',
      'not', 'no', 'yes', 'if', 'then', 'else', 'when', 'where', 'which',
      'who', 'what', 'how', 'why', 'all', 'each', 'every', 'both', 'few',
      'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there'
    ]);
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Generate analysis summary for batch
   */
  _generateAnalysisSummary(emails) {
    const summary = {
      total: emails.length,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      urgency: { high: 0, medium: 0, normal: 0, low: 0 },
      spamRisk: { high: 0, medium: 0, low: 0 },
      phishingRisk: { high: 0, medium: 0, low: 0 },
      avgReadingTime: 0
    };

    let totalReadingTime = 0;

    for (const email of emails) {
      const analysis = email.analysis;

      // Sentiment
      summary.sentiment[analysis.sentiment?.label || 'neutral']++;

      // Urgency
      summary.urgency[analysis.urgency?.level || 'normal']++;

      // Spam risk
      if (analysis.spamScore >= 50) summary.spamRisk.high++;
      else if (analysis.spamScore >= 25) summary.spamRisk.medium++;
      else summary.spamRisk.low++;

      // Phishing risk
      if (analysis.phishingRisk >= 50) summary.phishingRisk.high++;
      else if (analysis.phishingRisk >= 25) summary.phishingRisk.medium++;
      else summary.phishingRisk.low++;

      // Reading time
      totalReadingTime += analysis.readingTime || 0;
    }

    summary.avgReadingTime = emails.length > 0
      ? parseFloat((totalReadingTime / emails.length).toFixed(1))
      : 0;

    return summary;
  }
}

module.exports = EmailAnalyzer;
