import { type HTTPRequestMethod } from 'ts-type-forge';

// embed-sample-code-ignore-above

// Type-safe HTTP client
type RequestConfig = Readonly<{
  method: HTTPRequestMethod;
  url: string;
  data?: unknown;
}>;

const makeRequest = (_config: RequestConfig): void => {
  // Implementation here
};

// Usage
makeRequest({ method: 'GET', url: '/api/users' });
makeRequest({ method: 'POST', url: '/api/users', data: { name: 'John' } });

// Type safety prevents typos
// makeRequest({ method: 'GETS', url: '/api' }); // Error: 'GETS' is not assignable

// Router method mapping
type SafeMethods = Extract<HTTPRequestMethod, 'GET' | 'HEAD' | 'OPTIONS'>;
type UnsafeMethods = Exclude<HTTPRequestMethod, SafeMethods>;

// embed-sample-code-ignore-below
export { makeRequest };
export type { RequestConfig, SafeMethods, UnsafeMethods };
