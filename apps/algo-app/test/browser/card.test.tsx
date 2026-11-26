import { createState } from 'synstate';
import { constant, render } from 'synstate-dom';
import { userEvent } from 'vitest/browser';
import {
  CardComponent,
  type CardDisplay,
} from '../../src/components/index.mjs';
import { outlineColorDef } from '../../src/constants/index.mjs';

// A card is a button: the keyboard reaches one that can be played and plays it
// with Enter, and its name says what the player can see of it, no more.

describe(CardComponent, () => {
  test('a clickable card is a button the keyboard plays with Enter', async () => {
    const mut_clicks = { count: 0 };

    const [card$] = createState<CardDisplay>(
      display({ visibilityFromMe: 'faceUp', isClickable: true }),
    );

    const { button, unmount } = mount(card$, () => {
      mut_clicks.count += 1;
    });

    assert.strictEqual(button.type, 'button');

    assert.isFalse(button.disabled);

    button.focus();

    assert.strictEqual(document.activeElement, button);

    await userEvent.keyboard('{Enter}');

    assert.strictEqual(mut_clicks.count, 1);

    unmount();
  });

  test('a card that cannot be played is disabled, and a click does nothing', async () => {
    const mut_clicks = { count: 0 };

    const [card$, setCard] = createState<CardDisplay>(
      display({ visibilityFromMe: 'faceUp', isClickable: false }),
    );

    const { button, unmount } = mount(card$, () => {
      mut_clicks.count += 1;
    });

    assert.isTrue(button.disabled);

    await userEvent.click(button, { force: true });

    assert.strictEqual(mut_clicks.count, 0);

    setCard(display({ visibilityFromMe: 'faceUp', isClickable: true }));

    assert.isFalse(button.disabled);

    unmount();
  });

  test('its name has the number only where the player sees it', () => {
    const [card$, setCard] = createState<CardDisplay>(
      display({ visibilityFromMe: 'faceUp' }),
    );

    const { button, unmount } = mount(card$, undefined);

    assert.strictEqual(button.getAttribute('aria-label'), '黒の 7');

    setCard(display({ visibilityFromMe: 'faceDownButVisibleToMe' }));

    assert.strictEqual(
      button.getAttribute('aria-label'),
      '黒の 7（伏せたカード）',
    );

    setCard(display({ visibilityFromMe: 'faceDownButVisibleToCounter' }));

    assert.strictEqual(button.getAttribute('aria-label'), '黒の伏せたカード');

    setCard(display({ visibilityFromMe: 'faceDown', color: 'white' }));

    assert.strictEqual(button.getAttribute('aria-label'), '白の伏せたカード');

    unmount();
  });
});

const display = (overrides: Partial<CardDisplay>): CardDisplay =>
  ({
    color: 'black',
    number: 7,
    visibilityFromMe: 'faceUp',
    float: 'never',
    showOutline: 'never',
    outlineColor: outlineColorDef.green,
    isClickable: false,
    ...overrides,
  }) as const;

const mount = (
  card$: ReturnType<typeof createState<CardDisplay>>[0],
  onClick: (() => void) | undefined,
): Readonly<{ button: HTMLButtonElement; unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const dispose = render(
    () => (
      <CardComponent
        card={card$}
        size={constant({ width: 40 })}
        onClick={onClick}
      />
    ),
    container,
  );

  const button = container.querySelector('button');

  assert.isNotNull(button);

  return {
    button,
    unmount: () => {
      dispose();

      container.remove();
    },
  };
};
