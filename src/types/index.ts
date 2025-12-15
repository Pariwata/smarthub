/**
 * @fileoverview Type definitions for the SmartHub Authentication System.
 *
 * This module defines the core TypeScript interfaces used throughout the
 * authentication system, including user entities, JWT payloads, and
 * Express request extensions.
 *
 * @module types
 * @version 1.0.0
 */

import { Request } from 'express';

/**
 * Complete user entity as stored in the database.
 *
 * This interface represents the full user record including sensitive data
 * like the password hash. This type should NEVER be exposed directly to
 * API responses - use {@link UserPublic} instead.
 *
 * @interface User
 *
 * @property {string} id - Unique identifier (UUID v4 format)
 * @property {string} email - User's email address (stored lowercase, unique)
 * @property {string} username - User's display name (stored lowercase, unique)
 * @property {string} password_hash - Bcrypt hash of user's password (cost factor 10)
 * @property {string} created_at - ISO 8601 timestamp of account creation
 * @property {string} updated_at - ISO 8601 timestamp of last account modification
 *
 * @example
 * const user: User = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com',
 *   username: 'johndoe',
 *   password_hash: '$2a$10$N9qo8uLOickgx2ZMRZoMy...',
 *   created_at: '2024-01-15T10:30:00.000Z',
 *   updated_at: '2024-01-15T10:30:00.000Z'
 * };
 *
 * @see {@link UserPublic} for the safe-to-expose variant
 * @see {@link toPublicUser} in models/user.ts to convert User to UserPublic
 */
export interface User {
  /** Unique identifier in UUID v4 format */
  id: string;

  /** User's email address (normalized to lowercase) */
  email: string;

  /** User's chosen username (normalized to lowercase) */
  username: string;

  /** Bcrypt password hash - NEVER expose this to clients */
  password_hash: string;

  /** ISO 8601 timestamp of account creation */
  created_at: string;

  /** ISO 8601 timestamp of last modification */
  updated_at: string;
}

/**
 * Public-safe user entity for API responses.
 *
 * This interface represents user data that is safe to expose in API
 * responses. It excludes sensitive fields like password_hash.
 *
 * @interface UserPublic
 *
 * @property {string} id - Unique identifier (UUID v4 format)
 * @property {string} email - User's email address
 * @property {string} username - User's display name
 * @property {string} created_at - ISO 8601 timestamp of account creation
 * @property {string} updated_at - ISO 8601 timestamp of last modification
 *
 * @example
 * // API response example
 * res.json({
 *   user: {
 *     id: '123e4567-e89b-12d3-a456-426614174000',
 *     email: 'user@example.com',
 *     username: 'johndoe',
 *     created_at: '2024-01-15T10:30:00.000Z',
 *     updated_at: '2024-01-15T10:30:00.000Z'
 *   }
 * });
 *
 * @see {@link User} for the complete user entity
 */
export interface UserPublic {
  /** Unique identifier in UUID v4 format */
  id: string;

  /** User's email address */
  email: string;

  /** User's chosen username */
  username: string;

  /** ISO 8601 timestamp of account creation */
  created_at: string;

  /** ISO 8601 timestamp of last modification */
  updated_at: string;
}

/**
 * JWT token payload structure.
 *
 * This interface defines the claims embedded in JWT tokens issued by the
 * authentication system. The payload is signed but not encrypted, so it
 * should only contain non-sensitive identification data.
 *
 * @interface JwtPayload
 *
 * @property {string} userId - The user's unique identifier (UUID)
 * @property {string} email - The user's email address at time of token issuance
 *
 * @example
 * const payload: JwtPayload = {
 *   userId: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com'
 * };
 *
 * // Generate token
 * const token = generateToken(payload);
 *
 * // Verify and extract payload
 * const decoded = verifyToken(token); // Returns JwtPayload
 *
 * @remarks
 * - Tokens expire after 7 days by default (configurable via JWT_EXPIRES_IN)
 * - The email in the payload may become stale if user updates their email
 * - Always fetch fresh user data from the database for critical operations
 *
 * @see {@link generateToken} in utils/jwt.ts
 * @see {@link verifyToken} in utils/jwt.ts
 */
export interface JwtPayload {
  /** User's unique identifier (UUID v4) */
  userId: string;

  /** User's email address at time of token creation */
  email: string;
}

/**
 * Extended Express Request with authenticated user data.
 *
 * This interface extends the standard Express Request to include an
 * optional `user` property that is populated by the authentication
 * middleware after successful token verification.
 *
 * @interface AuthRequest
 * @extends {Request}
 *
 * @property {JwtPayload} [user] - Authenticated user's JWT payload (undefined if not authenticated)
 *
 * @example
 * // In a protected route handler
 * router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
 *   if (!req.user) {
 *     return res.status(401).json({ error: 'Not authenticated' });
 *   }
 *
 *   // Access authenticated user data
 *   const userId = req.user.userId;
 *   const email = req.user.email;
 *
 *   // Fetch full user profile from database
 *   const user = findUserById(userId);
 *   res.json({ user: toPublicUser(user) });
 * });
 *
 * @remarks
 * - The `user` property is only populated after passing through the `authenticate` middleware
 * - Even after authentication, always check `if (!req.user)` for type safety
 * - The user object contains only JWT payload data, not the full user record
 *
 * @see {@link authenticate} middleware in middleware/auth.ts
 */
export interface AuthRequest extends Request {
  /** Authenticated user's JWT payload, populated by authenticate middleware */
  user?: JwtPayload;
}

/**
 * Standard error response structure.
 *
 * @interface ErrorResponse
 */
export interface ErrorResponse {
  /** Error message describing what went wrong */
  error: string;
  /** Optional validation error details (from Zod) */
  details?: Array<{ path: PropertyKey[]; message: string }>;
}

/**
 * Health check endpoint response.
 *
 * @interface HealthResponse
 */
export interface HealthResponse {
  /** Server status - "ok" when server is running */
  status: 'ok';
  /** ISO 8601 timestamp of the response */
  timestamp: string;
}

/**
 * Successful authentication response (signup/signin).
 *
 * @interface AuthSuccessResponse
 */
export interface AuthSuccessResponse {
  /** Success message */
  message: string;
  /** Public user profile */
  user: UserPublic;
  /** JWT authentication token */
  token: string;
}

/**
 * User profile response (GET /auth/me).
 *
 * @interface UserProfileResponse
 */
export interface UserProfileResponse {
  /** Public user profile */
  user: UserPublic;
}

/**
 * Type guard to check if a value is a valid JwtPayload.
 *
 * @param value - The value to check
 * @returns True if the value is a valid JwtPayload
 */
export function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'email' in value &&
    typeof (value as JwtPayload).userId === 'string' &&
    typeof (value as JwtPayload).email === 'string'
  );
}
