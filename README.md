# SmartHub Authentication API

A secure, well-documented JWT-based authentication service built with TypeScript, Express, and SQLite.

## Features

- User registration with email and username
- Secure password hashing with bcrypt
- JWT-based authentication
- SQLite database with better-sqlite3
- Input validation with Zod
- Comprehensive JSDoc documentation

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The server will start at `http://localhost:3000`.

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Sign Up

```
POST /auth/signup
Content-Type: application/json
```

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Valid email format
- `username`: 3-30 characters, alphanumeric and underscores only
- `password`: 8-100 characters

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `400` - Validation failed
- `409` - Email already registered / Username already taken
- `500` - Internal server error

### Sign In

```
POST /auth/signin
Content-Type: application/json
```

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "myPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid email or password
- `500` - Internal server error

### Get Profile

```
GET /auth/me
Authorization: Bearer <token>
```

Get the authenticated user's profile.

**Success Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - No authorization header / Invalid or expired token
- `404` - User not found
- `500` - Internal server error

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `fallback-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |

**Important:** Always set `JWT_SECRET` to a strong, random value in production!

```bash
# Generate a secure secret
openssl rand -base64 32
```

## Project Structure

```
src/
├── index.ts              # Server entry point
├── types/
│   └── index.ts          # TypeScript type definitions
├── utils/
│   ├── db.ts             # Database connection and setup
│   ├── jwt.ts            # JWT token utilities
│   └── password.ts       # Password hashing utilities
├── middleware/
│   └── auth.ts           # Authentication middleware
├── models/
│   └── user.ts           # User data access layer
└── routes/
    └── auth.ts           # Authentication API routes
```

## Security Features

- **Password Hashing**: Bcrypt with cost factor 10 (OWASP recommended minimum)
- **JWT Tokens**: Signed with configurable secret and expiration
- **Input Validation**: Zod schemas for all endpoints
- **SQL Injection Prevention**: Parameterized queries via better-sqlite3
- **Generic Error Messages**: Prevents user enumeration attacks

## Documentation

All modules include comprehensive JSDoc documentation:

- Function descriptions and parameters
- Return types and possible errors
- Usage examples
- Security considerations
- Related function references

Generate documentation with TypeDoc:
```bash
npx typedoc src/index.ts --out docs
```

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm run start    # Run production build
```

## License

ISC
