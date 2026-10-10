/**
 * The edges of the DAG as they are drawn: the curves of
 * `edge-geometry.mts`, except where a curve would run through a node that
 * is not one of its own two — a long edge past the nodes of a layer it
 * skips, or any edge once nodes have been dragged about. Such an edge is
 * routed round the nodes instead. The same code path serves every layout,
 * ELK's or the reader's.
 *
 * An edge keeps its curve when no point of it, sampled every few pixels,
 * comes within {@link OBSTACLE_MARGIN} of another node's box (a milestone's
 * too, not its hexagon). Otherwise it leaves its port along the axis to a
 * point a little way out, and is found a path from there to the point a
 * little way in front of its target's port: an A* search over the lines
 * that run along every node's box, kept clear of all of them, costed by its
 * length, a penalty for each turn, one for each edge drawn before it that
 * it crosses, and a smaller one for running along one. The edges are routed
 * shortest first, so that the order of the input does not matter. The
 * corners of the path found are rounded with cubic curves — less where a
 * full rounding would cut into a node — so the edge still leaves and enters
 * at right angles to the sides, as the arrowhead expects. Where nodes stand
 * too close together for that, it squeezes between them along narrower
 * lines ({@link ROUTING_PASSES}); where they touch or overlap, there is no
 * way round, and it keeps its curve.
 */

import { Arr, Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import {
  axesOf,
  boxOf,
  centredBox,
  cubicPoint,
  edgeGeometries,
  pathOf,
  type Axes,
  type AxisBox,
  type AxisPoint,
  type CubicSegment,
  type CubicSegments,
  type EdgeGeometry,
} from './edge-geometry.mjs';
import {
  labelSize,
  type DagDirection,
  type LaidOutEdge,
  type LaidOutNode,
} from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

/** How close to a node, other than its own two, an edge may come. */
export const OBSTACLE_MARGIN = 12;

/**
 * Every edge of `edges` both of whose nodes are among `nodes`, in the order
 * of `edges`: its curve, or a path round the nodes in the way of it.
 */
export const routeEdges = (
  direction: DagDirection,
  nodes: readonly LaidOutNode[],
  edges: readonly LaidOutEdge[],
): readonly EdgeGeometry[] => {
  const curves = edgeGeometries(direction, nodes, edges);

  const blocked = curves.map((curve) => runsThroughNode(curve, nodes));

  if (!blocked.includes(true)) {
    return curves;
  }

  const axes = axesOf(direction);

  const byId: ReadonlyMap<string, LaidOutNode> = new Map(
    nodes.map((node) => [node.id, node]),
  );

  const requests = curves
    .flatMap((curve, index) => {
      const from = byId.get(curve.from);

      const to = byId.get(curve.to);

      return from !== undefined && to !== undefined && blocked[index] === true
        ? [routeRequest(curve, index, from, to, axes)]
        : [];
    })
    .toSorted(compareRequests);

  const drawn = createSegmentIndex();

  for (const [index, curve] of curves.entries()) {
    if (blocked[index] !== true) {
      drawn.addPolyline(
        sampleSegments(curve.segments, DRAWN_SAMPLE_STEP).map(axes.fromPoint),
      );
    }
  }

  const passes = ROUTING_PASSES.map((pass) => ({
    ...pass,
    search: createRouter(
      nodes.map((node) => inflate(boxOf(node, axes), pass.margin)),
      drawn,
    ),
  }));

  const routed: ReadonlyMap<number, EdgeGeometry> = new Map(
    requests.flatMap((request) => {
      for (const pass of passes) {
        const found = pass.search(
          {
            main: request.fromBox.mainEnd + pass.stub,
            cross: request.start.cross,
          },
          {
            main: request.toBox.mainStart - pass.stub,
            cross: request.end.cross,
          },
        );

        if (found !== undefined) {
          const corners = simplify([request.start, ...found, request.end]);

          drawn.addPolyline(corners);

          return [
            [
              request.index,
              routedGeometry(
                request.curve,
                corners,
                axes,
                nodes.filter(
                  ({ id }) =>
                    id !== request.curve.from && id !== request.curve.to,
                ),
                pass.clearance,
              ),
            ] as const,
          ];
        }
      }

      return [];
    }),
  );

  return curves.map((curve, index) => routed.get(index) ?? curve);
};

/**
 * `settled`, with every edge of the node `id` as its curve in `curves`
 * instead: the edges while that node is dragged, where routing them all
 * again for every move would be too slow.
 */
export const withCurvesOf = (
  settled: readonly EdgeGeometry[],
  curves: readonly EdgeGeometry[],
  id: GraphNodeId,
): readonly EdgeGeometry[] => {
  const curveById = new Map(curves.map((curve) => [curve.id, curve]));

  return settled.map((geometry) =>
    geometry.from === id || geometry.to === id
      ? (curveById.get(geometry.id) ?? geometry)
      : geometry,
  );
};

/** Points along `segments`, at most about `step` apart, both ends included. */
export const sampleSegments = (
  segments: readonly CubicSegment[],
  step: number,
): readonly Point[] => {
  const mut_points: Point[] = [];

  for (const [index, segment] of segments.entries()) {
    const count = sampleCount(segment, step);

    for (let mut_at = index === 0 ? 0 : 1; mut_at <= count; mut_at += 1) {
      mut_points.push(cubicPoint(segment, fraction(mut_at, count)));
    }
  }

  return mut_points;
};

type RouteRequest = Readonly<{
  index: number;
  curve: EdgeGeometry;
  /** The source's port and box, and the target's. */
  start: AxisPoint;
  fromBox: AxisBox;
  end: AxisPoint;
  toBox: AxisBox;
}>;

type SegmentIndex = Readonly<{
  addPolyline: (points: readonly AxisPoint[]) => void;
  /**
   * What running from `from` to `to`, along one axis, costs for the edges
   * already drawn: a penalty per crossing and per unit run along one.
   */
  costOf: (
    fromMain: number,
    fromCross: number,
    toMain: number,
    toCross: number,
  ) => number;
}>;

/**
 * How far from every node the lines a routed edge runs along are: more than
 * {@link OBSTACLE_MARGIN}, so that its corners can be rounded.
 */
const ROUTE_MARGIN = 20;

const CORNER_RADIUS = 20;

/**
 * The margin a curve is tested against: a little more than
 * {@link OBSTACLE_MARGIN}, so that samples {@link SAMPLE_STEP} apart cannot
 * step over a corner of it.
 */
const CHECK_MARGIN = OBSTACLE_MARGIN + 2;

const SAMPLE_STEP = 4;

/**
 * How a path is looked for: how far from the nodes its lines run, how far
 * out from its ports it turns at the most, and how close to a node other
 * than its own two a rounded corner may come. Where nodes are too close
 * together for the first, the second squeezes between them — clear of the
 * nodes, if not by {@link OBSTACLE_MARGIN} — rather than leave the edge
 * running through one.
 */
const ROUTING_PASSES = [
  { margin: ROUTE_MARGIN, stub: 24, clearance: CHECK_MARGIN },
  { margin: 8, stub: 12, clearance: 4 },
] as const;

/** How finely the edges drawn already are kept, to count crossings. */
const DRAWN_SAMPLE_STEP = 12;

const BEND_PENALTY = 40;

const CROSSING_PENALTY = 80;

/** Per unit of length run along another edge. */
const OVERLAP_PENALTY = 0.5;

/** The control distance, as a share of the radius, of a quarter circle. */
const KAPPA = 0.5523;

/** The side of a cell of the index of the edges drawn already. */
const CELL = 64;

/** Coordinates closer than this are one. */
const EPSILON = 1e-6;

/** Along, across, back, back across. */
const HEADINGS = [0, 1, 2, 3] as const;

/**
 * How far round its two ends a search looks first, before it looks
 * everywhere.
 */
const SEARCH_WINDOW = 240;

/** Whether a sample of `curve` comes near a node other than its own two. */
const runsThroughNode = (
  curve: EdgeGeometry,
  nodes: readonly LaidOutNode[],
): boolean =>
  comesNear(
    curve.segments,
    nodes.filter(({ id }) => id !== curve.from && id !== curve.to),
    CHECK_MARGIN,
  );

/** Whether a sample of `segments` comes within `margin` of any of `nodes`. */
const comesNear = (
  segments: readonly CubicSegment[],
  nodes: readonly LaidOutNode[],
  margin: number,
): boolean => {
  const bounds = controlBounds(segments);

  // The curve is inside the box round its control points.
  const near = nodes.filter(
    (node) =>
      node.x - margin < bounds.maxX &&
      node.x + node.width + margin > bounds.minX &&
      node.y - margin < bounds.maxY &&
      node.y + node.height + margin > bounds.minY,
  );

  if (!Arr.isNonEmpty(near)) {
    return false;
  }

  for (const segment of segments) {
    const count = sampleCount(segment, SAMPLE_STEP);

    for (let mut_at = 0; mut_at <= count; mut_at += 1) {
      const point = cubicPoint(segment, fraction(mut_at, count));

      if (near.some((node) => isNear(point, node, margin))) {
        return true;
      }
    }
  }

  return false;
};

/** The box round the control points, which holds the whole curve. */
const controlBounds = (
  segments: readonly CubicSegment[],
): Readonly<{ minX: number; maxX: number; minY: number; maxY: number }> => {
  let mut_minX = Number.POSITIVE_INFINITY;

  let mut_maxX = Number.NEGATIVE_INFINITY;

  let mut_minY = Number.POSITIVE_INFINITY;

  let mut_maxY = Number.NEGATIVE_INFINITY;

  for (const { start, control1, control2, end } of segments) {
    for (const { x, y } of [start, control1, control2, end]) {
      mut_minX = Math.min(mut_minX, x);

      mut_maxX = Math.max(mut_maxX, x);

      mut_minY = Math.min(mut_minY, y);

      mut_maxY = Math.max(mut_maxY, y);
    }
  }

  return { minX: mut_minX, maxX: mut_maxX, minY: mut_minY, maxY: mut_maxY };
};

/** How many pieces to sample `segment` in, for samples `step` apart. */
const sampleCount = (segment: CubicSegment, step: number): number =>
  Math.max(2, Math.ceil(fraction(controlLength(segment), step)));

/** `part / whole`, or 0 for nothing whole. */
const fraction = (part: number, whole: number): number =>
  Num.isNonZero(whole) ? Num.div(part, whole) : 0;

const isNear = (point: Point, node: LaidOutNode, margin: number): boolean =>
  node.x - margin < point.x &&
  point.x < node.x + node.width + margin &&
  node.y - margin < point.y &&
  point.y < node.y + node.height + margin;

/** The length of the control polygon: at least the length of the curve. */
const controlLength = ({
  start,
  control1,
  control2,
  end,
}: CubicSegment): number =>
  Math.hypot(control1.x - start.x, control1.y - start.y) +
  Math.hypot(control2.x - control1.x, control2.y - control1.y) +
  Math.hypot(end.x - control2.x, end.y - control2.y);

const routeRequest = (
  curve: EdgeGeometry,
  index: number,
  from: LaidOutNode,
  to: LaidOutNode,
  axes: Axes,
): RouteRequest => {
  const start = axes.fromPoint(curve.segments[0].start);

  const end = axes.fromPoint((curve.segments.at(-1) ?? curve.segments[0]).end);

  // The search starts and ends in front of the box rather than of the
  // port, which is inside the box on a milestone's slanted side.
  return {
    index,
    curve,
    start,
    fromBox: boxOf(from, axes),
    end,
    toBox: boxOf(to, axes),
  };
};

/** Shortest first, then by id: an order the input's does not change. */
const compareRequests = (a: RouteRequest, b: RouteRequest): number => {
  const byLength = manhattan(a.start, a.end) - manhattan(b.start, b.end);

  return byLength !== 0
    ? byLength
    : a.curve.id < b.curve.id
      ? -1
      : a.curve.id > b.curve.id
        ? 1
        : 0;
};

const manhattan = (a: AxisPoint, b: AxisPoint): number =>
  Math.abs(a.main - b.main) + Math.abs(a.cross - b.cross);

const inflate = (box: AxisBox, margin: number): AxisBox =>
  ({
    mainStart: box.mainStart - margin,
    mainEnd: box.mainEnd + margin,
    crossStart: box.crossStart - margin,
    crossEnd: box.crossEnd + margin,
  }) as const;

/** Rounded, so that a box's sides and the lines along them are equal. */
const snap = (value: number): number => Math.round(value * 64) / 64;

/**
 * A search for a path from one point to another round `boxes`: the points
 * where the path found turns, both ends included, or `undefined` if there
 * is none. It heads along the axis at the start, never turns straight back,
 * and does not arrive heading back. It looks among the boxes near the two
 * ends first, and among all of them only if it finds nothing there.
 */
const createRouter =
  (
    boxes: readonly AxisBox[],
    drawn: SegmentIndex,
  ): ((from: AxisPoint, to: AxisPoint) => readonly AxisPoint[] | undefined) =>
  (from, to) => {
    const area = inflate(
      {
        mainStart: Math.min(from.main, to.main),
        mainEnd: Math.max(from.main, to.main),
        crossStart: Math.min(from.cross, to.cross),
        crossEnd: Math.max(from.cross, to.cross),
      },
      SEARCH_WINDOW,
    );

    return (
      searchAmong(
        boxes.filter((box) => overlaps(box, area)),
        from,
        to,
        drawn,
        area,
      ) ?? searchAmong(boxes, from, to, drawn, undefined)
    );
  };

const overlaps = (a: AxisBox, b: AxisBox): boolean =>
  a.mainStart < b.mainEnd &&
  a.mainEnd > b.mainStart &&
  a.crossStart < b.crossEnd &&
  a.crossEnd > b.crossStart;

/**
 * The search itself, over the lines along every side of `boxes`, through
 * `from` and `to`, and round them all — or along the sides of `area`, and
 * not outside it.
 */
const searchAmong = (
  boxes: readonly AxisBox[],
  from: AxisPoint,
  to: AxisPoint,
  drawn: SegmentIndex,
  area: AxisBox | undefined,
): readonly AxisPoint[] | undefined => {
  const mains = linesOf([
    ...boxes.flatMap(({ mainStart, mainEnd }) => [mainStart, mainEnd]),
    from.main,
    to.main,
    ...(area === undefined ? [] : [area.mainStart, area.mainEnd]),
  ]);

  const crosses = linesOf([
    ...boxes.flatMap(({ crossStart, crossEnd }) => [crossStart, crossEnd]),
    from.cross,
    to.cross,
    ...(area === undefined ? [] : [area.crossStart, area.crossEnd]),
  ]);

  const width = mains.length;

  const startM = indexOfLine(mains, from.main);

  const startC = indexOfLine(crosses, from.cross);

  const goalM = indexOfLine(mains, to.main);

  const goalC = indexOfLine(crosses, to.cross);

  const start = startC * width + startM;

  const goal = goalC * width + goalM;

  // The lines it may not go beyond.
  const mLow = area === undefined ? 0 : indexOfLine(mains, area.mainStart);

  const mHigh =
    area === undefined ? width - 1 : indexOfLine(mains, area.mainEnd);

  const cLow = area === undefined ? 0 : indexOfLine(crosses, area.crossStart);

  const cHigh =
    area === undefined
      ? crosses.length - 1
      : indexOfLine(crosses, area.crossEnd);

  const size = width * crosses.length;

  // By `cross index * width + main index`: the vertex is inside a box; the
  // step from it to the next line along, or across, runs through one.
  const mut_blocked = new Uint8Array(size);

  const mut_blockedAlong = new Uint8Array(size);

  const mut_blockedAcross = new Uint8Array(size);

  for (const box of boxes) {
    const m0 = indexOfLine(mains, box.mainStart);

    const m1 = indexOfLine(mains, box.mainEnd);

    const c0 = indexOfLine(crosses, box.crossStart);

    const c1 = indexOfLine(crosses, box.crossEnd);

    for (let mut_c = c0; mut_c <= c1; mut_c += 1) {
      for (let mut_m = m0; mut_m <= m1; mut_m += 1) {
        const at = mut_c * width + mut_m;

        const insideMain = m0 < mut_m && mut_m < m1;

        const insideCross = c0 < mut_c && mut_c < c1;

        if (insideMain && insideCross) {
          mut_blocked[at] = 1;
        }

        if (insideCross && mut_m < m1) {
          mut_blockedAlong[at] = 1;
        }

        if (insideMain && mut_c < c1) {
          mut_blockedAcross[at] = 1;
        }
      }
    }
  }

  if (mut_blocked[start] === 1 || mut_blocked[goal] === 1) {
    return undefined;
  }

  // The ends exactly, rather than their lines, which are snapped.
  const pointAt = (vertex: number): AxisPoint => {
    const m = vertex % width;

    const c = Math.round(fraction(vertex - m, width));

    return {
      main: m === startM ? from.main : m === goalM ? to.main : (mains[m] ?? 0),
      cross:
        c === startC ? from.cross : c === goalC ? to.cross : (crosses[c] ?? 0),
    };
  };

  if (start === goal) {
    return [pointAt(start)];
  }

  // By state, `vertex * 4 + heading` (along, across, back, back across):
  // the cost so far, the state before, and whether it was reached and
  // settled.
  const mut_cost = new Float64Array(size * 4);

  const mut_previous = new Int32Array(size * 4);

  const mut_reached = new Uint8Array(size * 4);

  const mut_settled = new Uint8Array(size * 4);

  // By `vertex * 2` (along) or `vertex * 2 + 1` (across): what crossing the
  // edges drawn so far costs on the step from the vertex, once worked out.
  const mut_stepCost = new Float64Array(size * 2);

  mut_stepCost.fill(Number.NaN);

  const stepCost = (vertex: number, across: boolean): number => {
    const at = vertex * 2 + (across ? 1 : 0);

    const known = mut_stepCost[at] ?? Number.NaN;

    if (!Number.isNaN(known)) {
      return known;
    }

    const m = vertex % width;

    const c = Math.round(fraction(vertex - m, width));

    const main = mains[m] ?? 0;

    const cross = crosses[c] ?? 0;

    const cost = across
      ? drawn.costOf(main, cross, main, crosses[c + 1] ?? cross)
      : drawn.costOf(main, cross, mains[m + 1] ?? main, cross);

    mut_stepCost[at] = cost;

    return cost;
  };

  const goalMain = mains[goalM] ?? 0;

  const goalCross = crosses[goalC] ?? 0;

  const heap = createHeap();

  const startState = start * 4;

  mut_previous[startState] = -1;

  mut_reached[startState] = 1;

  heap.push(startState, 0, 0);

  while (heap.size() > 0) {
    const state = heap.pop();

    if (mut_settled[state] === 1) {
      continue;
    }

    mut_settled[state] = 1;

    const heading = state % 4;

    const vertex = (state - heading) / 4;

    if (vertex === goal) {
      const mut_vertices: AxisPoint[] = [];

      for (
        let mut_state = state;
        mut_state >= 0;
        mut_state = mut_previous[mut_state] ?? -1
      ) {
        mut_vertices.push(pointAt(Math.floor(mut_state / 4)));
      }

      return simplify(mut_vertices.toReversed());
    }

    const m = vertex % width;

    const c = Math.round(fraction(vertex - m, width));

    const costHere = mut_cost[state] ?? 0;

    for (const onward of HEADINGS) {
      const next =
        onward === (heading + 2) % 4
          ? -1
          : onward === 0
            ? m < mHigh && mut_blockedAlong[vertex] !== 1
              ? vertex + 1
              : -1
            : onward === 2
              ? m > mLow && mut_blockedAlong[vertex - 1] !== 1
                ? vertex - 1
                : -1
              : onward === 1
                ? c < cHigh && mut_blockedAcross[vertex] !== 1
                  ? vertex + width
                  : -1
                : c > cLow && mut_blockedAcross[vertex - width] !== 1
                  ? vertex - width
                  : -1;

      // Never straight back, nor into a box; into the goal, not from
      // beyond it.
      if (
        next < 0 ||
        mut_blocked[next] === 1 ||
        (next === goal && onward === 2)
      ) {
        continue;
      }

      const across = onward % 2 === 1;

      const nextM = next % width;

      const nextC = Math.round(fraction(next - nextM, width));

      const turns =
        (onward === heading ? 0 : 1) + (next === goal && onward !== 0 ? 1 : 0);

      const cost =
        costHere +
        (across
          ? Math.abs((crosses[nextC] ?? 0) - (crosses[c] ?? 0))
          : Math.abs((mains[nextM] ?? 0) - (mains[m] ?? 0))) +
        turns * BEND_PENALTY +
        stepCost(Math.min(vertex, next), across);

      const nextState = next * 4 + onward;

      if (
        mut_settled[nextState] === 1 ||
        (mut_reached[nextState] === 1 &&
          cost >= (mut_cost[nextState] ?? Number.POSITIVE_INFINITY))
      ) {
        continue;
      }

      mut_reached[nextState] = 1;

      mut_cost[nextState] = cost;

      mut_previous[nextState] = state;

      const dMain = goalMain - (mains[nextM] ?? 0);

      const dCross = goalCross - (crosses[nextC] ?? 0);

      const remaining =
        Math.abs(dMain) +
        Math.abs(dCross) +
        fewestTurns(onward, dMain, dCross) * BEND_PENALTY;

      heap.push(nextState, cost + remaining, remaining);
    }
  }

  return undefined;
};

/**
 * The fewest turns a path heading `heading` (along, across, back, back
 * across) can make to arrive heading along at a point `dMain` along and
 * `dCross` across from it — never turning straight back: what the
 * estimate of the search adds to the distance, so that it does not look
 * at every path as long as the best one with fewer turns.
 */
const fewestTurns = (
  heading: number,
  dMain: number,
  dCross: number,
): number => {
  const level = Math.abs(dCross) < EPSILON;

  if (heading === 0) {
    return level ? (dMain > 0 ? 0 : 4) : dMain >= 0 ? 2 : 4;
  }

  if (heading === 2) {
    return level ? 4 : 2;
  }

  const approaching = !level && (heading === 1) === dCross > 0;

  return approaching && dMain >= 0 ? 1 : 3;
};

/** `values` snapped, once each, in order, with a line outside them all. */
const linesOf = (values: readonly number[]): readonly number[] => {
  const sorted = Arr.uniq(values.map(snap)).toSorted((a, b) => a - b);

  return Arr.isNonEmpty(sorted)
    ? [
        snap(sorted[0] - ROUTE_MARGIN),
        ...sorted,
        snap((sorted.at(-1) ?? sorted[0]) + ROUTE_MARGIN),
      ]
    : sorted;
};

/**
 * The index of the first of `lines` (in order) at `value` snapped or past
 * it, or of the last line if none is.
 */
const indexOfLine = (lines: readonly number[], value: number): number => {
  const target = snap(value);

  let mut_low = 0;

  let mut_high = lines.length - 1;

  while (mut_low < mut_high) {
    const middle = Math.floor((mut_low + mut_high) / 2);

    if ((lines[middle] ?? 0) < target) {
      mut_low = middle + 1;
    } else {
      mut_high = middle;
    }
  }

  return mut_low;
};

/**
 * The edges drawn so far, as short straight pieces filed by the cells of
 * {@link CELL} they touch, so that a step of a search finds the few it may
 * cross.
 */
const createSegmentIndex = (): SegmentIndex => {
  const mut_cells = new Map<number, number[]>();

  // Four numbers a piece: main and cross of one end, then of the other.
  const mut_pieces: number[] = [];

  const mut_seen: number[] = [];

  let mut_query = 0;

  const addPiece = (a: AxisPoint, b: AxisPoint): void => {
    const id = mut_seen.length;

    mut_pieces.push(a.main, a.cross, b.main, b.cross);

    mut_seen.push(0);

    for (const key of cellKeys(a.main, a.cross, b.main, b.cross)) {
      const mut_cell = mut_cells.get(key);

      if (mut_cell === undefined) {
        mut_cells.set(key, [id]);
      } else {
        mut_cell.push(id);
      }
    }
  };

  const addPolyline = (points: readonly AxisPoint[]): void => {
    for (const [index, b] of points.entries()) {
      const a = points[index - 1];

      if (a !== undefined) {
        addPiece(a, b);
      }
    }
  };

  const costOf = (
    fromMain: number,
    fromCross: number,
    toMain: number,
    toCross: number,
  ): number => {
    mut_query += 1;

    const alongMain = Math.abs(fromCross - toCross) < EPSILON;

    // The step runs between `low` and `high` at `level`; each piece is read
    // the same way round.
    const level = alongMain ? fromCross : fromMain;

    const low = alongMain
      ? Math.min(fromMain, toMain)
      : Math.min(fromCross, toCross);

    const high = alongMain
      ? Math.max(fromMain, toMain)
      : Math.max(fromCross, toCross);

    let mut_cost = 0;

    for (const key of cellKeys(fromMain, fromCross, toMain, toCross)) {
      for (const id of mut_cells.get(key) ?? []) {
        if (mut_seen[id] === mut_query) {
          continue;
        }

        mut_seen[id] = mut_query;

        const base = id * 4;

        const aRun = mut_pieces[base + (alongMain ? 0 : 1)] ?? 0;

        const aLevel = mut_pieces[base + (alongMain ? 1 : 0)] ?? 0;

        const bRun = mut_pieces[base + (alongMain ? 2 : 3)] ?? 0;

        const bLevel = mut_pieces[base + (alongMain ? 3 : 2)] ?? 0;

        if (
          Math.abs(aLevel - level) < EPSILON &&
          Math.abs(bLevel - level) < EPSILON
        ) {
          const shared =
            Math.min(high, Math.max(aRun, bRun)) -
            Math.max(low, Math.min(aRun, bRun));

          mut_cost += Math.max(0, shared) * OVERLAP_PENALTY;
        } else if (aLevel < level !== bLevel < level) {
          const at =
            aRun + (bRun - aRun) * fraction(level - aLevel, bLevel - aLevel);

          if (low <= at && at < high) {
            mut_cost += CROSSING_PENALTY;
          }
        }
      }
    }

    return mut_cost;
  };

  return { addPolyline, costOf };
};

/** The cells the box from `(m0, c0)` to `(m1, c1)` touches. */
const cellKeys = (
  m0: number,
  c0: number,
  m1: number,
  c1: number,
): readonly number[] => {
  const mFirst = Math.floor(Math.min(m0, m1) / CELL);

  const mLast = Math.floor(Math.max(m0, m1) / CELL);

  const cFirst = Math.floor(Math.min(c0, c1) / CELL);

  const cLast = Math.floor(Math.max(c0, c1) / CELL);

  const mut_keys: number[] = [];

  for (let mut_m = mFirst; mut_m <= mLast; mut_m += 1) {
    for (let mut_c = cFirst; mut_c <= cLast; mut_c += 1) {
      mut_keys.push((mut_m + 65_536) * 262_144 + (mut_c + 65_536));
    }
  }

  return mut_keys;
};

/**
 * A min-heap of states by priority, then by what is left (so that of two
 * paths as good the one further on goes first), then by the state.
 */
const createHeap = (): Readonly<{
  push: (state: number, priority: number, remaining: number) => void;
  pop: () => number;
  size: () => number;
}> => {
  const mut_states: number[] = [];

  const mut_priorities: number[] = [];

  const mut_remaining: number[] = [];

  const before = (i: number, j: number): boolean => {
    const pi = mut_priorities[i] ?? 0;

    const pj = mut_priorities[j] ?? 0;

    if (pi !== pj) {
      return pi < pj;
    }

    const ri = mut_remaining[i] ?? 0;

    const rj = mut_remaining[j] ?? 0;

    return ri !== rj ? ri < rj : (mut_states[i] ?? 0) < (mut_states[j] ?? 0);
  };

  const swap = (i: number, j: number): void => {
    const state = mut_states[i] ?? 0;

    const priority = mut_priorities[i] ?? 0;

    const remaining = mut_remaining[i] ?? 0;

    mut_states[i] = mut_states[j] ?? 0;

    mut_priorities[i] = mut_priorities[j] ?? 0;

    mut_remaining[i] = mut_remaining[j] ?? 0;

    mut_states[j] = state;

    mut_priorities[j] = priority;

    mut_remaining[j] = remaining;
  };

  return {
    push: (state, priority, remaining) => {
      mut_states.push(state);

      mut_priorities.push(priority);

      mut_remaining.push(remaining);

      let mut_at = mut_states.length - 1;

      while (mut_at > 0) {
        const up = Math.floor((mut_at - 1) / 2);

        if (!before(mut_at, up)) {
          break;
        }

        swap(mut_at, up);

        mut_at = up;
      }
    },
    pop: () => {
      const first = mut_states[0] ?? 0;

      swap(0, mut_states.length - 1);

      mut_states.pop();

      mut_priorities.pop();

      mut_remaining.pop();

      let mut_at = 0;

      let mut_sinking = true;

      while (mut_sinking) {
        const left = mut_at * 2 + 1;

        const right = left + 1;

        const smaller =
          right < mut_states.length && before(right, left) ? right : left;

        mut_sinking = smaller < mut_states.length && before(smaller, mut_at);

        if (!mut_sinking) {
          continue;
        }

        swap(mut_at, smaller);

        mut_at = smaller;
      }

      return first;
    },
    size: () => mut_states.length,
  };
};

/** `points` without repeats, and without the points where it does not turn. */
const simplify = (points: readonly AxisPoint[]): readonly AxisPoint[] => {
  const distinct = points.filter(
    (point, index) => index === 0 || !samePoint(point, points[index - 1]),
  );

  return distinct.filter((point, index) => {
    const previous = distinct[index - 1];

    const next = distinct[index + 1];

    return (
      previous === undefined ||
      next === undefined ||
      !(
        (sameValue(previous.main, point.main) &&
          sameValue(point.main, next.main)) ||
        (sameValue(previous.cross, point.cross) &&
          sameValue(point.cross, next.cross))
      )
    );
  });
};

const sameValue = (a: number, b: number): boolean => Math.abs(a - b) < EPSILON;

const samePoint = (a: AxisPoint, b: AxisPoint | undefined): boolean =>
  b !== undefined && sameValue(a.main, b.main) && sameValue(a.cross, b.cross);

/**
 * The edge along `corners`, its corners rounded — each as far as
 * {@link CORNER_RADIUS} allows, half of the straight stretches on either
 * side, and the `obstacles` it would otherwise come within `clearance` of.
 */
const routedGeometry = (
  curve: EdgeGeometry,
  corners: readonly AxisPoint[],
  axes: Axes,
  obstacles: readonly LaidOutNode[],
  clearance: number,
): EdgeGeometry => {
  const segments = roundCorners(corners, axes, obstacles, clearance);

  const [first, ...rest] = segments;

  const nonEmpty: CubicSegments =
    first === undefined ? curve.segments : Arr.toUnshifted(first)(rest);

  return {
    id: curve.id,
    from: curve.from,
    to: curve.to,
    label: curve.label,
    segments: nonEmpty,
    path: pathOf(nonEmpty),
    labelBox:
      curve.label === ''
        ? undefined
        : centredBox(midpointByLength(nonEmpty), labelSize(curve.label)),
    routed: true,
  };
};

const roundCorners = (
  corners: readonly AxisPoint[],
  axes: Axes,
  obstacles: readonly LaidOutNode[],
  clearance: number,
): readonly CubicSegment[] => {
  const last = corners.length - 1;

  const pieces = corners.flatMap((corner, index) => {
    const previous = corners[index - 1];

    const next = corners[index + 1];

    if (previous === undefined || next === undefined) {
      return [];
    }

    const lengthIn = manhattan(previous, corner);

    const lengthOut = manhattan(corner, next);

    // A stretch between two corners is shared by both; one from an end
    // belongs to the corner alone.
    const room = Math.min(
      CORNER_RADIUS,
      index === 1 ? lengthIn : lengthIn / 2,
      index + 1 === last ? lengthOut : lengthOut / 2,
    );

    const headingIn = headingOf(previous, corner);

    const headingOut = headingOf(corner, next);

    const radius =
      [room, room / 2, room / 4].find(
        (candidate) =>
          !comesNear(
            [toCubic(arc(corner, headingIn, headingOut, candidate), axes)],
            obstacles,
            clearance,
          ),
      ) ?? 0;

    return [arc(corner, headingIn, headingOut, radius)];
  });

  const first = corners[0];

  const end = corners[last];

  if (first === undefined || end === undefined) {
    return [];
  }

  const ends = [
    first,
    ...pieces.flatMap(({ start, end: arcEnd }) => [start, arcEnd]),
    end,
  ] as const;

  const straights = Array.from({ length: pieces.length + 1 }, (_, index) => ({
    start: ends[index * 2] ?? first,
    end: ends[index * 2 + 1] ?? end,
  }));

  return (
    straights
      .flatMap(({ start, end: straightEnd }, index) => {
        const piece = pieces[index];

        return [
          ...(samePoint(start, straightEnd) ? [] : [line(start, straightEnd)]),
          ...(piece === undefined || samePoint(piece.start, piece.end)
            ? []
            : [piece]),
        ];
      })
      // Each from exactly where the last ended, which rounding can miss.
      .map((segment, index, all) => ({
        ...segment,
        start: all[index - 1]?.end ?? segment.start,
      }))
      .map((segment) => toCubic(segment, axes))
  );
};

type AxisCubic = Readonly<{
  start: AxisPoint;
  control1: AxisPoint;
  control2: AxisPoint;
  end: AxisPoint;
}>;

const headingOf = (from: AxisPoint, to: AxisPoint): AxisPoint =>
  ({
    main: Math.sign(to.main - from.main),
    cross: Math.sign(to.cross - from.cross),
  }) as const;

const offset = (
  point: AxisPoint,
  heading: AxisPoint,
  distance: number,
): AxisPoint =>
  ({
    main: point.main + heading.main * distance,
    cross: point.cross + heading.cross * distance,
  }) as const;

/** The corner at `corner` rounded to a quarter circle of `radius`. */
const arc = (
  corner: AxisPoint,
  headingIn: AxisPoint,
  headingOut: AxisPoint,
  radius: number,
): AxisCubic => {
  const start = offset(corner, headingIn, -radius);

  const end = offset(corner, headingOut, radius);

  return {
    start,
    control1: offset(start, headingIn, KAPPA * radius),
    control2: offset(end, headingOut, -KAPPA * radius),
    end,
  };
};

const line = (start: AxisPoint, end: AxisPoint): AxisCubic =>
  ({
    start,
    control1: {
      main: start.main + (end.main - start.main) / 3,
      cross: start.cross + (end.cross - start.cross) / 3,
    },
    control2: {
      main: start.main + ((end.main - start.main) * 2) / 3,
      cross: start.cross + ((end.cross - start.cross) * 2) / 3,
    },
    end,
  }) as const;

const toCubic = (segment: AxisCubic, axes: Axes): CubicSegment =>
  ({
    start: axes.toPoint(segment.start),
    control1: axes.toPoint(segment.control1),
    control2: axes.toPoint(segment.control2),
    end: axes.toPoint(segment.end),
  }) as const;

/** The point half-way along `segments`, by length. */
const midpointByLength = (segments: CubicSegments): Point => {
  const points = sampleSegments(segments, SAMPLE_STEP);

  const lengths = points.map((point, index) => {
    const before = points[index - 1] ?? point;

    return Math.hypot(point.x - before.x, point.y - before.y);
  });

  const half = Arr.sum(lengths) / 2;

  let mut_walked = 0;

  for (const [index, stretch] of lengths.entries()) {
    const a = points[index - 1];

    const b = points[index];

    if (a !== undefined && b !== undefined && mut_walked + stretch >= half) {
      const share = fraction(half - mut_walked, stretch);

      return { x: a.x + (b.x - a.x) * share, y: a.y + (b.y - a.y) * share };
    }

    mut_walked += stretch;
  }

  return segments[0].start;
};
