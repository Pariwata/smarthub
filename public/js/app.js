/**
 * SmartHub Email Management - Frontend Application
 */

const API_BASE = '/api';

// State
let state = {
  emails: [],
  currentPage: 1,
  pageSize: 20,
  totalEmails: 0,
  currentView: 'dashboard',
  filters: {
    category: '',
    priority: '',
    search: ''
  },
  statistics: null,
  selectedEmail: null
};

// Category icons
const categoryIcons = {
  primary: '📧',
  work: '💼',
  personal: '👤',
  financial: '💰',
  social: '👥',
  promotions: '🏷️',
  updates: '🔔',
  forums: '💬',
  newsletters: '📰',
  spam: '🚫'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  refreshStatus();
  loadStatistics();
});

// API Helper
async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// View Management
function switchView(viewName) {
  state.currentView = viewName;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === `${viewName}View`);
  });

  // Load view-specific data
  switch (viewName) {
    case 'dashboard':
      loadStatistics();
      break;
    case 'inbox':
      loadEmails();
      break;
    case 'categories':
      loadCategoriesView();
      break;
    case 'analysis':
      loadAnalysisView();
      break;
    case 'urgent':
      loadUrgentEmails();
      break;
    case 'suspicious':
      loadSuspiciousEmails();
      break;
  }
}

// Status
async function refreshStatus() {
  try {
    const data = await api('/status');
    const statusEl = document.getElementById('connectionStatus');

    if (data.connected) {
      statusEl.textContent = `Connected (${data.mailbox?.total || 0} emails)`;
      statusEl.className = 'status-badge connected';
    } else {
      statusEl.textContent = 'Disconnected';
      statusEl.className = 'status-badge disconnected';
    }

    // Update counts
    if (data.processedCount > 0) {
      await loadStatistics();
    }
  } catch (error) {
    console.error('Status error:', error);
    document.getElementById('connectionStatus').textContent = 'Error';
    document.getElementById('connectionStatus').className = 'status-badge disconnected';
  }
}

// Statistics
async function loadStatistics() {
  try {
    const data = await api('/statistics');
    state.statistics = data.statistics;
    updateDashboard(data.statistics);
  } catch (error) {
    console.error('Statistics error:', error);
  }
}

function updateDashboard(stats) {
  if (!stats || stats.message) {
    document.getElementById('totalEmails').textContent = '0';
    document.getElementById('urgentEmails').textContent = '0';
    document.getElementById('suspiciousEmails').textContent = '0';
    document.getElementById('actionItems').textContent = '0';
    return;
  }

  document.getElementById('totalEmails').textContent = stats.totalEmails || 0;
  document.getElementById('urgentEmails').textContent = stats.urgentCount || 0;
  document.getElementById('suspiciousEmails').textContent =
    (stats.spamRisk?.high || 0) + (stats.spamRisk?.medium || 0);
  document.getElementById('actionItems').textContent = stats.withActionItems || 0;

  // Update badges
  updateBadge('urgentCount', stats.urgentCount);
  updateBadge('suspiciousCount', (stats.spamRisk?.high || 0));

  // Update charts
  updateChart('categoryChart', stats.byCategory, 'category');
  updateChart('priorityChart', stats.byPriority, 'priority');
  updateChart('sentimentChart', stats.sentimentDistribution, 'sentiment');
}

function updateBadge(id, count) {
  const badge = document.getElementById(id);
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', !count || count === 0);
  }
}

function updateChart(containerId, data, type) {
  const container = document.getElementById(containerId);
  if (!container || !data) return;

  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) {
    container.innerHTML = '<p class="empty-message">No data</p>';
    return;
  }

  const maxValue = Math.max(...Object.values(data));

  container.innerHTML = Object.entries(data)
    .map(([label, value]) => {
      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
      const colorClass = type === 'priority' || type === 'sentiment' ? label : '';

      return `
        <div class="chart-bar">
          <span class="chart-label">${label}</span>
          <div class="chart-bar-wrapper">
            <div class="chart-bar-fill ${colorClass}" style="width: ${percentage}%">
              ${value}
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// Categories
async function loadCategories() {
  try {
    const data = await api('/categories');
    const container = document.getElementById('categoryList');
    const filterSelect = document.getElementById('filterCategory');

    container.innerHTML = data.categories
      .map(cat => `
        <div class="category-item" onclick="filterByCategory('${cat.id}')">
          <span>${categoryIcons[cat.id] || '📁'} ${cat.name}</span>
          <span class="category-count" id="cat-count-${cat.id}">0</span>
        </div>
      `)
      .join('');

    // Update filter select
    filterSelect.innerHTML = '<option value="">All Categories</option>' +
      data.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
  } catch (error) {
    console.error('Categories error:', error);
  }
}

function filterByCategory(category) {
  state.filters.category = category;
  document.getElementById('filterCategory').value = category;
  switchView('inbox');
  loadEmails();
}

async function loadCategoriesView() {
  const container = document.getElementById('categoriesGrid');

  try {
    const [categoriesData, statsData] = await Promise.all([
      api('/categories'),
      api('/statistics')
    ]);

    const stats = statsData.statistics?.byCategory || {};

    container.innerHTML = categoriesData.categories
      .map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.id}')">
          <div class="category-card-header">
            <span class="category-card-icon">${categoryIcons[cat.id] || '📁'}</span>
            <span class="category-card-name">${cat.name}</span>
          </div>
          <div class="category-card-count">${stats[cat.id] || 0}</div>
          <div class="category-card-desc">${cat.description}</div>
        </div>
      `)
      .join('');
  } catch (error) {
    container.innerHTML = '<p class="empty-message">Error loading categories</p>';
  }
}

// Emails
async function loadEmails() {
  const container = document.getElementById('emailList');
  showLoading('Loading emails...');

  try {
    const params = new URLSearchParams({
      limit: state.pageSize,
      offset: (state.currentPage - 1) * state.pageSize
    });

    if (state.filters.category) params.append('category', state.filters.category);
    if (state.filters.priority) params.append('priority', state.filters.priority);
    if (state.filters.search) params.append('search', state.filters.search);

    const data = await api(`/emails?${params}`);

    state.emails = data.emails;
    state.totalEmails = data.total;

    renderEmailList(container, data.emails);
    updatePagination(data.total);
    updateCategoryCounts();
  } catch (error) {
    container.innerHTML = '<p class="empty-message">Error loading emails</p>';
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

function renderEmailList(container, emails) {
  if (!emails || emails.length === 0) {
    container.innerHTML = '<p class="empty-message">No emails found. Click "Fetch Emails" or "Process New" to get started.</p>';
    return;
  }

  container.innerHTML = emails.map(email => `
    <div class="email-item ${email.isRead ? '' : 'unread'} ${email.priority === 'urgent' ? 'urgent' : ''}"
         onclick="showEmailDetail('${email.id}')">
      <div class="email-header">
        <span class="email-from">${email.fromName || email.from || 'Unknown'}</span>
        <span class="email-date">${formatDate(email.date)}</span>
      </div>
      <div class="email-subject">${escapeHtml(email.subject || '(No Subject)')}</div>
      <div class="email-preview">${escapeHtml(email.preview || '')}</div>
      <div class="email-meta">
        <span class="email-tag category">${email.category || 'uncategorized'}</span>
        <span class="email-tag priority-${email.priority}">${email.priority || 'normal'}</span>
        ${email.analysis?.spamScore >= 50 ? '<span class="email-tag spam">Spam Risk</span>' : ''}
        ${email.hasAttachments ? `<span class="email-tag attachment">📎 ${email.attachmentCount}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function updatePagination(total) {
  const pagination = document.getElementById('pagination');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const totalPages = Math.ceil(total / state.pageSize);

  if (totalPages <= 1) {
    pagination.classList.add('hidden');
    return;
  }

  pagination.classList.remove('hidden');
  pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
  prevBtn.disabled = state.currentPage <= 1;
  nextBtn.disabled = state.currentPage >= totalPages;
}

function prevPage() {
  if (state.currentPage > 1) {
    state.currentPage--;
    loadEmails();
  }
}

function nextPage() {
  const totalPages = Math.ceil(state.totalEmails / state.pageSize);
  if (state.currentPage < totalPages) {
    state.currentPage++;
    loadEmails();
  }
}

async function updateCategoryCounts() {
  try {
    const data = await api('/statistics');
    const counts = data.statistics?.byCategory || {};

    Object.entries(counts).forEach(([cat, count]) => {
      const el = document.getElementById(`cat-count-${cat}`);
      if (el) el.textContent = count;
    });
  } catch (error) {
    console.error('Count update error:', error);
  }
}

// Urgent Emails
async function loadUrgentEmails() {
  const container = document.getElementById('urgentList');
  showLoading('Loading urgent emails...');

  try {
    const data = await api('/urgent');
    renderEmailList(container, data.emails);
  } catch (error) {
    container.innerHTML = '<p class="empty-message">Error loading urgent emails</p>';
  } finally {
    hideLoading();
  }
}

// Suspicious Emails
async function loadSuspiciousEmails() {
  const container = document.getElementById('suspiciousList');
  showLoading('Loading suspicious emails...');

  try {
    const data = await api('/suspicious');
    renderEmailList(container, data.emails);
  } catch (error) {
    container.innerHTML = '<p class="empty-message">Error loading suspicious emails</p>';
  } finally {
    hideLoading();
  }
}

// Analysis View
async function loadAnalysisView() {
  const container = document.getElementById('analysisContent');

  try {
    const [statsData, reportData] = await Promise.all([
      api('/statistics'),
      api('/report')
    ]);

    if (statsData.statistics?.message) {
      container.innerHTML = '<p class="empty-message">Process emails to see analysis results.</p>';
      return;
    }

    const stats = statsData.statistics;
    const report = reportData.report;

    container.innerHTML = `
      <div class="analysis-section">
        <h3>Overview</h3>
        <div class="analysis-grid">
          <div class="analysis-item">
            <div class="analysis-item-label">Total Emails</div>
            <div class="analysis-item-value">${stats.totalEmails}</div>
          </div>
          <div class="analysis-item">
            <div class="analysis-item-label">Avg Spam Score</div>
            <div class="analysis-item-value">${stats.avgSpamScore}%</div>
          </div>
          <div class="analysis-item">
            <div class="analysis-item-label">Avg Phishing Risk</div>
            <div class="analysis-item-value">${stats.avgPhishingRisk}%</div>
          </div>
          <div class="analysis-item">
            <div class="analysis-item-label">With Attachments</div>
            <div class="analysis-item-value">${stats.withAttachments}</div>
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <h3>Sentiment Distribution</h3>
        <div id="analysisChart" class="chart-container"></div>
      </div>

      ${report.recommendations?.length ? `
        <div class="analysis-section">
          <h3>Recommendations</h3>
          <ul>
            ${report.recommendations.map(r => `<li>${r.message}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${report.warnings?.length ? `
        <div class="analysis-section">
          <h3>Warnings</h3>
          <ul>
            ${report.warnings.map(w => `<li>⚠️ ${w.warning}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    updateChart('analysisChart', stats.sentimentDistribution, 'sentiment');
  } catch (error) {
    container.innerHTML = '<p class="empty-message">Error loading analysis</p>';
  }
}

// Email Detail
async function showEmailDetail(emailId) {
  showLoading('Loading email...');

  try {
    const data = await api(`/emails/${emailId}`);
    state.selectedEmail = data.email;

    const modal = document.getElementById('emailModal');
    const body = document.getElementById('emailModalBody');

    const email = data.email;
    const analysis = email.fullAnalysis || email.analysis;

    body.innerHTML = `
      <div class="email-detail-header">
        <div class="email-detail-subject">${escapeHtml(email.subject || '(No Subject)')}</div>
        <div class="email-detail-meta">
          <strong>From:</strong> ${email.fromName || email.from}<br>
          <strong>To:</strong> ${email.to?.join(', ') || 'N/A'}<br>
          <strong>Date:</strong> ${formatDate(email.date, true)}<br>
          <strong>Category:</strong> ${email.category} (${(email.categoryConfidence * 100).toFixed(0)}% confidence)<br>
          <strong>Priority:</strong> ${email.priority}
        </div>
      </div>

      <div class="email-detail-body">
        ${escapeHtml(email.textBody || 'No content')}
      </div>

      ${analysis ? `
        <div class="email-detail-analysis">
          <h4>Analysis Results</h4>
          <div class="analysis-grid">
            <div class="analysis-item">
              <div class="analysis-item-label">Sentiment</div>
              <div class="analysis-item-value">${analysis.sentiment?.label || 'N/A'}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-item-label">Urgency</div>
              <div class="analysis-item-value">${analysis.urgency?.level || 'N/A'}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-item-label">Spam Score</div>
              <div class="analysis-item-value">${analysis.spamScore || 0}%</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-item-label">Phishing Risk</div>
              <div class="analysis-item-value">${analysis.phishingRisk || 0}%</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-item-label">Reading Time</div>
              <div class="analysis-item-value">${analysis.readingTime || 0} min</div>
            </div>
          </div>
          ${analysis.keywords?.length ? `
            <div style="margin-top: 1rem;">
              <strong>Keywords:</strong> ${analysis.keywords.map(k => k.term || k).join(', ')}
            </div>
          ` : ''}
          ${analysis.actionItems?.length ? `
            <div style="margin-top: 1rem;">
              <strong>Action Items:</strong>
              <ul>${analysis.actionItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;

    modal.classList.remove('hidden');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

function closeEmailModal() {
  document.getElementById('emailModal').classList.add('hidden');
  state.selectedEmail = null;
}

async function emailAction(action) {
  if (!state.selectedEmail) return;

  showLoading(`Performing ${action}...`);

  try {
    await api(`/manage/${state.selectedEmail.id}`, {
      method: 'POST',
      body: { action }
    });

    showToast(`Email ${action}d successfully`, 'success');
    closeEmailModal();

    // Refresh current view
    if (state.currentView === 'inbox') {
      loadEmails();
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Fetch Modal
function showFetchModal() {
  document.getElementById('fetchModal').classList.remove('hidden');
  document.getElementById('fetchType').value = 'new';
  toggleFetchOptions();
}

function closeFetchModal() {
  document.getElementById('fetchModal').classList.add('hidden');
}

function toggleFetchOptions() {
  const type = document.getElementById('fetchType').value;
  document.getElementById('recentOptions').classList.toggle('hidden', type !== 'recent');
  document.getElementById('periodOptions').classList.toggle('hidden', type !== 'period');
}

async function executeFetch() {
  const type = document.getElementById('fetchType').value;
  const days = parseInt(document.getElementById('fetchDays').value);
  const startDate = document.getElementById('fetchStartDate').value;
  const endDate = document.getElementById('fetchEndDate').value;
  const limit = parseInt(document.getElementById('fetchLimit').value);
  const processAfter = document.getElementById('processAfterFetch').checked;

  closeFetchModal();
  showLoading('Fetching emails...');

  try {
    const endpoint = processAfter ? '/process' : '/check';
    const body = { type, days, limit };

    if (type === 'period') {
      body.startDate = startDate;
      body.endDate = endDate;
    }

    const data = await api(endpoint, { method: 'POST', body });

    showToast(`${processAfter ? 'Processed' : 'Fetched'} ${data.count} emails`, 'success');

    // Refresh
    await loadStatistics();
    if (state.currentView === 'inbox') {
      await loadEmails();
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Process Modal
function showProcessModal() {
  document.getElementById('processModal').classList.remove('hidden');
}

function closeProcessModal() {
  document.getElementById('processModal').classList.add('hidden');
}

async function executeProcess() {
  const type = document.getElementById('processType').value;
  const days = parseInt(document.getElementById('processDays').value);
  const startDate = document.getElementById('processStartDate').value;
  const endDate = document.getElementById('processEndDate').value;

  const skipStages = Array.from(document.querySelectorAll('#processModal .checkbox-group input:checked'))
    .map(cb => cb.value);

  closeProcessModal();
  await processEmails(type, { days, startDate, endDate, skipStages });
}

async function processEmails(type, options = {}) {
  showLoading('Processing emails...');

  try {
    const body = { type, ...options };

    const data = await api('/process', { method: 'POST', body });

    showToast(`Processed ${data.count} emails`, 'success');

    // Refresh dashboard
    await loadStatistics();

    // Switch to inbox to see results
    switchView('inbox');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Filters
function applyFilters() {
  state.filters.category = document.getElementById('filterCategory').value;
  state.filters.priority = document.getElementById('filterPriority').value;
  state.currentPage = 1;
  loadEmails();
}

function handleSearch(event) {
  if (event.key === 'Enter') {
    state.filters.search = document.getElementById('searchInput').value;
    state.currentPage = 1;
    loadEmails();
  }
}

// Utilities
function showLoading(message = 'Loading...') {
  document.getElementById('loadingMessage').textContent = message;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function formatDate(dateStr, full = false) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);

  if (full) {
    return date.toLocaleString();
  }

  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
