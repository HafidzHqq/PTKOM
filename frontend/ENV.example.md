# Environment Variables

This document describes the environment variables used by the application.

## Local Development

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-for-nextauth

# Google OAuth (for Login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Providers (At least one is required)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
MISTRAL_API_KEY=your-mistral-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# AI Model Overrides (Optional)
GEMINI_MODEL=gemini-2.5-flash
GROQ_MODEL=llama-3.2-90b-vision-preview
MISTRAL_MODEL=pixtral-12b-2409
OPENROUTER_MODEL=google/gemini-2.5-flash
```

## Database
For local development, the application uses SQLite by default. The database file \`local.db\` will be automatically created in the \`frontend\` directory when you run the application. No database configuration is required in \`.env.local\`.
