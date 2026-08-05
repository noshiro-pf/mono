import { hasKey } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';

// embed-sample-code-ignore-above

// Safe handling of unknown objects
const processData = (data: UnknownRecord) => {
  // Must use type guards to access properties safely
  if (hasKey(data, 'name') && typeof data.name === 'string') {
    console.log(data.name);
  }
};

// Configuration object
const config: UnknownRecord = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};

// Unlike `any`, this requires type checking
// const name = data.name; // Error without type guard

// embed-sample-code-ignore-below
export { config, processData };
