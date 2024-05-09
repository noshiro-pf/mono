import { describe, expect, test } from 'vitest';
import {
  eventListItemDefaultValue,
  fillEventListItem,
  isEventListItem,
} from './event-list-item.mjs';

describe('isEventListItem', () => {
  test('defaultValue should be true', () => {
    expect(isEventListItem(eventListItemDefaultValue)).toBe(true);
  });
});

describe('fillEventListItem', () => {
  test('defaultValue should be true', () => {
    expect(fillEventListItem({})).toStrictEqual(eventListItemDefaultValue);
  });
});
