import { describe, expect, test } from 'vitest';
import {
  fillYearMonthDate,
  isDateEnum,
  isMonthEnum,
  isYearEnum,
  isYearMonthDate,
  yearMonthDateDefaultValue,
} from './year-month-date.mjs';

describe('isYearEnum', () => {
  test('true case', () => {
    expect(isYearEnum(1970)).toBe(true);
  });
  test('false case', () => {
    expect(isYearEnum(-3)).toBe(false);
  });
});

describe('isMonthEnum', () => {
  test('true case', () => {
    expect(isMonthEnum(12)).toBe(true);
  });
  test('false case', () => {
    expect(isMonthEnum(13)).toBe(false);
  });
});

describe('isDateEnum', () => {
  test('true case', () => {
    expect(isDateEnum(31)).toBe(true);
  });
  test('false case', () => {
    expect(isDateEnum(32)).toBe(false);
  });
});

describe('isYearMonthDate', () => {
  test('defaultValue should be true', () => {
    expect(isYearMonthDate(yearMonthDateDefaultValue)).toBe(true);
  });
});

describe('fillYearMonthDate', () => {
  test('defaultValue should be true', () => {
    expect(fillYearMonthDate({})).toStrictEqual(yearMonthDateDefaultValue);
  });
});
