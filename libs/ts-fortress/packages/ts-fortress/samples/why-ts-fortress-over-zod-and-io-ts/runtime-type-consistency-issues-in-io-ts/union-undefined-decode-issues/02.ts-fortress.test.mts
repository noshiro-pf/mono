import * as t from 'ts-fortress';

// ✅ Complex union types work reliably without unexpected behavior
const A = t.record({
  A: t.union([t.number(), t.undefinedType, t.nullType]),
});

const B = t.record({
  B: t.union([t.number(), t.undefinedType, t.nullType]),
});

const C = t.partial(
  t.record({
    C: t.union([t.number(), t.nullType]),
  }),
);

// ✅ Case 1: Union validation is predictable and correct
{
  const UnionBA = t.union([B, A]);

  const result = UnionBA.validate({ A: 1 });

  if (t.Result.isOk(result)) {
    assert.deepStrictEqual(result.value, { A: 1 }); // Correct! No unexpected fields

    assert.isTrue(A.is(result.value)); // Correct

    assert.isFalse(B.is(result.value)); // Correct! B requires field B
  }
}

// ✅ Case 2: Consistent validation behavior
{
  const UnionCA = t.union([C, A]);

  const result = UnionCA.validate({ A: 1 });

  if (t.Result.isOk(result)) {
    assert.deepStrictEqual(result.value, { A: 1 }); // Correct and consistent

    assert.isTrue(A.is(result.value)); // Correct

    assert.isTrue(C.is(result.value)); // Consistent! ts-fortress partial types allow extra fields
  }
}
