import 'dotenv/config';

interface Config {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  SESSION_TIMEOUT_MINUTES: number;
  BASE_URL: string;
}

const config = {
  POSTGRES_USER: process.env.POSTGRES_USER || 'librebiztools',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  POSTGRES_DB: process.env.POSTGRES_DB || 'librebiztools',
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  SESSION_TIMEOUT_MINUTES: 20,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
} as Config;

export default config;
