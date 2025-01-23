import 'dotenv/config';

interface Config {
  DB_FILE_NAME: string;
  SESSION_TIMEOUT_MINUTES: number;
}

if (!process.env.DB_FILE_NAME) {
  throw new Error('Missing DB_FILE_NAME. Was it specified in .env?');
}

const config = {
  DB_FILE_NAME: process.env.DB_FILE_NAME,
  SESSION_TIMEOUT_MINUTES: 20,
} as Config;

export default config;
