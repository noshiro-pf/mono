import {
  eventListItemDefaultValue,
  fillEventListItem,
  isEventListItem,
} from './event-list-item.mjs';

describe('isEventListItem', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isEventListItem(eventListItemDefaultValue));
  });
});

describe('fillEventListItem', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillEventListItem({}), eventListItemDefaultValue);
  });
});
