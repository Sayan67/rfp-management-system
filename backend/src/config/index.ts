import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL!,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },

  email: {
    smtp: {
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASSWORD!,
      },
      from: process.env.EMAIL_FROM!,
    },
    imap: {
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT || '993'),
      user: process.env.IMAP_USER!,
      password: process.env.IMAP_PASSWORD!,
      tls: process.env.IMAP_TLS !== 'false',
    },
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'IMAP_HOST',
  'IMAP_USER',
  'IMAP_PASSWORD',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
