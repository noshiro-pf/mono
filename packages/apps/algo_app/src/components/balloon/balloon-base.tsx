import type { StyledVNode } from '@noshiro/goober';
import type { RectSize } from '@noshiro/ts-utils-additional';
import { balloonColor, zIndex } from '../../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyledDiv = StyledVNode<Pick<any, number | string | symbol>>;

export const createBalloonBody = (
  //
  balloonSize: RectSize
): StyledDiv => styled('div')`
  position: absolute;
  width: ${balloonSize.width}px;
  height: ${balloonSize.height}px;
  z-index: ${zIndex.balloon};
  background-color: ${balloonColor};
  border-radius: 5px;
  transition: all 0.3s ease;
`;

export const createBalloonWithDownArrow = (
  BalloonBody: StyledDiv
): StyledDiv => styled(BalloonBody)`
  &:before {
    position: absolute;
    content: '';
    border-top: 10px solid ${balloonColor};
    border-right: 10px solid transparent;
    border-left: 10px solid transparent;
    top: 99%; // 隙間ができないように調整
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const createBalloonWithUpArrow = (
  BalloonBody: StyledDiv
): StyledDiv => styled(BalloonBody)`
  &:before {
    position: absolute;
    content: '';
    border-bottom: 10px solid ${balloonColor};
    border-right: 10px solid transparent;
    border-left: 10px solid transparent;
    bottom: 99%; // 隙間ができないように調整
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const createBalloonWithLeftArrow = (
  BalloonBody: StyledDiv
): StyledDiv => styled(BalloonBody)`
  &:before {
    position: absolute;
    content: '';
    border-right: 10px solid ${balloonColor};
    border-bottom: 10px solid transparent;
    border-top: 10px solid transparent;
    top: 50%;
    right: 99%;
    transform: translateY(-50%);
  }
`;

export const createBalloonWithRightArrow = (
  BalloonBody: StyledDiv
): StyledDiv => styled(BalloonBody)`
  &:before {
    position: absolute;
    content: '';
    border-left: 10px solid ${balloonColor};
    border-bottom: 10px solid transparent;
    border-top: 10px solid transparent;
    top: 50%;
    left: 99%;
    transform: translateY(-50%);
  }
`;
