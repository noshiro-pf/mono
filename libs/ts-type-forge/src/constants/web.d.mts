/**
 * Represents the standard HTTP request methods.
 * This is a union of string literals corresponding to common HTTP verbs.
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 */
type HTTPRequestMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';
