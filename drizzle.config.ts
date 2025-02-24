import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST } =
  process.env;

export default defineConfig({
  out: './drizzle',
  schema: './app/api.server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DB}`,
  },
});
