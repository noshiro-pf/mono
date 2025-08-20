import { type Rect } from '@noshiro/ts-utils-additional';
import { createElement } from 'preact';
import {
  inTurnColor,
  playerNameRectPadding,
  playerNameRectSize,
  zIndex,
} from '../../constants';
import { LoadingDots } from '../styled';

type Props = Readonly<{
  playerName: string | undefined;
  rotate: 0 | 90 | 180 | 270;
  isInTurn: boolean;
  windowSize: Rect;
  onBoundingClientRectChange: (rect: Readonly<DOMRect>) => void;
}>;

export const PlayerName = memoNamed<Props>(
  'PlayerName',
  ({
    playerName,
    rotate,
    isInTurn,
    windowSize,
    onBoundingClientRectChange,
  }) => {
    const rotateStyle = useMemo(
      () =>
        ({
          transform: `rotate(${rotate}deg)`,
        }) as const satisfies preact.JSX.CSSProperties,
      [rotate],
    );

    const nameStyle = useMemo(
      () =>
        ({
          width: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
          height: `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
          backgroundColor: isInTurn ? inTurnColor : undefined,
        }) as const satisfies preact.JSX.CSSProperties,
      [isInTurn],
    );

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = ref.current;
      if (el !== null) {
        onBoundingClientRectChange(el.getBoundingClientRect());
      }
    }, [windowSize, playerName, onBoundingClientRectChange]);

    return (
      <Wrapper>
        {createElement(
          isInTurn ? InTurnHighlighter : HighlighterBase,
          {
            style: rotateStyle,
          },
          <div ref={ref}>
            <Name style={nameStyle}>{playerName ?? <LoadingDots />}</Name>
          </div>,
        )}
      </Wrapper>
    );
  },
);

const Wrapper = styled('div')`
  color: white;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const HighlighterBase = styled('div')`
  z-index: ${zIndex.playerName};
`;

const InTurnHighlighter = styled(HighlighterBase)`
  margin: 10px;
  border-radius: 30px;
`;

const Name = styled('div')`
  font-size: 18px;
  font-weight: bold;
  background-color: #3d3d3d;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
