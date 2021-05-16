import { memoNamed } from '@noshiro/preact-utils';
import type { RectSize } from '@noshiro/ts-utils';
import type { CardColor } from '../../types/card-color';
import type { CardNumber } from '../../types/card-number';
import { Card0 } from './sub/card-0';
import { Card1 } from './sub/card-1';
import { Card10 } from './sub/card-10';
import { Card11 } from './sub/card-11';
import { Card2 } from './sub/card-2';
import { Card3 } from './sub/card-3';
import { Card4 } from './sub/card-4';
import { Card5 } from './sub/card-5';
import { Card6 } from './sub/card-6';
import { Card7 } from './sub/card-7';
import { Card8 } from './sub/card-8';
import { Card9 } from './sub/card-9';
import { CardEmpty } from './sub/card-empty';

type Props = Readonly<{
  color: CardColor;
  number: CardNumber;
  faceUp: boolean;
  size?: Partial<RectSize>;
  visibleToMe: boolean;
}>;

export const Card = memoNamed(
  'Card',
  ({ color, number, faceUp, size, visibleToMe }: Props) => {
    if (!faceUp && !visibleToMe) return <CardEmpty color={color} />;
    switch (number) {
      case 0:
        return <Card0 color={color} visibleToMe={visibleToMe} size={size} />;
      case 1:
        return <Card1 color={color} visibleToMe={visibleToMe} size={size} />;
      case 2:
        return <Card2 color={color} visibleToMe={visibleToMe} size={size} />;
      case 3:
        return <Card3 color={color} visibleToMe={visibleToMe} size={size} />;
      case 4:
        return <Card4 color={color} visibleToMe={visibleToMe} size={size} />;
      case 5:
        return <Card5 color={color} visibleToMe={visibleToMe} size={size} />;
      case 6:
        return <Card6 color={color} visibleToMe={visibleToMe} size={size} />;
      case 7:
        return <Card7 color={color} visibleToMe={visibleToMe} size={size} />;
      case 8:
        return <Card8 color={color} visibleToMe={visibleToMe} size={size} />;
      case 9:
        return <Card9 color={color} visibleToMe={visibleToMe} size={size} />;
      case 10:
        return <Card10 color={color} visibleToMe={visibleToMe} size={size} />;
      case 11:
        return <Card11 color={color} visibleToMe={visibleToMe} size={size} />;
    }
  }
);
