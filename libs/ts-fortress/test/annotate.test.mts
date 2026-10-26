import { asUint16, expectType, Result } from 'ts-data-forge';
import * as t from '../src/index.mjs';

describe(t.annotate, () => {
  test('adds annotations and leaves the type it is given alone', () => {
    const base = t.string('a');

    const Name = t.annotate(base, {
      title: 'Name',
      description: 'What to call it.',
    });

    expectType<typeof Name, typeof base>('=');

    assert.deepStrictEqual(Name.annotations, {
      title: 'Name',
      description: 'What to call it.',
    });

    assert.isUndefined(base.annotations);
  });

  test('a key given again replaces the earlier value, and the rest stay', () => {
    const Port = t.annotate(
      t.annotate(t.uint16(80), { title: 'Port', description: 'old' }),
      { description: 'new', examples: [asUint16(8080)] },
    );

    assert.deepStrictEqual(Port.annotations, {
      title: 'Port',
      description: 'new',
      examples: [8080],
    });
  });

  test('does not change validation, fill, prune or the default value', () => {
    const base = t.strictRecord({ a: t.string('x'), b: t.number(1) });

    const Annotated = t.annotate(base, { description: 'A record.' });

    for (const value of [
      { a: '', b: 0 },
      { a: '' },
      { a: '', b: 0, c: 0 },
      1,
    ]) {
      assert.strictEqual(Annotated.is(value), base.is(value));

      assert.deepStrictEqual(Annotated.validate(value), base.validate(value));

      assert.deepStrictEqual(Annotated.fill(value), base.fill(value));
    }

    assert.deepStrictEqual(Annotated.prune({ a: '', b: 0 }), { a: '', b: 0 });

    assert.deepStrictEqual(Annotated.defaultValue, { a: 'x', b: 1 });

    assert.strictEqual(Annotated.shape, base.shape);

    assert.strictEqual(Annotated.structure, base.structure);
  });

  test('a format does not change what is valid', () => {
    const Email = t.annotate(t.string(), { format: 'email' });

    assert.isTrue(Email.is('not an e-mail address'));
  });

  test('keeps constraints', () => {
    const Name = t.annotate(t.string('ab', { minLength: 2 }), {
      description: 'At least two characters.',
    });

    assert.strictEqual(Name.constraints.minLength, 2);
  });

  test('does not evaluate a lazy default value', () => {
    const mut_calls: unknown[] = [];

    const Lazy = t.recursion('Lazy', () => {
      mut_calls.push(0);

      return t.string();
    });

    t.annotate(Lazy, { description: 'Resolved later.' });

    assert.deepStrictEqual(mut_calls, []);
  });

  describe('optional', () => {
    const inside = t.optional(t.annotate(t.string(), { description: 'd' }));

    const outside = t.annotate(t.optional(t.string()), { description: 'd' });

    test.each([
      ['inside', inside],
      ['outside', outside],
    ] as const)(
      'annotated %s optional, the member stays optional',
      (_, member) => {
        assert.isTrue(t.isOptionalProperty(member));

        assert.deepStrictEqual(member.annotations, { description: 'd' });

        const R = t.record({ a: member });

        assert.isTrue(R.is({}));

        assert.isTrue(Result.isOk(R.validate({ a: 'x' })));
      },
    );
  });

  test('uuid carries the uuid format', () => {
    assert.deepStrictEqual(t.uuid().annotations, { format: 'uuid' });

    assert.deepStrictEqual(t.uuidV7().annotations, { format: 'uuid' });
  });
});
