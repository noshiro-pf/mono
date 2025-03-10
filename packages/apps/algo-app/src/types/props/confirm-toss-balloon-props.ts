import { type Rect } from '@noshiro/ts-utils-additional';
import { type Card } from '../card-type';

export type ConfirmTossBalloonProps = Readonly<{
  anchorCardRect: Rect;
  card: Card;
  cancel: () => void;
  submit: () => void;
}>;
