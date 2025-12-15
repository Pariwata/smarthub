/**
 * @fileoverview Password hashing and verification utilities.
 *
 * This module provides secure password handling functions using bcrypt,
 * a proven cryptographic hashing algorithm designed for password storage.
 * Bcrypt automatically handles salt generation and incorporates a
 * configurable work factor to resist brute-force attacks.
 *
 * @module utils/password
 * @version 1.0.0
 *
 * @requires bcryptjs - Pure JavaScript bcrypt implementation
 *
 * @example
 * import { hashPassword, verifyPassword } from './utils/password';
 *
 * // Hash a password for storage
 * const hash = await hashPassword('user-secret-password');
 * // Store hash in database...
 *
 * // Later, verify a password attempt
 * const isValid = await verifyPassword('user-secret-password', hash);
 * if (isValid) {
 *   // Password matches, allow access
 * }
 *
 * @security
 * - Never store plaintext passwords
 * - Never log passwords or hashes
 * - Use HTTPS for password transmission
 * - Implement rate limiting on login endpoints
 */

import bcrypt from 'bcryptjs';

/**
 * Number of bcrypt salt rounds (cost factor).
 *
 * @constant {number}
 * @default 10
 *
 * @description
 * The salt rounds parameter controls the computational cost of hashing.
 * Each increment doubles the time required to compute a hash:
 *
 * | Rounds | Approx. Time | Security Level |
 * |--------|--------------|----------------|
 * | 8      | ~40ms        | Minimum        |
 * | 10     | ~100ms       | Recommended    |
 * | 12     | ~300ms       | High Security  |
 * | 14     | ~1s          | Very High      |
 *
 * A value of 10 provides a good balance between security and performance
 * for most applications, resulting in approximately 100ms hash time.
 *
 * @remarks
 * - Higher values increase resistance to brute-force attacks
 * - Higher values also increase server CPU load during authentication
 * - Consider your server capacity and expected login frequency
 * - Value of 10 is OWASP recommended minimum as of 2024
 *
 * @security
 * - Never reduce below 10 in production
 * - Re-hash passwords when increasing rounds (on next login)
 * - Monitor authentication latency if increasing rounds
 */
const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt.
 *
 * Generates a cryptographically secure hash of the provided password
 * using the bcrypt algorithm. The resulting hash includes:
 * - Algorithm identifier ($2a$)
 * - Cost factor (salt rounds)
 * - 128-bit salt (22 characters)
 * - 184-bit hash (31 characters)
 *
 * @async
 * @function hashPassword
 * @param {string} password - The plaintext password to hash
 * @returns {Promise<string>} A bcrypt hash string (60 characters)
 *
 * @example
 * // Basic usage
 * const hash = await hashPassword('mySecurePassword123');
 * console.log(hash);
 * // Output: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
 *
 * @example
 * // Used in user registration
 * async function createUser(email: string, password: string) {
 *   const passwordHash = await hashPassword(password);
 *
 *   const user = await db.insert('users', {
 *     email,
 *     password_hash: passwordHash,
 *     created_at: new Date()
 *   });
 *
 *   return user;
 * }
 *
 * @remarks
 * - Each call generates a unique hash due to random salt generation
 * - The same password will produce different hashes each time
 * - Hash comparison must use {@link verifyPassword}, not string equality
 * - Operation is CPU-intensive; avoid calling in tight loops
 * - Execution time is approximately 100ms with SALT_ROUNDS=10
 *
 * @security
 * - Never log the input password
 * - Ensure password meets complexity requirements before hashing
 * - Store only the hash, never the plaintext password
 * - Use parameterized queries when storing to prevent SQL injection
 *
 * @see {@link verifyPassword} - To verify passwords against hashes
 * @see {@link SALT_ROUNDS} - Cost factor configuration
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 *
 * Performs a constant-time comparison between the provided password
 * and a stored hash. The function extracts the salt from the hash
 * and re-hashes the password for comparison.
 *
 * @async
 * @function verifyPassword
 * @param {string} password - The plaintext password to verify
 * @param {string} hash - The bcrypt hash to verify against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 *
 * @example
 * // Basic usage
 * const storedHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
 *
 * const isValid = await verifyPassword('mySecurePassword123', storedHash);
 * console.log(isValid); // true
 *
 * const isInvalid = await verifyPassword('wrongPassword', storedHash);
 * console.log(isInvalid); // false
 *
 * @example
 * // Used in login flow
 * async function login(email: string, password: string) {
 *   const user = await db.findUserByEmail(email);
 *
 *   if (!user) {
 *     // User not found - but don't reveal this to prevent enumeration
 *     throw new Error('Invalid credentials');
 *   }
 *
 *   const isValid = await verifyPassword(password, user.password_hash);
 *
 *   if (!isValid) {
 *     throw new Error('Invalid credentials');
 *   }
 *
 *   return user;
 * }
 *
 * @remarks
 * - Uses constant-time comparison to prevent timing attacks
 * - Automatically extracts salt from the stored hash
 * - Works with hashes created using any valid salt rounds value
 * - Operation is CPU-intensive (same cost as hashing)
 * - Returns false for malformed hashes (doesn't throw)
 *
 * @security
 * - Never log whether verification succeeded for specific users
 * - Use generic error messages ("Invalid credentials") to prevent enumeration
 * - Implement account lockout after repeated failed attempts
 * - Consider adding artificial delay for failed attempts
 *
 * @see {@link hashPassword} - To create password hashes
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
