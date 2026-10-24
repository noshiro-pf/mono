import { formatYen, parseNumberInput } from './format.mjs';

describe(parseNumberInput, () => {
  test('数値として読める文字列はその値になること', () => {
    assert.strictEqual(parseNumberInput('7500'), 7500);

    assert.strictEqual(parseNumberInput(' 0.7 '), 0.7);
  });

  test('空文字や数値でない文字列は 0 になること', () => {
    assert.strictEqual(parseNumberInput(''), 0);

    assert.strictEqual(parseNumberInput('abc'), 0);

    assert.strictEqual(parseNumberInput('Infinity'), 0);
  });
});

describe(formatYen, () => {
  test('円未満を四捨五入し、桁区切りを付けること', () => {
    assert.strictEqual(formatYen(179_189.774), '179,190 円');
  });
});
