import 'dotenv/config';

interface Config {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  SESSION_TIMEOUT_MINUTES: number;
}

const config = {
  POSTGRES_USER: process.env.POSTGRES_USER || 'librebiztools',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  POSTGRES_DB: process.env.POSTGRES_DB || 'librebiztools',
  SESSION_TIMEOUT_MINUTES: 20,
} as Config;

export default config;
