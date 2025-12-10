import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
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

const router = Router();

// Validation schemas
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

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/signup
router.post('/signup', async (req, res: Response) => {
  try {
    // Validate input
    const validation = signUpSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { email, username, password } = validation.data;

    // Check if email already exists
    if (findUserByEmail(email)) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Check if username already exists
    if (findUserByUsername(username)) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    // Create user
    const user = await createUser(email, username, password);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/signin
router.post('/signin', async (req, res: Response) => {
  try {
    // Validate input
    const validation = signInSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { email, password } = validation.data;

    // Validate credentials
    const user = await validateCredentials(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Signed in successfully',
      user: toPublicUser(user),
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
