import { outlineColorDef } from '../../constants/index.mjs';
import {
  faceUpCard,
  isSameCardDisplay,
  toCardDisplay,
  type CardDisplay,
} from './card-display.mjs';

describe(faceUpCard, () => {
  test('draws the card face up, still and not clickable unless told otherwise', () => {
    assert.deepStrictEqual(faceUpCard({ color: 'black', number: 3 }), {
      color: 'black',
      number: 3,
      visibilityFromMe: 'faceUp',
      float: 'never',
      showOutline: 'never',
      outlineColor: outlineColorDef.green,
      isClickable: false,
    });

    assert.isTrue(
      faceUpCard({ color: 'white', number: 0 }, { isClickable: true })
        .isClickable,
    );
  });
});

describe(isSameCardDisplay, () => {
  const base = faceUpCard({ color: 'black', number: 3 });

  test('is true for an equal display', () => {
    assert.isTrue(isSameCardDisplay(base, { ...base }));
  });

  // One value per field, unlike `base`'s; a field added to `CardDisplay` and
  // not here is a type error.
  const changed: CardDisplay = {
    color: 'white',
    number: 4,
    visibilityFromMe: 'faceDown',
    float: 'always',
    showOutline: 'always',
    outlineColor: outlineColorDef.red,
    isClickable: true,
  } as const;

  test.each(Object.entries(changed))('compares %s', (key, value) => {
    assert.isFalse(isSameCardDisplay(base, { ...base, [key]: value }));
  });

  test('ignores what toCardDisplay drops, such as a new click handler', () => {
    const withHandler = { ...base, onClick: () => {} } as const;

    assert.isTrue(isSameCardDisplay(base, withHandler));

    assert.deepStrictEqual(toCardDisplay(withHandler), base);
  });
});
