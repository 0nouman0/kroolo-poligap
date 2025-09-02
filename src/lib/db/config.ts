export const DB_CONFIG = {
  enterprise: {
    uri: process.env.MONGODB_ENTERPRISE_SEARCH_URI,
    name: "enterprise",
  },
} as const;

export type DatabaseName = keyof typeof DB_CONFIG;
export type DbConfig<T extends DatabaseName> = (typeof DB_CONFIG)[T];
