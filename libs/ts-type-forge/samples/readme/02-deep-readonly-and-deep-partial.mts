type Config = {
  port: number;
  database: {
    host: string;
    port: number;
    credentials?: {
      user: string;
      pass: string;
    };
  };
  features: string[];
};

// Create a type where all properties, nested or not, are readonly
type ReadonlyConfig = DeepReadonly<Config>;

const config: ReadonlyConfig = {
  port: 8080,
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      user: 'admin',
      pass: 'secret',
    },
  },
  features: ['featureA', 'featureB'],
};

// @ts-expect-error Cannot assign to 'port' because it is a read-only property
config.port = 8081;

// @ts-expect-error Cannot assign to 'host' because it is a read-only property
config.database.host = 'remote';

// @ts-expect-error Property 'push' does not exist on type 'readonly string[]'
config.features.push('featureC');

// Create a type where all properties are optional (useful for partial updates)
type PartialConfig = DeepPartial<Config>;

const partialUpdate: PartialConfig = {
  database: {
    host: 'new-host', // Only update specific fields
    // port and credentials are optional
  },
  // port and features are optional
};

// embed-sample-code-ignore-below
export { config, partialUpdate };
