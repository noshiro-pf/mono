import { describe, expect, test } from 'vitest';
import { dict } from './dictionary';

describe('dict', () => {
  test('dict', () => {
    expect(typeof dict).toBe('object');
  });
});
