/**
 * @fileoverview SmartHub Authentication API Server - Main Entry Point.
 *
 * This is the main entry point for the SmartHub authentication service.
 * It initializes the Express server, configures middleware, and mounts
 * the authentication routes.
 *
 * @module index
 * @version 1.0.0
 *
 * @requires dotenv - Environment variable loading
 * @requires express - Web framework
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires ./routes/auth - Authentication routes
 *
 * ## Quick Start
 *
 * ```bash
 * # Install dependencies
 * npm install
 *
 * # Create .env file (optional, defaults are provided)
 * cp .env.example .env
 *
 * # Start the server
 * npm run dev
 * ```
 *
 * ## Environment Variables
 *
 * | Variable       | Description                    | Default              |
 * |----------------|--------------------------------|----------------------|
 * | PORT           | Server port                    | 3000                 |
 * | JWT_SECRET     | Secret for signing JWT tokens  | fallback-secret-key  |
 * | JWT_EXPIRES_IN | Token expiration time          | 7d                   |
 *
 * @example
 * // .env file
 * PORT=3000
 * JWT_SECRET=your-super-secret-key-change-in-production
 * JWT_EXPIRES_IN=7d
 */

import dotenv from 'dotenv';

/**
 * Load environment variables from .env file.
 *
 * This must be called before importing any modules that depend on
 * environment variables (like jwt.ts which uses JWT_SECRET).
 */
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

/**
 * Express application instance.
 *
 * @type {express.Application}
 */
const app = express();

/**
 * Server port configuration.
 *
 * Uses PORT environment variable if set, otherwise defaults to 3000.
 *
 * @constant {number}
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

/**
 * CORS Middleware Configuration.
 *
 * Enables Cross-Origin Resource Sharing for all origins.
 *
 * @remarks
 * In production, consider restricting CORS to specific origins:
 * ```typescript
 * app.use(cors({
 *   origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
 *   credentials: true
 * }));
 * ```
 *
 * @security
 * - Current configuration allows all origins (development convenience)
 * - Restrict origins in production environments
 * - Enable credentials: true if using cookies for auth
 */
app.use(cors());

/**
 * JSON Body Parser Middleware.
 *
 * Parses incoming JSON request bodies and makes them available
 * in req.body.
 *
 * @remarks
 * - Default limit is 100kb
 * - Rejects non-JSON content with 400 error
 * - Sets Content-Type: application/json in responses
 */
app.use(express.json());

/**
 * GET /health - Health Check Endpoint.
 *
 * Returns server status and current timestamp. Useful for:
 * - Load balancer health checks
 * - Monitoring services
 * - Deployment verification
 *
 * @route GET /health
 * @group System - Health and status endpoints
 *
 * @returns {Object} 200 - Health status
 * @returns {string} response.status - Always "ok" if server is running
 * @returns {string} response.timestamp - Current ISO 8601 timestamp
 *
 * @example
 * // Request
 * GET /health
 *
 * // Response
 * {
 *   "status": "ok",
 *   "timestamp": "2024-01-15T10:30:00.000Z"
 * }
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Authentication Routes Mount Point.
 *
 * Mounts all authentication-related routes under /auth prefix:
 * - POST /auth/signup - Create new account
 * - POST /auth/signin - Authenticate user
 * - GET /auth/me - Get current user profile
 *
 * @see {@link module:routes/auth} for route implementations
 */
app.use('/auth', authRoutes);

/**
 * 404 Not Found Handler.
 *
 * Catches all requests that don't match any defined routes
 * and returns a 404 error response.
 *
 * @remarks
 * - This must be the last route handler
 * - Provides consistent JSON error format
 *
 * @returns {Object} 404 - Not found error
 * @returns {string} response.error - "Not found"
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Start the HTTP Server.
 *
 * Initializes the Express server and begins listening for connections.
 * Logs available endpoints to the console on startup.
 *
 * @fires Server#listening
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /auth/signup - Create a new account');
  console.log('  POST /auth/signin - Sign in to your account');
  console.log('  GET  /auth/me     - Get your profile (requires auth)');
  console.log('  GET  /health      - Health check');
});
