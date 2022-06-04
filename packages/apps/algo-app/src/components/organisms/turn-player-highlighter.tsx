import type { Rect } from '@noshiro/ts-utils-additional';
import { inTurnColor, playerNameRectPadding, zIndex } from '../../constants';

type Props = Readonly<{
  position: Rect;
}>;

export const TurnPlayerHighlighter = memoNamed<Props>(
  'TurnPlayerHighlighter',
  ({ position }) => (
    <Rectangle
      style={{
        top: `${position.top - playerNameRectPadding}px`,
        left: `${position.left - playerNameRectPadding}px`,
        width: `${position.width + 2 * playerNameRectPadding}px`,
        height: `${position.height + 2 * playerNameRectPadding}px`,
      }}
    />
  )
);

const Rectangle = styled('div')`
  position: absolute;
  padding: 10px;
  border-radius: 30px;
  background-color: ${inTurnColor};
  z-index: ${zIndex.playerNameHighlighter};
  transition: all 0.6s ease 0s;
`;
