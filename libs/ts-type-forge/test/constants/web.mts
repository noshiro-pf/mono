import { expectType } from '../expect-type.mjs';

// Test that all standard HTTP methods are part of HTTPRequestMethod
expectType<'GET', HTTPRequestMethod>('<=');
expectType<'POST', HTTPRequestMethod>('<=');
expectType<'PUT', HTTPRequestMethod>('<=');
expectType<'PATCH', HTTPRequestMethod>('<=');
expectType<'DELETE', HTTPRequestMethod>('<=');
expectType<'HEAD', HTTPRequestMethod>('<=');
expectType<'OPTIONS', HTTPRequestMethod>('<=');
expectType<'CONNECT', HTTPRequestMethod>('<=');
expectType<'TRACE', HTTPRequestMethod>('<=');

// Test that invalid methods are not part of HTTPRequestMethod
expectType<'get', HTTPRequestMethod>('!<='); // lowercase
expectType<'GETS', HTTPRequestMethod>('!<='); // typo
expectType<'POSTS', HTTPRequestMethod>('!<='); // typo
expectType<'UPDATE', HTTPRequestMethod>('!<='); // not a real HTTP method
expectType<'REMOVE', HTTPRequestMethod>('!<='); // not a real HTTP method
expectType<'', HTTPRequestMethod>('!<='); // empty string
expectType<string, HTTPRequestMethod>('!<='); // generic string

// Test the exact type composition
expectType<
  HTTPRequestMethod,
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE'
>('=');

// Test safe vs unsafe method categorization
type SafeMethods = Extract<HTTPRequestMethod, 'GET' | 'HEAD' | 'OPTIONS'>;
type UnsafeMethods = Exclude<HTTPRequestMethod, SafeMethods>;

expectType<SafeMethods, 'GET' | 'HEAD' | 'OPTIONS'>('=');
expectType<
  UnsafeMethods,
  'CONNECT' | 'DELETE' | 'PATCH' | 'POST' | 'PUT' | 'TRACE'
>('=');

// Test idempotent vs non-idempotent method categorization
type IdempotentMethods = Extract<
  HTTPRequestMethod,
  'GET' | 'HEAD' | 'OPTIONS' | 'PUT' | 'DELETE'
>;
type NonIdempotentMethods = Extract<HTTPRequestMethod, 'POST' | 'PATCH'>;
type SpecialMethods = Extract<HTTPRequestMethod, 'CONNECT' | 'TRACE'>;

expectType<IdempotentMethods, 'GET' | 'HEAD' | 'OPTIONS' | 'PUT' | 'DELETE'>(
  '=',
);
expectType<NonIdempotentMethods, 'POST' | 'PATCH'>('=');
expectType<SpecialMethods, 'CONNECT' | 'TRACE'>('=');

// Test methods that typically carry request bodies
type MethodsWithBody = Extract<HTTPRequestMethod, 'POST' | 'PUT' | 'PATCH'>;
type MethodsWithoutBody = Exclude<HTTPRequestMethod, MethodsWithBody>;

expectType<MethodsWithBody, 'POST' | 'PUT' | 'PATCH'>('=');
expectType<
  MethodsWithoutBody,
  'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'TRACE'
>('=');

// Test conditional types using HTTPRequestMethod
type IsGET<T> = T extends 'GET' ? true : false;
type IsPOST<T> = T extends 'POST' ? true : false;
type IsWriteMethod<T> = T extends 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  ? true
  : false;

expectType<IsGET<'GET'>, true>('=');
expectType<IsGET<'POST'>, false>('=');
expectType<IsPOST<'POST'>, true>('=');
expectType<IsPOST<'GET'>, false>('=');
expectType<IsWriteMethod<'POST'>, true>('=');
expectType<IsWriteMethod<'PUT'>, true>('=');
expectType<IsWriteMethod<'GET'>, false>('=');

// Test usage in interface definitions
type RequestConfig = {
  method: HTTPRequestMethod;
  url: string;
  data?: unknown;
};

// Test that the interface accepts valid methods
const _validConfig1: RequestConfig = { method: 'GET', url: '/api' };
const _validConfig2: RequestConfig = {
  method: 'POST',
  url: '/api',
  data: { name: 'test' },
};

// These should be valid assignments (testing type compatibility)
expectType<typeof _validConfig1.method, HTTPRequestMethod>('<=');
expectType<typeof _validConfig2.method, HTTPRequestMethod>('<=');
