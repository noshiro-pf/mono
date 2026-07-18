import { Num } from 'ts-data-forge';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('main', () => {
    // Basic conversions
    assert.isTrue(Num.from('123') === 123);

    assert.isTrue(Number.isNaN(Num.from('abc')));

    // Range checking
    const inRange = Num.isInRange(0, 10);

    assert.isTrue(inRange(5));

    assert.isTrue(inRange(0)); // (inclusive lower bound)

    assert.isFalse(inRange(10)); // (exclusive upper bound)

    // Clamping values
    const clamp = Num.clamp(0, 100);

    assert.isTrue(clamp(150) === 100);

    assert.isTrue(clamp(-10) === 0);

    // Rounding utilities
    const round2 = Num.round(2);

    assert.isTrue(round2(3.141_59) === 3.14);

    assert.isTrue(Num.roundAt(3.141_59, 3) === 3.142);

    assert.isTrue(Num.roundToInt(3.7) === 4);

    // Type guards
    const value = 5; // example value

    if (Num.isNonZero(value)) {
      // value is guaranteed to be non-zero
      const result = Num.div(10, value); // Safe division

      assert.isTrue(result === 2);
    }

    // embed-sample-code-ignore-below
  });
}
