import { type Point, type Rect } from '@noshiro/ts-utils-additional';

export type Direction = 'nw' | 'n_' | 'ne' | 'w_' | 'e_' | 'sw' | 's_' | 'se';

export type BboxPoint = Readonly<{
  direction: Direction;
  position: Point;
}>;

export type BboxPoints = Readonly<{ [key in Direction]: Point }>;

/*
 *     x0    x1    x2
 * y0 [ ]---[ ]---[ ]
 *     |           |
 * y1 [ ]         [ ]
 *     |           |
 * y2 [ ]---[ ]---[ ]
 */
export const bboxPointsFromRect = (rect: Rect): BboxPoints => {
  const { top: top_, left, width, height } = rect;

  const x0 = left;
  const x1 = left + width / 2;
  const x2 = left + width;
  const y0 = top_;
  const y1 = top_ + height / 2;
  const y2 = top_ + height;

  return {
    nw: { x: x0, y: y0 },
    n_: { x: x1, y: y0 },
    ne: { x: x2, y: y0 },
    w_: { x: x0, y: y1 },
    e_: { x: x2, y: y1 },
    sw: { x: x0, y: y2 },
    s_: { x: x1, y: y2 },
    se: { x: x2, y: y2 },
  };
};

export const foreachBboxPoints = <A>(
  bboxPoints: { readonly [key in Direction]: A },
  fn: (direction: Direction, p: A) => void,
): void => {
  fn('nw', bboxPoints.nw);
  fn('n_', bboxPoints.n_);
  fn('ne', bboxPoints.ne);
  fn('w_', bboxPoints.w_);
  fn('e_', bboxPoints.e_);
  fn('sw', bboxPoints.sw);
  fn('s_', bboxPoints.s_);
  fn('se', bboxPoints.se);
};

export const mapBboxPoints = <A, B>(
  bboxPoints: { readonly [key in Direction]: A },
  fn: (direction: Direction, p: A) => B,
): { [key in Direction]: B } => ({
  nw: fn('nw', bboxPoints.nw),
  n_: fn('n_', bboxPoints.n_),
  ne: fn('ne', bboxPoints.ne),
  w_: fn('w_', bboxPoints.w_),
  e_: fn('e_', bboxPoints.e_),
  sw: fn('sw', bboxPoints.sw),
  s_: fn('s_', bboxPoints.s_),
  se: fn('se', bboxPoints.se),
});
