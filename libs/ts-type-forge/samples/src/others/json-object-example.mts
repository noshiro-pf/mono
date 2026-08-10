import { type JsonObject } from 'ts-type-forge';

// embed-sample-code-ignore-above

const config: JsonObject = {
  database: {
    host: 'localhost',
    port: 5432,
    ssl: true,
  },
  features: ['auth', 'logging'],
} as const;

// config.database.port = 3306; // ✗ Error: readonly property

// embed-sample-code-ignore-below
export { config };
