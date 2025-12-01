import { isRight } from 'fp-ts/Either';
import * as t from 'io-ts';

const A = t.type({
  A: t.union([t.number, t.undefined, t.null]),
});

const B = t.type({
  B: t.union([t.number, t.undefined, t.null]),
});

const C = t.partial({
  C: t.union([t.number, t.null]),
});

// ❌ Case 1: Union decode adds unexpected fields
{
  const UnionBA = t.union([B, A]);

  const res = UnionBA.decode({ A: 1 });

  if (isRight(res)) {
    const expected = { A: 1 };

    assert.notDeepEqual(res.right, expected); // NG

    const actual = { A: 1, B: undefined };

    assert.deepStrictEqual(res.right, actual);

    assert.isTrue(A.is(res.right)); // ok

    assert.isTrue(B.is(res.right)); // NG (expected: false)
  }
}

// ❌ Case 2: Union decode produces inconsistent results
{
  const UnionCA = t.union([C, A]);

  const res = UnionCA.decode({ A: 1 });

  if (isRight(res)) {
    const expected = {};

    assert.notDeepEqual(res.right, expected); // NG

    const actual = { A: 1 };

    assert.deepStrictEqual(res.right, actual);

    assert.isTrue(A.is(res.right)); // ok

    assert.isTrue(C.is(res.right)); // ok
  }
}
