import { describe, expect, test } from 'vitest';
import {
  answerSelectionDefaultValue,
  fillAnswerSelection,
  isAnswerSelection,
} from './answer-selection.mjs';

describe('isAnswerSelection', () => {
  test('defaultValue should be true', () => {
    expect(isAnswerSelection(answerSelectionDefaultValue)).toBe(true);
  });
});

describe('fillAnswerSelection', () => {
  test('defaultValue should be true', () => {
    expect(fillAnswerSelection({})).toStrictEqual(answerSelectionDefaultValue);
  });
});
