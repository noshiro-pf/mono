import { expectType } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { outlineColorDef, type CustomColor } from '../../constants/index.mjs';
import type {
  Card,
  CardColor,
  CardNumber,
  VisibilityFromMe,
} from '../../types/index.mjs';

/**
 * A card drawn face up and standing still, as everywhere but the table draws
 * one; `overrides` sets how it answers a click and whether it is outlined.
 */
export const faceUpCard = (
  card: Card,
  overrides?: Partial<
    StrictPick<CardDisplay, 'isClickable' | 'outlineColor' | 'showOutline'>
  >,
): CardDisplay =>
  ({
    color: card.color,
    number: card.number,
    visibilityFromMe: 'faceUp',
    float: 'never',
    showOutline: 'never',
    outlineColor: outlineColorDef.green,
    isClickable: false,
    ...overrides,
  }) as const;

/** `display` without what it carries beyond how the card is drawn. */
export const toCardDisplay = (display: CardDisplay): CardDisplay =>
  ({
    color: display.color,
    number: display.number,
    visibilityFromMe: display.visibilityFromMe,
    float: display.float,
    showOutline: display.showOutline,
    outlineColor: display.outlineColor,
    isClickable: display.isClickable,
  }) as const;

/**
 * Whether two displays draw the same card the same way: the `equals` of a `map`
 * to a display, so that an update that changes nothing on the card redraws
 * nothing.
 */
export const isSameCardDisplay = (a: CardDisplay, b: CardDisplay): boolean =>
  cardDisplayKeys.every((key) => a[key] === b[key]);

/** What a card shows: which card it is and how it is drawn. */
export type CardDisplay = Readonly<{
  color: CardColor;
  number: CardNumber;
  visibilityFromMe: VisibilityFromMe;
  float: 'always' | 'never' | 'onHover';
  showOutline: 'always' | 'never' | 'onHover';
  outlineColor: CustomColor;
  isClickable: boolean;
}>;

/** Every field of `CardDisplay`, which `isSameCardDisplay` compares. */
const cardDisplayKeys = [
  'color',
  'number',
  'visibilityFromMe',
  'float',
  'showOutline',
  'outlineColor',
  'isClickable',
] as const;

// A field added to `CardDisplay` and not listed above fails here.
expectType<(typeof cardDisplayKeys)[number], keyof CardDisplay>('=');
