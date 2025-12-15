/**
 * @fileoverview Authentication API routes for user registration and login.
 *
 * This module defines the REST API endpoints for the SmartHub authentication
 * system. It handles user sign-up, sign-in, and profile retrieval operations.
 *
 * @module routes/auth
 * @version 1.0.0
 *
 * @requires express - Web framework
 * @requires zod - Schema validation library
 * @requires ../types - Type definitions
 * @requires ../middleware/auth - Authentication middleware
 * @requires ../utils/jwt - JWT utilities
 * @requires ../models/user - User data access layer
 *
 * ## API Endpoints
 *
 * | Method | Path         | Auth Required | Description                    |
 * |--------|--------------|---------------|--------------------------------|
 * | POST   | /auth/signup | No            | Create a new user account      |
 * | POST   | /auth/signin | No            | Authenticate and get token     |
 * | GET    | /auth/me     | Yes           | Get authenticated user profile |
 *
 * @example
 * // Mount routes in main app
 * import authRoutes from './routes/auth';
 * app.use('/auth', authRoutes);
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, AuthSuccessResponse, ErrorResponse, UserProfileResponse } from '../types';
import { authenticate } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  validateCredentials,
  toPublicUser,
} from '../models/user';

/**
 * Express router instance for authentication endpoints.
 *
 * @type {Router}
 */
const router = Router();

/**
 * Zod schema for user registration validation.
 *
 * Validates the request body for the signup endpoint, ensuring:
 * - Email is in valid format
 * - Username meets length and character requirements
 * - Password meets minimum security requirements
 *
 * @constant {z.ZodObject}
 *
 * @property {string} email - Must be valid email format
 * @property {string} username - 3-30 chars, alphanumeric and underscores only
 * @property {string} password - 8-100 characters
 *
 * @example
 * // Valid input
 * {
 *   "email": "user@example.com",
 *   "username": "john_doe",
 *   "password": "securePassword123"
 * }
 *
 * @example
 * // Invalid input examples
 * { "email": "not-an-email" }              // Invalid email format
 * { "username": "ab" }                      // Too short (min 3)
 * { "username": "john-doe" }                // Invalid char (hyphen)
 * { "password": "short" }                   // Too short (min 8)
 */
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
});

/**
 * Zod schema for user login validation.
 *
 * Validates the request body for the signin endpoint.
 *
 * @constant {z.ZodObject}
 *
 * @property {string} email - Must be valid email format
 * @property {string} password - Must not be empty
 *
 * @example
 * // Valid input
 * {
 *   "email": "user@example.com",
 *   "password": "myPassword123"
 * }
 */
const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Type for signup request body after Zod validation.
 */
type SignUpBody = z.infer<typeof signUpSchema>;

/**
 * Type for signin request body after Zod validation.
 */
type SignInBody = z.infer<typeof signInSchema>;

/**
 * POST /auth/signup - Create a new user account.
 *
 * Registers a new user with email, username, and password. Returns the
 * created user profile and a JWT token for immediate authentication.
 *
 * @route POST /auth/signup
 * @group Authentication - User registration and login
 *
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.username - Desired username (3-30 chars, alphanumeric + underscore)
 * @param {string} req.body.password - Password (8-100 characters)
 *
 * @returns {Object} 201 - Success response
 * @returns {string} response.message - Success message
 * @returns {UserPublic} response.user - Created user profile
 * @returns {string} response.token - JWT authentication token
 *
 * @returns {Object} 400 - Validation error
 * @returns {string} response.error - Error message
 * @returns {Array} response.details - Validation error details
 *
 * @returns {Object} 409 - Conflict (duplicate email/username)
 * @returns {string} response.error - Error message
 *
 * @returns {Object} 500 - Server error
 * @returns {string} response.error - Error message
 *
 * @example
 * // Request
 * POST /auth/signup
 * Content-Type: application/json
 *
 * {
 *   "email": "newuser@example.com",
 *   "username": "newuser",
 *   "password": "securePassword123"
 * }
 *
 * // Success Response (201)
 * {
 *   "message": "User created successfully",
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "email": "newuser@example.com",
 *     "username": "newuser",
 *     "created_at": "2024-01-15T10:30:00.000Z",
 *     "updated_at": "2024-01-15T10:30:00.000Z"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * // Validation Error (400)
 * {
 *   "error": "Validation failed",
 *   "details": [
 *     { "path": ["email"], "message": "Invalid email format" }
 *   ]
 * }
 *
 * // Conflict Error (409)
 * {
 *   "error": "Email already registered"
 * }
 */
router.post(
  '/signup',
  async (
    req: Request<Record<string, never>, AuthSuccessResponse | ErrorResponse, SignUpBody>,
    res: Response<AuthSuccessResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      // Step 1: Validate request body against schema
      const validation = signUpSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues.map((e) => ({ path: e.path, message: e.message })),
        });
        return;
      }

      const { email, username, password } = validation.data;

      // Step 2: Check if email already exists
      if (findUserByEmail(email)) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      // Step 3: Check if username already exists
      if (findUserByUsername(username)) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      // Step 4: Create user (password is hashed internally)
      const user = await createUser(email, username, password);

      // Step 5: Generate authentication token
      const token = generateToken({ userId: user.id, email: user.email });

      // Step 6: Return success response
      res.status(201).json({
        message: 'User created successfully',
        user,
        token,
      });
    } catch (error: unknown) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /auth/signin - Authenticate user and get token.
 *
 * Validates user credentials and returns a JWT token for authenticated
 * API access.
 *
 * @route POST /auth/signin
 * @group Authentication - User registration and login
 *
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 *
 * @returns {Object} 200 - Success response
 * @returns {string} response.message - Success message
 * @returns {UserPublic} response.user - User profile
 * @returns {string} response.token - JWT authentication token
 *
 * @returns {Object} 400 - Validation error
 * @returns {string} response.error - Error message
 * @returns {Array} response.details - Validation error details
 *
 * @returns {Object} 401 - Authentication failed
 * @returns {string} response.error - Error message
 *
 * @returns {Object} 500 - Server error
 * @returns {string} response.error - Error message
 *
 * @example
 * // Request
 * POST /auth/signin
 * Content-Type: application/json
 *
 * {
 *   "email": "user@example.com",
 *   "password": "myPassword123"
 * }
 *
 * // Success Response (200)
 * {
 *   "message": "Signed in successfully",
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "email": "user@example.com",
 *     "username": "johndoe",
 *     "created_at": "2024-01-15T10:30:00.000Z",
 *     "updated_at": "2024-01-15T10:30:00.000Z"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * // Authentication Failed (401)
 * {
 *   "error": "Invalid email or password"
 * }
 *
 * @security
 * - Generic error message prevents user enumeration
 * - Implement rate limiting to prevent brute-force attacks
 */
router.post(
  '/signin',
  async (
    req: Request<Record<string, never>, AuthSuccessResponse | ErrorResponse, SignInBody>,
    res: Response<AuthSuccessResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      // Step 1: Validate request body
      const validation = signInSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues.map((e) => ({ path: e.path, message: e.message })),
        });
        return;
      }

      const { email, password } = validation.data;

      // Step 2: Validate credentials
      // Returns null for both wrong email and wrong password (security)
      const user = await validateCredentials(email, password);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Step 3: Generate authentication token
      const token = generateToken({ userId: user.id, email: user.email });

      // Step 4: Return success response
      res.json({
        message: 'Signed in successfully',
        user: toPublicUser(user),
        token,
      });
    } catch (error: unknown) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /auth/me - Get authenticated user's profile.
 *
 * Returns the profile of the currently authenticated user. Requires a
 * valid JWT token in the Authorization header.
 *
 * @route GET /auth/me
 * @group Authentication - User registration and login
 *
 * @security BearerAuth
 *
 * @header {string} Authorization - Bearer token (format: "Bearer <jwt-token>")
 *
 * @returns {Object} 200 - Success response
 * @returns {UserPublic} response.user - User profile
 *
 * @returns {Object} 401 - Not authenticated
 * @returns {string} response.error - Error message
 *
 * @returns {Object} 404 - User not found
 * @returns {string} response.error - Error message
 *
 * @returns {Object} 500 - Server error
 * @returns {string} response.error - Error message
 *
 * @example
 * // Request
 * GET /auth/me
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * // Success Response (200)
 * {
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "email": "user@example.com",
 *     "username": "johndoe",
 *     "created_at": "2024-01-15T10:30:00.000Z",
 *     "updated_at": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 *
 * // Not Authenticated (401)
 * {
 *   "error": "No authorization header provided"
 * }
 *
 * // User Not Found (404) - rare case where user was deleted
 * {
 *   "error": "User not found"
 * }
 */
router.get(
  '/me',
  authenticate,
  (req: AuthRequest, res: Response<UserProfileResponse | ErrorResponse>): void => {
    try {
      // Type guard: req.user is set by authenticate middleware
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Fetch fresh user data from database
      // (token may contain stale email if user updated it)
      const user = findUserById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Return public user profile
      res.json({ user: toPublicUser(user) });
    } catch (error: unknown) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Default export: Authentication router.
 *
 * Mount this router at /auth to enable all authentication endpoints.
 *
 * @example
 * import authRoutes from './routes/auth';
 * app.use('/auth', authRoutes);
 */
export default router;
