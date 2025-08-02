[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / constants/web

# constants/web

## Type Aliases

### HTTPRequestMethod

> **HTTPRequestMethod** = `"CONNECT"` \| `"DELETE"` \| `"GET"` \| `"HEAD"` \| `"OPTIONS"` \| `"PATCH"` \| `"POST"` \| `"PUT"` \| `"TRACE"`

Defined in: [src/constants/web.d.mts:45](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/web.d.mts#L45)

Represents the standard HTTP request methods.
This is a union of string literals corresponding to the nine standard HTTP verbs
as defined in the HTTP specification.

Each method has a specific semantic meaning:

- `GET`: Retrieve data (safe, idempotent)
- `POST`: Submit data (not idempotent)
- `PUT`: Update/replace resource (idempotent)
- `PATCH`: Partial update (not necessarily idempotent)
- `DELETE`: Remove resource (idempotent)
- `HEAD`: Get headers only (safe, idempotent)
- `OPTIONS`: Get allowed methods (safe, idempotent)
- `CONNECT`: Establish tunnel (for proxies)
- `TRACE`: Diagnostic loopback (rarely used)

#### See

- [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [RFC 7231 Section 4](https://tools.ietf.org/html/rfc7231#section-4)

#### Example

```ts
// Type-safe HTTP client
interface RequestConfig {
    method: HTTPRequestMethod;
    url: string;
    data?: unknown;
}

const makeRequest = (config: RequestConfig) => {
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
```
