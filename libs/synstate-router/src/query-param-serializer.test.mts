import { param } from './define-routes.mjs';

describe('query parameter serializers', () => {
  describe('string', () => {
    const serializer = param.query.string();

    test('encode string', () => {
      assert.strictEqual(serializer.encode('hello'), 'hello');
    });

    test('encode undefined', () => {
      assert.strictEqual(serializer.encode(undefined), undefined);
    });

    test('decode string', () => {
      assert.strictEqual(serializer.decode('hello'), 'hello');
    });

    test('decode null (missing param)', () => {
      assert.strictEqual(serializer.decode(null), undefined);
    });
  });

  describe('number', () => {
    const serializer = param.query.number();

    test('encode number', () => {
      assert.strictEqual(serializer.encode(42), '42');
    });

    test('encode undefined', () => {
      assert.strictEqual(serializer.encode(undefined), undefined);
    });

    test('decode valid number string', () => {
      assert.strictEqual(serializer.decode('42'), 42);
    });

    test('decode invalid string returns undefined', () => {
      assert.strictEqual(serializer.decode('abc'), undefined);
    });

    test('decode null returns undefined', () => {
      assert.strictEqual(serializer.decode(null), undefined);
    });
  });

  describe('number with default', () => {
    const serializer = param.query.number({ default: 1 });

    test('decode null returns default', () => {
      assert.strictEqual(serializer.decode(null), 1);
    });

    test('decode valid string returns parsed number', () => {
      assert.strictEqual(serializer.decode('5'), 5);
    });

    test('decode invalid string returns default', () => {
      assert.strictEqual(serializer.decode('abc'), 1);
    });
  });

  describe('boolean', () => {
    const serializer = param.query.boolean();

    test('encode true', () => {
      assert.strictEqual(serializer.encode(true), '1');
    });

    test('encode false', () => {
      assert.strictEqual(serializer.encode(false), '0');
    });

    test('encode undefined', () => {
      assert.strictEqual(serializer.encode(undefined), undefined);
    });

    test('decode "1"', () => {
      assert.strictEqual(serializer.decode('1'), true);
    });

    test('decode "0"', () => {
      assert.strictEqual(serializer.decode('0'), false);
    });

    test('decode "true"', () => {
      assert.strictEqual(serializer.decode('true'), true);
    });

    test('decode "false"', () => {
      assert.strictEqual(serializer.decode('false'), false);
    });

    test('decode null', () => {
      assert.strictEqual(serializer.decode(null), undefined);
    });
  });

  describe('boolean with default', () => {
    const serializer = param.query.boolean({ default: false });

    test('decode null returns default', () => {
      assert.strictEqual(serializer.decode(null), false);
    });

    test('decode "1" returns true', () => {
      assert.strictEqual(serializer.decode('1'), true);
    });
  });

  describe('stringArray', () => {
    const serializer = param.query.stringArray();

    test('encode array', () => {
      assert.strictEqual(serializer.encode(['a', 'b', 'c']), 'a,b,c');
    });

    test('encode empty array', () => {
      assert.strictEqual(serializer.encode([]), undefined);
    });

    test('encode undefined', () => {
      assert.strictEqual(serializer.encode(undefined), undefined);
    });

    test('decode comma-separated string', () => {
      assert.deepStrictEqual(serializer.decode('a,b,c'), ['a', 'b', 'c']);
    });

    test('decode single value', () => {
      assert.deepStrictEqual(serializer.decode('a'), ['a']);
    });

    test('decode null', () => {
      assert.strictEqual(serializer.decode(null), undefined);
    });

    test('decode empty string', () => {
      assert.strictEqual(serializer.decode(''), undefined);
    });
  });
});
