// The HTTP method `XMLHttpRequest#open` takes and `Request#method` holds, for
// the twelve harnesses to hold. Every harness's `tsconfig.lib-check.json` and
// `tsconfig.lib-check.webworker.json` name this file.
//
// #2889 — `open` took the `<form method>` values `'post' | 'get' | 'dialog'`,
// and `Request#method` was an upper-case union that fetch does not produce.

import type { HTTPRequestMethod, TypeEq } from 'ts-type-forge';

/** Every method token is accepted, lower-case and custom ones included. */
export const xhrOpenTakesAnyMethodToken = (
  xhr: XMLHttpRequest,
  url: string,
  method: string,
): void => {
  xhr.open('POST', url);

  xhr.open('PUT', url);

  xhr.open('DELETE', url);

  // XHR upper-cases it.
  xhr.open('post', url);

  // Sent as written: `PATCH` is not one of the methods XHR upper-cases.
  xhr.open('patch', url);

  xhr.open('PROPFIND', url);

  xhr.open(method, url, true);

  // @ts-expect-error a method is a string
  xhr.open(1, url);
};

/**
 * The upper-case methods stay literal members of the union, which a plain
 * `string` would not keep.
 */
export const xhrOpenKeepsLiteralMembers = (): true =>
  true satisfies TypeEq<
    Parameters<XMLHttpRequest['open']>[0],
    HTTPRequestMethod | (string & {})
  >;

/**
 * Fetch upper-cases only some standard methods and passes any other token
 * through as written, so the method of a `Request` is a `string`.
 */
export const requestMethodIsString = (url: string): true => {
  const req = new Request(url, { method: 'patch' });

  return true satisfies TypeEq<typeof req.method, string>;
};
