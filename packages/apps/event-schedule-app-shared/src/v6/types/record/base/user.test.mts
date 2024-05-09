import { describe, expect, test } from 'vitest';
import { fillUser, isUser, userDefaultValue } from './user.mjs';

describe('isUser', () => {
  test('defaultValue should be true', () => {
    expect(isUser(userDefaultValue)).toBe(true);
  });
});

describe('fillUser', () => {
  test('defaultValue should be true', () => {
    expect(fillUser({})).toStrictEqual(userDefaultValue);
  });
});
