/**
 * @fileoverview Authentication middleware for protecting API routes.
 *
 * This module provides Express middleware for JWT-based authentication.
 * Protected routes can use this middleware to ensure only authenticated
 * users can access them, with the authenticated user's information
 * available in the request object.
 *
 * @module middleware/auth
 * @version 1.0.0
 *
 * @requires express - Web framework types
 * @requires ../types - AuthRequest type definition
 * @requires ../utils/jwt - JWT verification utilities
 *
 * @example
 * import express from 'express';
 * import { authenticate } from './middleware/auth';
 *
 * const app = express();
 *
 * // Public route - no authentication required
 * app.get('/public', (req, res) => {
 *   res.json({ message: 'Public content' });
 * });
 *
 * // Protected route - requires valid JWT
 * app.get('/protected', authenticate, (req, res) => {
 *   res.json({ message: `Hello, ${req.user.email}` });
 * });
 *
 * // Apply to router group
 * const protectedRouter = express.Router();
 * protectedRouter.use(authenticate);
 * protectedRouter.get('/profile', getProfile);
 * protectedRouter.put('/settings', updateSettings);
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';

/**
 * Express middleware that validates JWT tokens and populates user info.
 *
 * This middleware performs the following steps:
 * 1. Extracts the Authorization header from the request
 * 2. Validates the header format (must be "Bearer <token>")
 * 3. Verifies the JWT token signature and expiration
 * 4. Populates `req.user` with the decoded token payload
 * 5. Calls `next()` to proceed to the route handler
 *
 * If any step fails, an appropriate 401 Unauthorized response is sent.
 *
 * @function authenticate
 * @param {AuthRequest} req - Express request object (extended with user property)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 *
 * @example
 * // Basic route protection
 * import { Router } from 'express';
 * import { authenticate } from './middleware/auth';
 *
 * const router = Router();
 *
 * router.get('/me', authenticate, (req: AuthRequest, res) => {
 *   // req.user is guaranteed to be defined here
 *   res.json({
 *     userId: req.user.userId,
 *     email: req.user.email
 *   });
 * });
 *
 * @example
 * // With additional authorization logic
 * router.delete('/users/:id', authenticate, (req: AuthRequest, res) => {
 *   // Ensure user can only delete their own account
 *   if (req.user.userId !== req.params.id) {
 *     return res.status(403).json({ error: 'Forbidden' });
 *   }
 *   // Proceed with deletion...
 * });
 *
 * @example
 * // Client-side token usage
 * // Send requests with Authorization header:
 * // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * fetch('/api/protected', {
 *   headers: {
 *     'Authorization': `Bearer ${token}`,
 *     'Content-Type': 'application/json'
 *   }
 * });
 *
 * @remarks
 * ## Authorization Header Format
 * The middleware expects the Authorization header in this format:
 * ```
 * Authorization: Bearer <jwt-token>
 * ```
 *
 * ## Error Responses
 *
 * | Scenario | Status | Response |
 * |----------|--------|----------|
 * | No Authorization header | 401 | `{ error: 'No authorization header provided' }` |
 * | Invalid header format | 401 | `{ error: 'Invalid authorization format. Use: Bearer <token>' }` |
 * | Invalid/expired token | 401 | `{ error: 'Invalid or expired token' }` |
 *
 * ## Request Object Modification
 * On successful authentication, `req.user` is populated with:
 * - `userId`: The authenticated user's UUID
 * - `email`: The user's email address (from token, may be stale)
 *
 * @security
 * - Tokens should be transmitted over HTTPS only
 * - Store tokens securely (httpOnly cookies or secure storage)
 * - Implement token refresh for long-lived sessions
 * - Consider adding CSRF protection for cookie-based tokens
 * - Log authentication failures for security monitoring
 * - Implement rate limiting to prevent brute-force attacks
 *
 * @see {@link AuthRequest} - Type definition for the extended request
 * @see {@link verifyToken} - JWT verification function used internally
 * @see {@link JwtPayload} - Structure of req.user after authentication
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  // Step 1: Extract Authorization header
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided' });
    return;
  }

  // Step 2: Validate header format
  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  // Extract the token from the header
  const token = parts[1];

  // Step 3: Verify token and extract payload
  try {
    const payload = verifyToken(token);

    // Step 4: Attach user info to request object
    req.user = payload;

    // Step 5: Proceed to route handler
    next();
  } catch (error) {
    // Token verification failed (invalid signature, expired, etc.)
    // Note: We intentionally don't expose specific error details to prevent
    // information leakage that could aid attackers
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
