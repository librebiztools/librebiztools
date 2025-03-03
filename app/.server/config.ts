import 'dotenv/config';
import type { RoleConfig, UserConfig, WorkspaceConfig } from '~/config';
import appConfig from '~/config';

interface Config {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  SESSION_TIMEOUT_MINUTES: number;
  BASE_URL: string;
  USER: UserConfig;
  ROLE: RoleConfig;
  WORKSPACE: WorkspaceConfig;
}

const config = {
  POSTGRES_USER: process.env.POSTGRES_USER || 'tickflo',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  POSTGRES_DB: process.env.POSTGRES_DB || 'tickflo',
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  SESSION_TIMEOUT_MINUTES: 20,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  ...appConfig,
} as Config;

export default config;
