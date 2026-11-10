import { isPartial } from './is-partial.mjs';

describe(isPartial, () => {
  // As discord.js defines `Message`: `partial` is a getter on the prototype,
  // never an own property.
  class Message {
    readonly content: string | null;

    constructor(content: string | null) {
      this.content = content;
    }

    get partial(): boolean {
      return typeof this.content !== 'string';
    }
  }

  test('reads partial from a prototype getter, as discord.js defines it', () => {
    assert.isTrue(isPartial(new Message(null)));
  });

  test('is false for a complete message', () => {
    assert.isFalse(isPartial(new Message('/rp title')));
  });

  test('reads an own partial property', () => {
    assert.isTrue(isPartial({ partial: true }));

    assert.isFalse(isPartial({ partial: 'true' }));
  });

  test('is false for a value with no partial', () => {
    assert.isFalse(isPartial({}));

    assert.isFalse(isPartial(null));

    assert.isFalse(isPartial(undefined));

    assert.isFalse(isPartial('partial'));
  });
});
