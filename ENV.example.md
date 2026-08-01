# Environment Variables

This document describes the environment variables used by the application.

## Local Development

Create a `.env.local` file in the project root with the following variables:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PTKOM

# Database (if applicable)
DATABASE_URL=postgresql://username:password@localhost:5432/ptkom

# Authentication
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/auth

# API Keys
NEXT_PUBLIC_API_KEY=your-api-key-here

# Feature Flags
NEXT_PUBLIC_ENABLE_FEATURE_X=true
NEXT_PUBLIC_ENABLE_FEATURE_Y=false
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | `http://localhost:3000` | No |
| `NEXT_PUBLIC_APP_NAME` | Application name | `PTKOM` | No |
| `DATABASE_URL` | Database connection string | - | Yes (if using database) |
| `NEXT_PUBLIC_AUTH_URL` | Authentication endpoint | - | Yes (if using auth) |
| `NEXT_PUBLIC_API_KEY` | API key for external services | - | Yes (if using external APIs) |
| `NEXT_PUBLIC_ENABLE_FEATURE_X` | Enable/disable feature X | `false` | No |
| `NEXT_PUBLIC_ENABLE_FEATURE_Y` | Enable/disable feature Y | `false` | No |

## Environment-Specific Configuration

### Development (`.env.development`)

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_FEATURE_X=true
```

### Production (`.env.production`)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ENABLE_FEATURE_X=false
NEXT_PUBLIC_ENABLE_FEATURE_Y=true
```

### Testing (`.env.test`)

```env
NODE_ENV=test
NEXT_PUBLIC_APP_URL=http://localhost:3001
DATABASE_URL=postgresql://username:password@localhost:5433/ptkom_test
```

## Environment Variable Loading Order

1. `.env.local` (local development)
2. `.env.development.local` (development)
3. `.env.development` (development)
4. `.env.test.local` (test)
5. `.env.test` (test)
6. `.env.production.local` (production)
7. `.env.production` (production)
8. `.env` (fallback)

## Security Best Practices

- Never commit `.env*` files to version control
- Add `.env*` files to `.gitignore`
- Use different values for different environments
- Keep sensitive keys out of version control
- Use environment-specific configuration for secrets

## Example: Accessing Environment Variables

```typescript
// In Next.js components
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// In server-side code
const databaseUrl = process.env.DATABASE_URL;

// In client-side code (must be prefixed with NEXT_PUBLIC_)
const publicApiKey = process.env.NEXT_PUBLIC_API_KEY;
```

## Troubleshooting

### Environment Variables Not Loading

1. Check that the file exists in the correct location
2. Verify the variable name is correct
3. Ensure the file is not in `.gitignore`
4. Restart the development server

### Environment Variables Not Available in Client Components

Only variables prefixed with `NEXT_PUBLIC_` are available in client components.

### Environment Variables Not Available in Server Components

All environment variables are available in server components, but variables not prefixed with `NEXT_PUBLIC_` should be prefixed with `NEXT_PUBLIC_` if they need to be available in client components.
