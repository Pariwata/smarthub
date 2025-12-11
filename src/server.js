/**
 * SmartHub Email Management System - Web Server
 * Express server with REST API and web interface
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', emailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           SmartHub Email Management System                         ║
║                   Web Server Started                               ║
╚═══════════════════════════════════════════════════════════════════╝

  🌐 Web Interface: http://localhost:${PORT}
  📡 API Endpoint:  http://localhost:${PORT}/api

  Available API Endpoints:
  ────────────────────────────────────────────────────────────────────
  GET  /api/status          - Get system status
  GET  /api/mailboxes       - List mailboxes
  POST /api/check           - Check/fetch emails
  POST /api/process         - Run full pipeline
  GET  /api/emails          - Get processed emails
  GET  /api/emails/:id      - Get single email
  GET  /api/statistics      - Get statistics
  GET  /api/report          - Generate report
  GET  /api/urgent          - Get urgent emails
  GET  /api/suspicious      - Get suspicious emails
  POST /api/manage/:id      - Manage an email
  GET  /api/rules           - Get rules
  POST /api/rules           - Add rule
  ────────────────────────────────────────────────────────────────────

  Press Ctrl+C to stop the server
`);
  logger.info(`Server started on port ${PORT}`);
});

module.exports = app;
