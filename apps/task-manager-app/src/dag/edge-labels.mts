/**
 * Where the labels of the edges (「SS」, 「+3日」) are drawn: on the middle
 * of the edge, unless that puts the label over a node, over another label,
 * or across other edges — then at the place along the edge, nearest its
 * middle, that covers the least of those: a node or a label before any
 * edge. The labels are placed in the order of their edges' ids, so that the
 * order of the input does not matter.
 */

import { Arr, asPositiveInt, asUint32, Num } from 'ts-data-forge';
import { cubicPoint, type EdgeGeometry } from './edge-geometry.mjs';
import type { LaidOutNode } from './graph-layout.mjs';
import type { Point, Size } from './pan-zoom.mjs';

/** How far from a node or another label a label is kept. */
export const LABEL_CLEARANCE = 2;

/** `geometries`, in their order, each label moved where it covers least. */
export const placeLabels = (
  geometries: readonly EdgeGeometry[],
  nodes: readonly LaidOutNode[],
): readonly EdgeGeometry[] => {
  if (geometries.every(({ labelBox }) => labelBox === undefined)) {
    return geometries;
  }

  const paths = geometries.map((geometry) => {
    const points = sampleLine(geometry);

    return { id: geometry.id, points, bounds: boundsOf(points) };
  });

  const mut_placed: Box[] = [];

  const moved = new Map(
    geometries
      .flatMap((geometry, index) =>
        geometry.labelBox === undefined
          ? []
          : [{ geometry, index, labelBox: geometry.labelBox }],
      )
      .toSorted((a, b) => a.geometry.id.localeCompare(b.geometry.id, 'en'))
      .map(({ index, labelBox }) => {
        const own = paths[index]?.points ?? [];

        const cost = (box: Box): number =>
          OVER_NODE *
            nodes.filter((node) => overlaps(box, node, LABEL_CLEARANCE))
              .length +
          OVER_LABEL *
            mut_placed.filter((other) => overlaps(box, other, LABEL_CLEARANCE))
              .length +
          OVER_EDGE *
            paths.filter(
              (path, other) =>
                other !== index &&
                overlaps(box, path.bounds, 0) &&
                path.points.some((point) => contains(box, point)),
            ).length;

        const best = Arr.toUnshifted({ box: labelBox, cost: cost(labelBox) })(
          SHARES.map((share) => {
            const box = centredOn(pointAlong(own, share), labelBox);

            return { box, cost: cost(box) + Math.abs(share - 0.5) };
          }),
        ).reduce((a, b) => (b.cost < a.cost ? b : a));

        mut_placed.push(best.box);

        return [index, best.box] as const;
      }),
  );

  return geometries.map((geometry, index) => {
    const box = moved.get(index);

    return box === undefined || box === geometry.labelBox
      ? geometry
      : { ...geometry, labelBox: box };
  });
};

type Box = Point & Size;

/** What a label over each costs: a node or a label rules a place out. */
const OVER_NODE = 1000;

const OVER_LABEL = 1000;

const OVER_EDGE = 10;

/**
 * The places along an edge a label may go, as shares of its length: from
 * the middle outwards, never so near an end that it covers the arrowhead.
 */
const SHARES = [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8] as const;

/** How far apart the points an edge is read by are, at the most. */
const STEP = 4;

/** Points along `geometry`, both ends included, about {@link STEP} apart. */
const sampleLine = (geometry: EdgeGeometry): readonly Point[] =>
  geometry.segments.flatMap((segment, index) => {
    const { start, control1, control2, end } = segment;

    const reach =
      Math.hypot(control1.x - start.x, control1.y - start.y) +
      Math.hypot(control2.x - control1.x, control2.y - control1.y) +
      Math.hypot(end.x - control2.x, end.y - control2.y);

    const count = asPositiveInt(Math.max(2, Math.ceil(reach / STEP)));

    return Arr.seq(asUint32(count + 1))
      .filter((at) => index === 0 || at > 0)
      .map((at) => cubicPoint(segment, Num.div(at, count)));
  });

/** The point `share` of the way along `points`, by length. */
const pointAlong = (points: readonly Point[], share: number): Point => {
  const lengths = points.map((point, index) => {
    const before = points[index - 1] ?? point;

    return Math.hypot(point.x - before.x, point.y - before.y);
  });

  const target = Arr.sum(lengths) * share;

  let mut_walked = 0;

  for (const [index, stretch] of lengths.entries()) {
    const a = points[index - 1];

    const b = points[index];

    if (a !== undefined && b !== undefined && mut_walked + stretch >= target) {
      const part = Num.isNonZero(stretch)
        ? Num.div(target - mut_walked, stretch)
        : 0;

      return { x: a.x + (b.x - a.x) * part, y: a.y + (b.y - a.y) * part };
    }

    mut_walked += stretch;
  }

  return points[0] ?? { x: 0, y: 0 };
};

/** A box as big as `size`, centred on `point`. */
const centredOn = (point: Point, size: Size): Box =>
  ({
    x: point.x - size.width / 2,
    y: point.y - size.height / 2,
    width: size.width,
    height: size.height,
  }) as const;

const boundsOf = (points: readonly Point[]): Box => {
  const xs = points.map((point) => point.x);

  const ys = points.map((point) => point.y);

  const left = Math.min(...xs);

  const upper = Math.min(...ys);

  return {
    x: left,
    y: upper,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - upper,
  };
};

/** Whether `a` and `b` come within `margin` of each other. */
const overlaps = (a: Box, b: Box, margin: number): boolean =>
  a.x - margin < b.x + b.width &&
  b.x < a.x + a.width + margin &&
  a.y - margin < b.y + b.height &&
  b.y < a.y + a.height + margin;

const contains = (box: Box, point: Point): boolean =>
  box.x < point.x &&
  point.x < box.x + box.width &&
  box.y < point.y &&
  point.y < box.y + box.height;
