import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import { User, UserPublic } from '../types';
import { hashPassword, verifyPassword } from '../utils/password';

export function toPublicUser(user: User): UserPublic {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

export function findUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.toLowerCase()) as User | undefined;
}

export function findUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username.toLowerCase()) as User | undefined;
}

export function findUserById(id: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<UserPublic> {
  const id = uuidv4();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, email.toLowerCase(), username.toLowerCase(), passwordHash, now, now);

  const user = findUserById(id);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return toPublicUser(user);
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return user;
}
