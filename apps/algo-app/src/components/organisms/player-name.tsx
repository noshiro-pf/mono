import { styled } from 'goober';
import { createElement, Fragment } from 'preact';
import { memoNamed } from 'preact-utils';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { type Rect } from 'ts-utils-additional';
import {
  inTurnColor,
  playerNameRectPadding,
  playerNameRectSize,
  zIndex,
} from '../../constants/index.mjs';

type RotateStyle = Readonly<{
  width?: string;
  height?: string;
  textOrientation?: string;
  transform?: string;
}>;

type Props = Readonly<{
  playerName: string;
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
    // A `switch` rather than `match`: `match` now requires string cases, and
    // `rotate` is numeric. Only 0 and 90 were ever handled — the other two fell
    // through to `undefined`, which spread to nothing, so `{}` is equivalent.
    // A concrete object type rather than `preact.CSSProperties`: that type has
    // a string index signature, and `no-misused-spread` treats spreading it as
    // spreading an iterable. `Object.assign` only trades that for
    // `prefer-object-spread`.
    const rotateStyle = useMemo((): RotateStyle => {
      switch (rotate) {
        case 0:
          return {
            width: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
            height: `${
              playerNameRectSize.height - 2 * playerNameRectPadding
            }px`,
          };

        case 90:
          return {
            textOrientation: 'sideways',
            transform: 'rotate(180deg)',
            width: `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
            height: `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
          };

        case 180:
        case 270:
          return {};
      }
    }, [rotate]);

    const styleMerged = useMemo(
      () =>
        ({
          ...rotateStyle,
          backgroundColor: isInTurn ? inTurnColor : undefined,
        }) satisfies preact.CSSProperties,
      [isInTurn, rotateStyle],
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
          isInTurn ? InTurnHighlighter : Fragment,
          null,
          <div ref={ref}>
            <Name style={styleMerged}>{playerName}</Name>
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
