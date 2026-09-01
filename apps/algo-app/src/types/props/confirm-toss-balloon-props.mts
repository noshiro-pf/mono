import { type Rect } from 'ts-utils-additional';
import { type Card } from '../card-type.mjs';

export type ConfirmTossBalloonProps = Readonly<{
  anchorCardRect: Rect;
  card: Card;
  cancel: () => void;
  submit: () => void;
}>;
