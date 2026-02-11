import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { templateLiteral } from './template-literal.mjs';

describe(templateLiteral, () => {
  describe('path string', () => {
    type PathString = `/${string}`;

    const PathString = templateLiteral<PathString>({
      defaultValue: '/' as PathString,
      is: (value): value is PathString =>
        typeof value === 'string' && value.startsWith('/'),
      typeName: 'PathString',
    });

    expectType<TypeOf<typeof PathString>, PathString>('=');

    test('validates path strings correctly', () => {
      assert.isTrue(PathString.is('/'));

      assert.isTrue(PathString.is('/users'));

      assert.isTrue(PathString.is('/users/123'));

      assert.isTrue(PathString.is('/api/v1/users'));
    });

    test('rejects invalid path strings', () => {
      assert.isFalse(PathString.is('users'));

      assert.isFalse(PathString.is(''));

      assert.isFalse(PathString.is('users/123'));

      assert.isFalse(PathString.is(123));

      assert.isFalse(PathString.is(null));

      assert.isFalse(PathString.is(undefined));
    });

    test('defaultValue', () => {
      expect(PathString.defaultValue).toBe('/');
    });

    test('fill with valid value', () => {
      const result = PathString.fill('/users');

      expect(result).toBe('/users');
    });

    test('fill with invalid value returns default', () => {
      const result = PathString.fill('users');

      expect(result).toBe('/');
    });

    test('cast valid value', () => {
      const result = PathString.cast('/users');

      expect(result).toBe('/users');
    });

    test('cast invalid value throws', () => {
      expect(() => PathString.cast('users')).toThrowError(
        'expected <PathString>',
      );
    });
  });

  describe('http url', () => {
    type HttpUrl = `http://${string}` | `https://${string}`;

    const HttpUrl = templateLiteral<HttpUrl>({
      is: (value): value is HttpUrl =>
        typeof value === 'string' &&
        (value.startsWith('http://') || value.startsWith('https://')) &&
        value.length > 8,
      typeName: 'HttpUrl',
      defaultValue: 'https://example.com' as HttpUrl,
    });

    expectType<TypeOf<typeof HttpUrl>, HttpUrl>('=');

    test('validates http/https urls', () => {
      assert.isTrue(HttpUrl.is('http://example.com'));

      assert.isTrue(HttpUrl.is('https://example.com'));

      assert.isTrue(HttpUrl.is('http://localhost:3000'));

      assert.isTrue(HttpUrl.is('https://api.example.com/v1/users'));
    });

    test('rejects non-http urls', () => {
      assert.isFalse(HttpUrl.is('ftp://example.com'));

      assert.isFalse(HttpUrl.is('ws://example.com'));

      assert.isFalse(HttpUrl.is('example.com'));

      assert.isFalse(HttpUrl.is('http://'));

      assert.isFalse(HttpUrl.is('https://'));
    });

    test('defaultValue', () => {
      expect(HttpUrl.defaultValue).toBe('https://example.com');
    });
  });

  describe('version string', () => {
    type Semver = `${number}.${number}.${number}`;

    const Semver = templateLiteral<Semver>({
      typeName: 'Semver',
      is: (value): value is Semver =>
        typeof value === 'string' && /^\d+\.\d+\.\d+$/u.test(value),
      defaultValue: '0.0.0' as Semver,
    });

    expectType<TypeOf<typeof Semver>, Semver>('=');

    test('validates version strings', () => {
      assert.isTrue(Semver.is('0.0.0'));

      assert.isTrue(Semver.is('1.2.3'));

      assert.isTrue(Semver.is('10.20.30'));

      assert.isTrue(Semver.is('999.999.999'));
    });

    test('rejects invalid version strings', () => {
      assert.isFalse(Semver.is('1.2'));

      assert.isFalse(Semver.is('1.2.3.4'));

      assert.isFalse(Semver.is('1.2.a'));

      assert.isFalse(Semver.is('v1.2.3'));

      assert.isFalse(Semver.is('1.2.3-alpha'));
    });

    test('defaultValue', () => {
      expect(Semver.defaultValue).toBe('0.0.0');
    });
  });

  describe('hex color', () => {
    type HexColor = `#${string}`;

    const HexColor = templateLiteral<HexColor>({
      is: (value): value is HexColor =>
        typeof value === 'string' && /^#[\da-f]{6}$/iu.test(value),
      typeName: 'HexColor',
      defaultValue: '#000000' as HexColor,
    });

    expectType<TypeOf<typeof HexColor>, HexColor>('=');

    test('validates hex colors', () => {
      assert.isTrue(HexColor.is('#000000'));

      assert.isTrue(HexColor.is('#ffffff'));

      assert.isTrue(HexColor.is('#FFFFFF'));

      assert.isTrue(HexColor.is('#ff0000'));

      assert.isTrue(HexColor.is('#00ff00'));

      assert.isTrue(HexColor.is('#0000ff'));
    });

    test('rejects invalid hex colors', () => {
      assert.isFalse(HexColor.is('#fff'));

      assert.isFalse(HexColor.is('#gggggg'));

      assert.isFalse(HexColor.is('ffffff'));

      assert.isFalse(HexColor.is('#'));

      assert.isFalse(HexColor.is('#12345'));

      assert.isFalse(HexColor.is('#1234567'));
    });

    test('defaultValue', () => {
      expect(HexColor.defaultValue).toBe('#000000');
    });
  });

  describe('email prefix', () => {
    type EmailPrefix = `${string}@`;

    const EmailPrefix = templateLiteral<EmailPrefix>({
      is: (value): value is EmailPrefix =>
        typeof value === 'string' &&
        value.endsWith('@') &&
        value.length > 1 &&
        !value.includes('@@'),
      typeName: 'EmailPrefix',
      defaultValue: 'user@' as EmailPrefix,
    });

    expectType<TypeOf<typeof EmailPrefix>, EmailPrefix>('=');

    test('validates email prefixes', () => {
      assert.isTrue(EmailPrefix.is('user@'));

      assert.isTrue(EmailPrefix.is('admin@'));

      assert.isTrue(EmailPrefix.is('test.user@'));

      assert.isTrue(EmailPrefix.is('user+tag@'));
    });

    test('rejects invalid email prefixes', () => {
      assert.isFalse(EmailPrefix.is('@'));

      assert.isFalse(EmailPrefix.is('user'));

      assert.isFalse(EmailPrefix.is('user@domain.com'));

      assert.isFalse(EmailPrefix.is('user@@'));
    });

    test('defaultValue', () => {
      expect(EmailPrefix.defaultValue).toBe('user@');
    });
  });

  describe('without default value', () => {
    type CustomString = `custom-${string}`;

    const CustomString = templateLiteral<CustomString>({
      defaultValue: 'custom-',
      is: (value): value is CustomString =>
        typeof value === 'string' && value.startsWith('custom-'),
      typeName: 'CustomString',
    });

    test('uses empty string as default', () => {
      expect(CustomString.defaultValue).toBe('custom-');
    });

    test('fill with invalid value returns empty string', () => {
      const result = CustomString.fill('invalid');

      expect(result).toBe('custom-');
    });
  });

  describe('custom error message', () => {
    type CustomString = `prefix-${string}`;

    const CustomString = templateLiteral<CustomString>({
      is: (value): value is CustomString =>
        typeof value === 'string' && value.startsWith('prefix-'),
      typeName: 'CustomString',
      defaultValue: 'prefix-default' as CustomString,
    });

    test('uses pattern in error message', () => {
      const result = CustomString.validate('invalid');

      assert.isFalse(Result.isOk(result));

      if (!Result.isErr(result)) {
        throw new Error('Expected error result');
      }

      const details = result.value[0]?.details;

      if (details?.kind !== 'template-literal') {
        throw new Error('Expected template-literal error');
      }
    });
  });

  describe('edge cases', () => {
    type EdgeCase = `start${string}end`;

    const EdgeCase = templateLiteral<EdgeCase>({
      is: (value): value is EdgeCase =>
        typeof value === 'string' &&
        value.startsWith('start') &&
        value.endsWith('end'),
      typeName: 'EdgeCase',
      defaultValue: 'startend' as EdgeCase,
    });

    test('validates minimum matching string', () => {
      assert.isTrue(EdgeCase.is('startend'));

      assert.isTrue(EdgeCase.is('start-end'));

      assert.isTrue(EdgeCase.is('start_middle_end'));
    });

    test('rejects strings not matching pattern', () => {
      assert.isFalse(EdgeCase.is('start'));

      assert.isFalse(EdgeCase.is('end'));

      assert.isFalse(EdgeCase.is('middle'));

      assert.isFalse(EdgeCase.is('endstart'));
    });
  });
});
