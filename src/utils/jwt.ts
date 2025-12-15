/**
 * @fileoverview JWT (JSON Web Token) utilities for user authentication.
 *
 * This module provides functions for generating and verifying JWT tokens
 * used in the SmartHub authentication system. Tokens are used to maintain
 * user sessions and authorize access to protected API endpoints.
 *
 * @module utils/jwt
 * @version 1.0.0
 *
 * @requires jsonwebtoken - JWT implementation library
 * @requires ../types - Type definitions for JWT payloads
 *
 * @example
 * // Generate a token for a user
 * import { generateToken, verifyToken } from './utils/jwt';
 *
 * const token = generateToken({ userId: 'abc123', email: 'user@example.com' });
 * console.log(token); // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *
 * // Verify and decode the token
 * const payload = verifyToken(token);
 * console.log(payload.userId); // 'abc123'
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload, isJwtPayload } from '../types';

/**
 * Secret key used to sign and verify JWT tokens.
 *
 * @constant {string}
 * @default 'fallback-secret-key'
 *
 * @description
 * This value should ALWAYS be set via the JWT_SECRET environment variable
 * in production environments. The fallback value is only provided for
 * development convenience and is NOT secure for production use.
 *
 * @security
 * - NEVER use the fallback secret in production
 * - Use a cryptographically random string of at least 256 bits (32 bytes)
 * - Keep the secret confidential and rotate it periodically
 * - Consider using asymmetric keys (RS256) for distributed systems
 *
 * @example
 * // Set in environment
 * JWT_SECRET=your-super-secret-random-string-at-least-32-chars
 */
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

/**
 * Token expiration time configuration.
 *
 * @constant {string}
 * @default '7d'
 *
 * @description
 * Specifies how long tokens remain valid. Uses zeit/ms format:
 * - '7d' = 7 days
 * - '24h' = 24 hours
 * - '60m' = 60 minutes
 * - '3600s' = 3600 seconds
 * - 3600 = 3600 seconds (numeric)
 *
 * @example
 * // Set in environment for 24-hour tokens
 * JWT_EXPIRES_IN=24h
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

/**
 * Generates a signed JWT token for user authentication.
 *
 * Creates a new JWT containing the user's identification information
 * (userId and email) signed with the configured secret key. The token
 * can be used for subsequent authenticated API requests.
 *
 * @function generateToken
 * @param {JwtPayload} payload - The data to encode in the token
 * @param {string} payload.userId - User's unique identifier (UUID)
 * @param {string} payload.email - User's email address
 * @returns {string} A signed JWT token string
 *
 * @example
 * // Basic usage
 * const token = generateToken({
 *   userId: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com'
 * });
 * // Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny...'
 *
 * @example
 * // Used in login flow
 * async function login(email: string, password: string) {
 *   const user = await validateCredentials(email, password);
 *   if (!user) throw new Error('Invalid credentials');
 *
 *   const token = generateToken({
 *     userId: user.id,
 *     email: user.email
 *   });
 *
 *   return { user: toPublicUser(user), token };
 * }
 *
 * @remarks
 * - Token is signed using HS256 (HMAC-SHA256) algorithm by default
 * - Token includes standard JWT claims (iat - issued at, exp - expiration)
 * - Default expiration is 7 days (configurable via JWT_EXPIRES_IN env var)
 * - Payload data is base64-encoded but NOT encrypted - avoid sensitive data
 *
 * @security
 * - Never include sensitive data (passwords, API keys) in the payload
 * - Store tokens securely on the client (httpOnly cookies preferred)
 * - Implement token refresh for long-lived sessions
 * - Consider token blacklisting for logout functionality
 *
 * @see {@link verifyToken} - To verify and decode tokens
 * @see {@link JwtPayload} - Type definition for payload structure
 */
export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifies a JWT token and extracts its payload.
 *
 * Validates the token's signature and expiration, then returns the
 * decoded payload containing the user's identification information.
 *
 * @function verifyToken
 * @param {string} token - The JWT token string to verify
 * @returns {JwtPayload} The decoded payload containing userId and email
 * @throws {JsonWebTokenError} If the token signature is invalid
 * @throws {TokenExpiredError} If the token has expired
 * @throws {NotBeforeError} If the token is not yet valid (nbf claim)
 *
 * @example
 * // Basic usage
 * try {
 *   const payload = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 *   console.log(payload.userId); // '123e4567-e89b-12d3-a456-426614174000'
 *   console.log(payload.email);  // 'user@example.com'
 * } catch (error) {
 *   console.error('Token verification failed:', error.message);
 * }
 *
 * @example
 * // Used in authentication middleware
 * function authenticate(req, res, next) {
 *   const token = extractTokenFromHeader(req);
 *
 *   try {
 *     const payload = verifyToken(token);
 *     req.user = payload;
 *     next();
 *   } catch (error) {
 *     if (error.name === 'TokenExpiredError') {
 *       return res.status(401).json({ error: 'Token expired' });
 *     }
 *     return res.status(401).json({ error: 'Invalid token' });
 *   }
 * }
 *
 * @remarks
 * - Verification checks both signature validity and token expiration
 * - The returned payload may also include standard JWT claims (iat, exp)
 * - This function is synchronous and may block on CPU-intensive verification
 * - For high-traffic applications, consider caching verification results
 *
 * @security
 * - Always wrap in try-catch to handle verification failures
 * - Do not expose detailed error messages to clients
 * - The payload email may be stale if user updated their email after token issuance
 * - Always fetch fresh user data from database for sensitive operations
 *
 * @see {@link generateToken} - To create new tokens
 * @see {@link JwtPayload} - Type definition for the return value
 */
export function verifyToken(token: string): JwtPayload {
  const decoded: unknown = jwt.verify(token, JWT_SECRET);

  if (!isJwtPayload(decoded)) {
    throw new Error('Invalid token payload structure');
  }

  return decoded;
}
