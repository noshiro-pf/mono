import { Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
} from '../utils/index.mjs';

/**
 * Creates a type validator for template literal string types.
 *
 * @template T - The template literal string type to validate
 * @param options - Configuration object
 * @param options.is - A type guard function that validates the template literal format
 * @param options.typeName - A descriptive name for the type (e.g., 'PathString', 'UrlString')
 * @param options.defaultValue - Default value for the type
 *
 * @returns A Type validator for the template literal string type
 *
 * @example
 * // Path string starting with /
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type PathString = `/${string}`;
 *
 * const PathString = t.templateLiteral<PathString>({
 *   is: (value: unknown): value is PathString =>
 *     typeof value === 'string' && value.startsWith('/'),
 *   typeName: 'PathString',
 *   defaultValue: '/' as PathString,
 * });
 *
 * assert.isTrue(PathString.is('/users'));
 *
 * assert.isTrue(PathString.is('/users/123'));
 *
 * assert.isFalse(PathString.is('users'));
 * ```
 *
 * @example
 * // URL string starting with http:// or https://
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type HttpUrl = `http://${string}` | `https://${string}`;
 *
 * const HttpUrl = t.templateLiteral<HttpUrl>({
 *   is: (value: unknown): value is HttpUrl =>
 *     typeof value === 'string' &&
 *     (value.startsWith('http://') || value.startsWith('https://')) &&
 *     value.length > 7,
 *   typeName: 'HttpUrl',
 *   defaultValue: 'https://example.com' as HttpUrl,
 * });
 *
 * assert.isTrue(HttpUrl.is('https://example.com'));
 *
 * assert.isTrue(HttpUrl.is('http://example.com'));
 *
 * assert.isFalse(HttpUrl.is('ftp://example.com'));
 * ```
 *
 * @example
 * // Version string like 1.2.3
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type SemVer = `${number}.${number}.${number}`;
 *
 * const SemVer = t.templateLiteral<SemVer>({
 *   is: (value: unknown): value is SemVer =>
 *     typeof value === 'string' && /^\d+\.\d+\.\d+$/u.test(value),
 *   typeName: 'SemVer',
 *   defaultValue: '0.0.0' as SemVer,
 * });
 *
 * assert.isTrue(SemVer.is('1.2.3'));
 *
 * assert.isTrue(SemVer.is('10.20.30'));
 *
 * assert.isFalse(SemVer.is('1.2'));
 *
 * assert.isFalse(SemVer.is('1.2.3.4'));
 * ```
 */
export const templateLiteral = <T extends string>({
  defaultValue,
  is,
  typeName,
}: Readonly<{
  is: (value: unknown) => value is T;
  typeName: string;
  defaultValue: T;
}>): Type<T> => {
  const validate: Type<T>['validate'] = (a) => {
    if (!is(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: { kind: 'template-literal' },
        }),
      ]);
    }

    return Result.ok(a);
  };

  const fill: Type<T>['fill'] = (a) => {
    const result = validate(a);

    if (Result.isOk(result)) {
      return result.value;
    }

    return defaultValue;
  };

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFn<T>(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
