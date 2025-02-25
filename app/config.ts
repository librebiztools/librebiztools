export interface UserConfig {
  MIN_NAME_LENGTH: number;
  MAX_NAME_LENGTH: number;
}

export interface WorkspaceConfig {
  MIN_NAME_LENGTH: number;
  MAX_NAME_LENGTH: number;
  MAX_SLUG_LENGTH: number;
}

export interface RoleConfig {
  MIN_NAME_LENGTH: number;
  MAX_NAME_LENGTH: number;
}

interface AppConfig {
  USER: UserConfig;
  ROLE: RoleConfig;
  WORKSPACE: WorkspaceConfig;
}

const config = {
  USER: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
  },
  WORKSPACE: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 100,
    MAX_SLUG_LENGTH: 30,
  },
  ROLE: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 30,
  },
} as AppConfig;

export default config;
