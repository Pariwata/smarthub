/**
 * @fileoverview User model and database operations for the authentication system.
 *
 * This module provides the data access layer for user management, including
 * CRUD operations and credential validation. It uses SQLite with better-sqlite3
 * for synchronous database operations (except password hashing which is async).
 *
 * @module models/user
 * @version 1.0.0
 *
 * @requires uuid - UUID generation for user IDs
 * @requires ../utils/db - Database connection
 * @requires ../types - User type definitions
 * @requires ../utils/password - Password hashing utilities
 *
 * @example
 * import {
 *   createUser,
 *   findUserByEmail,
 *   validateCredentials,
 *   toPublicUser
 * } from './models/user';
 *
 * // Create a new user
 * const user = await createUser('user@example.com', 'johndoe', 'password123');
 *
 * // Find user by email
 * const existingUser = findUserByEmail('user@example.com');
 *
 * // Validate login credentials
 * const authenticatedUser = await validateCredentials('user@example.com', 'password123');
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { User, UserPublic } from '../types';
import { hashPassword, verifyPassword } from '../utils/password';

/**
 * Converts a full User object to a public-safe UserPublic object.
 *
 * Removes sensitive fields (password_hash) from the user object before
 * sending to clients. This function should be used whenever returning
 * user data in API responses.
 *
 * @function toPublicUser
 * @param {User} user - The complete user object from the database
 * @returns {UserPublic} User object without sensitive fields
 *
 * @example
 * // In an API response
 * const user = findUserById(userId);
 * if (user) {
 *   res.json({ user: toPublicUser(user) });
 * }
 *
 * @example
 * // Result comparison
 * const user: User = {
 *   id: '123',
 *   email: 'user@example.com',
 *   username: 'johndoe',
 *   password_hash: '$2a$10$...',  // Sensitive!
 *   created_at: '2024-01-15T10:00:00Z',
 *   updated_at: '2024-01-15T10:00:00Z'
 * };
 *
 * const publicUser = toPublicUser(user);
 * // Result:
 * // {
 * //   id: '123',
 * //   email: 'user@example.com',
 * //   username: 'johndoe',
 * //   created_at: '2024-01-15T10:00:00Z',
 * //   updated_at: '2024-01-15T10:00:00Z'
 * // }
 * // Note: password_hash is removed
 *
 * @security
 * - Always use this function before sending user data to clients
 * - Never expose password_hash in API responses or logs
 *
 * @see {@link User} - Complete user type with password_hash
 * @see {@link UserPublic} - Safe-to-expose user type
 */
export function toPublicUser(user: User): UserPublic {
  // Destructure to exclude password_hash using rest operator
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

/**
 * Finds a user by their email address.
 *
 * Performs a case-insensitive lookup of users by email. Email addresses
 * are stored in lowercase, so the input is normalized before querying.
 *
 * @function findUserByEmail
 * @param {string} email - The email address to search for
 * @returns {User | undefined} The user object if found, undefined otherwise
 *
 * @example
 * // Check if email is already registered
 * const existingUser = findUserByEmail('user@example.com');
 * if (existingUser) {
 *   console.log('Email already registered');
 * }
 *
 * @example
 * // Case-insensitive matching
 * findUserByEmail('USER@EXAMPLE.COM');  // Matches 'user@example.com'
 * findUserByEmail('User@Example.Com');  // Matches 'user@example.com'
 *
 * @remarks
 * - Email comparison is case-insensitive (normalized to lowercase)
 * - Returns the complete User object including password_hash
 * - Use {@link toPublicUser} before exposing the result to clients
 * - This is a synchronous function using better-sqlite3
 *
 * @see {@link findUserById} - Find user by UUID
 * @see {@link findUserByUsername} - Find user by username
 */
export function findUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.toLowerCase()) as User | undefined;
}

/**
 * Finds a user by their username.
 *
 * Performs a case-insensitive lookup of users by username. Usernames
 * are stored in lowercase, so the input is normalized before querying.
 *
 * @function findUserByUsername
 * @param {string} username - The username to search for
 * @returns {User | undefined} The user object if found, undefined otherwise
 *
 * @example
 * // Check if username is taken during registration
 * const existingUser = findUserByUsername('johndoe');
 * if (existingUser) {
 *   res.status(409).json({ error: 'Username already taken' });
 *   return;
 * }
 *
 * @example
 * // Case-insensitive matching
 * findUserByUsername('JohnDoe');   // Matches 'johndoe'
 * findUserByUsername('JOHNDOE');   // Matches 'johndoe'
 *
 * @remarks
 * - Username comparison is case-insensitive (normalized to lowercase)
 * - Returns the complete User object including password_hash
 * - Use {@link toPublicUser} before exposing the result to clients
 *
 * @see {@link findUserById} - Find user by UUID
 * @see {@link findUserByEmail} - Find user by email
 */
export function findUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username.toLowerCase()) as User | undefined;
}

/**
 * Finds a user by their unique identifier.
 *
 * Looks up a user by their UUID. This is typically used after
 * authentication to fetch the full user profile.
 *
 * @function findUserById
 * @param {string} id - The user's UUID
 * @returns {User | undefined} The user object if found, undefined otherwise
 *
 * @example
 * // Fetch user profile in protected route
 * router.get('/me', authenticate, (req: AuthRequest, res) => {
 *   const user = findUserById(req.user.userId);
 *   if (!user) {
 *     return res.status(404).json({ error: 'User not found' });
 *   }
 *   res.json({ user: toPublicUser(user) });
 * });
 *
 * @example
 * // Verify user exists after token validation
 * const payload = verifyToken(token);
 * const user = findUserById(payload.userId);
 * if (!user) {
 *   // User was deleted after token was issued
 *   throw new Error('User no longer exists');
 * }
 *
 * @remarks
 * - ID lookup is exact match (case-sensitive, UUIDs are lowercase)
 * - User may not exist if deleted after token was issued
 * - Always check return value before accessing properties
 *
 * @see {@link findUserByEmail} - Find user by email
 * @see {@link findUserByUsername} - Find user by username
 */
export function findUserById(id: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

/**
 * Creates a new user account.
 *
 * Registers a new user with the provided credentials. The password is
 * securely hashed before storage, and a UUID is generated for the user ID.
 * Email and username are normalized to lowercase for case-insensitive
 * uniqueness.
 *
 * @async
 * @function createUser
 * @param {string} email - User's email address
 * @param {string} username - User's chosen username
 * @param {string} password - User's plaintext password (will be hashed)
 * @returns {Promise<UserPublic>} The created user (without password_hash)
 * @throws {Error} If user creation fails (database error)
 *
 * @example
 * // Basic user registration
 * try {
 *   const user = await createUser(
 *     'user@example.com',
 *     'johndoe',
 *     'securePassword123'
 *   );
 *   console.log('User created:', user.id);
 * } catch (error) {
 *   console.error('Failed to create user:', error);
 * }
 *
 * @example
 * // Full registration flow with validation
 * async function register(email: string, username: string, password: string) {
 *   // Check for existing email
 *   if (findUserByEmail(email)) {
 *     throw new Error('Email already registered');
 *   }
 *
 *   // Check for existing username
 *   if (findUserByUsername(username)) {
 *     throw new Error('Username already taken');
 *   }
 *
 *   // Create user and generate token
 *   const user = await createUser(email, username, password);
 *   const token = generateToken({ userId: user.id, email: user.email });
 *
 *   return { user, token };
 * }
 *
 * @remarks
 * - Email and username are stored in lowercase (case-insensitive uniqueness)
 * - Password is hashed using bcrypt with cost factor 10
 * - User ID is a UUID v4 (random, not sequential)
 * - Timestamps are stored in ISO 8601 format (UTC)
 * - Returns UserPublic (excludes password_hash) for safety
 *
 * @security
 * - Validate email format before calling this function
 * - Validate username format (alphanumeric, underscores, length limits)
 * - Enforce password complexity requirements before calling
 * - Check for duplicate email/username before calling to provide specific errors
 * - Use parameterized queries (already implemented) to prevent SQL injection
 *
 * @see {@link findUserByEmail} - Check for duplicate email
 * @see {@link findUserByUsername} - Check for duplicate username
 * @see {@link hashPassword} - Password hashing implementation
 */
export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<UserPublic> {
  // Generate unique identifier
  const id = uuidv4();

  // Hash password using bcrypt (async operation)
  const passwordHash = await hashPassword(password);

  // Generate timestamps in ISO 8601 format
  const now = new Date().toISOString();

  // Insert user into database
  const stmt = db.prepare(`
    INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Execute insert with normalized email and username
  stmt.run(id, email.toLowerCase(), username.toLowerCase(), passwordHash, now, now);

  // Fetch the created user to return
  const user = findUserById(id);
  if (!user) {
    throw new Error('Failed to create user');
  }

  // Return public user data (excludes password_hash)
  return toPublicUser(user);
}

/**
 * Validates user credentials for authentication.
 *
 * Verifies that the provided email and password match an existing user
 * account. This function is used during the login process.
 *
 * @async
 * @function validateCredentials
 * @param {string} email - User's email address
 * @param {string} password - User's plaintext password
 * @returns {Promise<User | null>} The user if credentials are valid, null otherwise
 *
 * @example
 * // Login flow
 * async function login(email: string, password: string) {
 *   const user = await validateCredentials(email, password);
 *
 *   if (!user) {
 *     // Don't reveal whether email exists or password is wrong
 *     throw new Error('Invalid email or password');
 *   }
 *
 *   const token = generateToken({
 *     userId: user.id,
 *     email: user.email
 *   });
 *
 *   return {
 *     user: toPublicUser(user),
 *     token
 *   };
 * }
 *
 * @example
 * // Express route handler
 * router.post('/signin', async (req, res) => {
 *   const { email, password } = req.body;
 *
 *   const user = await validateCredentials(email, password);
 *   if (!user) {
 *     return res.status(401).json({ error: 'Invalid email or password' });
 *   }
 *
 *   const token = generateToken({ userId: user.id, email: user.email });
 *   res.json({ user: toPublicUser(user), token });
 * });
 *
 * @remarks
 * - Returns null for both non-existent users and wrong passwords
 * - This prevents user enumeration attacks
 * - Email lookup is case-insensitive
 * - Password verification uses constant-time comparison (bcrypt)
 * - Returns full User object (use toPublicUser before exposing)
 *
 * @security
 * - Always return generic "Invalid credentials" message to clients
 * - Implement rate limiting to prevent brute-force attacks
 * - Consider adding artificial delay on failure
 * - Log failed attempts for security monitoring (without passwords)
 * - Implement account lockout after repeated failures
 *
 * @see {@link verifyPassword} - Password verification implementation
 * @see {@link toPublicUser} - Convert result before exposing to clients
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<User | null> {
  // Find user by email (case-insensitive)
  const user = findUserByEmail(email);

  // Return null if user doesn't exist (prevents enumeration)
  if (!user) {
    return null;
  }

  // Verify password against stored hash
  const isValid = await verifyPassword(password, user.password_hash);

  // Return null if password doesn't match
  if (!isValid) {
    return null;
  }

  // Return full user object (caller should use toPublicUser)
  return user;
}
