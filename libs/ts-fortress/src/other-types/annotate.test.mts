import { number } from '../primitives/index.mjs';
import { optional } from '../record/index.mjs';
import { annotate } from './annotate.mjs';

// The other tests of `annotate` are in `test/annotate.test.mts`; this one sits
// beside the prototype tests of the other type copies (`optional`, `required`,
// `attachConstraints`, `withStructure`).
describe(annotate, () => {
  test('keeps the members a type inherits through its prototype', () => {
    const base = number(0);

    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    const inherited = Object.create(base) as typeof base;

    const annotated = annotate(optional(inherited), { title: 'x' });

    assert.isTrue(annotated.is(1));

    assert.isFalse(annotated.is('a'));

    assert.strictEqual(annotated.typeName, 'number');

    assert.strictEqual(annotated.annotations?.title, 'x');
  });
});
