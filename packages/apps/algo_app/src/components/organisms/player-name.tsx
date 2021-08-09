import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { Rect, RectSize } from '@noshiro/ts-utils';
import { match } from '@noshiro/ts-utils';
import { createElement, Fragment } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { inTurnColor, zIndex } from '../../constants';

type Props = Readonly<{
  playerName: string;
  rotate: 0 | 90 | 180 | 270;
  isInTurn: boolean;
  windowSize: Rect;
  onBoundingClientRectChange: (rect: Readonly<DOMRect>) => void;
}>;

export const playerNameRectSize: RectSize = { width: 150, height: 65 };
export const playerNameRectPadding = 10;

export const PlayerName = memoNamed<Props>(
  'PlayerName',
  ({
    playerName,
    rotate,
    isInTurn,
    windowSize,
    onBoundingClientRectChange,
  }) => {
    const rotateStyle = useMemo<JSXInternal.CSSProperties>(
      () =>
        match(rotate, {
          0: {
            width: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
            height: `${
              playerNameRectSize.height - 2 * playerNameRectPadding
            }px`,
          },
          90: {
            writingMode: 'vertical-rl',
            textOrientation: 'sideways',
            width: `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
            height: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
          },
          180: {
            transform: `rotate(180deg)`,
            width: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
            height: `${
              playerNameRectSize.height - 2 * playerNameRectPadding
            }px`,
          },
          270: {
            writingMode: 'vertical-rl',
            textOrientation: 'sideways',
            transform: `rotate(180deg)`,
            width: `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
            height: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
          },
        }),
      [rotate]
    );

    const styleMerged = useMemo<JSXInternal.CSSProperties>(
      () => ({
        ...rotateStyle,
        backgroundColor: isInTurn ? inTurnColor : undefined,
      }),
      [isInTurn, rotateStyle]
    );

    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const el = ref.current;
      if (el !== null) {
        onBoundingClientRectChange(el.getBoundingClientRect());
      }
    }, [windowSize, playerName, onBoundingClientRectChange]);

    return (
      <Wrapper>
        {createElement(
          isInTurn ? InTurnHighlighter : Fragment,
          null,
          <div ref={ref}>
            <Name style={styleMerged}>{playerName}</Name>
          </div>
        )}
      </Wrapper>
    );
  }
);

const Wrapper = styled('div')`
  color: white;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const InTurnHighlighter = styled('div')`
  margin: 10px;
  border-radius: 30px;
`;

const Name = styled('div')`
  font-size: 18px;
  font-weight: bold;
  padding: 10px;
  background-color: #3d3d3d;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: ${zIndex.playerName};
`;
