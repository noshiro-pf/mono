import { expectType } from 'ts-data-forge';
import type { useState } from '../src/index.mjs';

describe('types', () => {
  test('the setters are named, and resetState takes nothing', () => {
    expectType<
      ReturnType<typeof useState<number>>[2],
      Readonly<{
        updateState: (updateFn: (v: number) => number) => void;
        resetState: () => void;
      }>
    >('=');
  });
});
