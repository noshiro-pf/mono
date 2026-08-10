import { range } from 'ts-data-forge';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('main', () => {
    // Traditional for loop using range
    const mut_values: number[] = [];

    for (const i of range(0, 5)) {
      mut_values.push(i);
    }

    assert.deepStrictEqual(mut_values, [0, 1, 2, 3, 4]);

    // Create arrays from ranges
    const numbers = Array.from(range(1, 4));

    const squares = Array.from(range(1, 6), (x) => x ** 2);

    assert.deepStrictEqual(numbers, [1, 2, 3]);

    assert.deepStrictEqual(squares, [1, 4, 9, 16, 25]);

    // Step ranges
    const mut_stepValues: number[] = [];

    for (const i of range(0, 10, 2)) {
      mut_stepValues.push(i);
    }

    assert.deepStrictEqual(mut_stepValues, [0, 2, 4, 6, 8]);

    // embed-sample-code-ignore-below
  });
}
