import 'dotenv/config';

interface Config {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  SESSION_TIMEOUT_MINUTES: number;
}

if (!process.env.POSTGRES_USER) {
  throw new Error('Missing POSTGRES_USER. Was it specified in .env?');
}

if (!process.env.POSTGRES_PASSWORD) {
  throw new Error('Missing POSTGRES_PASSWORD. Was it specified in .env?');
}

if (!process.env.POSTGRES_DB) {
  throw new Error('Missing POSTGRES_DB. Was it specified in .env?');
}

const config = {
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
  SESSION_TIMEOUT_MINUTES: 20,
} as Config;

export default config;
