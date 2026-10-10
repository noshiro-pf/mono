/**
 * The edges of the DAG as curves between wherever the nodes are — put there
 * by ELK or by hand — so they are worked out here rather than taken from
 * ELK's routes.
 *
 * Every edge leaves its source and enters its target across the sides that
 * face along the direction of growth (right then left, or bottom then top),
 * at right angles to them: a cubic Bézier curve whose control points lie on
 * that axis, so the arrowhead, which follows the curve's last tangent, points
 * straight into the node. Several edges on one side are spread along it, in
 * the order of the nodes at their other ends, so that they do not cross
 * where they need not. A target behind its source in line with it gets two
 * curves that go round both nodes rather than one through them. A curve
 * that would run through some other node is routed round it instead
 * (`edge-routing.mts`), which is how the edges are drawn.
 */

import { Num } from 'ts-data-forge';
import {
  type DeepReadonly,
  type FixedLengthTuple,
  type NonEmptyTuple,
} from 'ts-type-forge';
import { type GraphNodeId } from '../domain/index.mjs';
import {
  labelSize,
  type DagDirection,
  type LaidOutEdge,
  type LaidOutNode,
} from './graph-layout.mjs';
import { type Point, type Size } from './pan-zoom.mjs';

/** The least distance of a control point from the end it belongs to. */
export const MIN_CONTROL_OFFSET = 40;

/**
 * The curve of every edge of `edges` both of whose nodes are among `nodes`,
 * in the order of `edges`.
 */
export const edgeGeometries = (
  direction: DagDirection,
  nodes: readonly LaidOutNode[],
  edges: readonly LaidOutEdge[],
): readonly EdgeGeometry[] => {
  const axes = axesOf(direction);

  const byId = new Map(nodes.map((node) => [node.id, node]));

  const placed = edges.flatMap((edge) => {
    const from = byId.get(edge.from);

    const to = byId.get(edge.to);

    return from === undefined || to === undefined ? [] : [{ edge, from, to }];
  });

  const outSlots = slotsBySide(
    placed.map(({ edge, from, to }) => ({ edge, node: from, other: to })),
    axes,
  );

  const inSlots = slotsBySide(
    placed.map(({ edge, from, to }) => ({ edge, node: to, other: from })),
    axes,
  );

  return placed.map(({ edge, from, to }) => {
    const start = attachment(
      from,
      'exit',
      outSlots.get(edge.id) ?? ONLY_SLOT,
      axes,
    );

    const end = attachment(
      to,
      'entry',
      inSlots.get(edge.id) ?? ONLY_SLOT,
      axes,
    );

    const curve = curveBetween(start, end, boxOf(from, axes), boxOf(to, axes));

    const segments = mapSegments(curve, axes.toPoint);

    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: edge.label,
      segments,
      path: pathOf(segments),
      labelBox:
        edge.label === ''
          ? undefined
          : centredBox(axes.toPoint(midpointOf(curve)), labelSize(edge.label)),
      routed: false,
    };
  });
};

/** The point at `t` (from 0 at the start to 1 at the end) of `segment`. */
export const cubicPoint = (segment: CubicSegment, t: number): Point => {
  const u = 1 - t;

  const w0 = u ** 3;

  const w1 = 3 * u * u * t;

  const w2 = 3 * u * t * t;

  const w3 = t ** 3;

  const { start, control1, control2, end } = segment;

  return {
    x: w0 * start.x + w1 * control1.x + w2 * control2.x + w3 * end.x,
    y: w0 * start.y + w1 * control1.y + w2 * control2.y + w3 * end.y,
  };
};

/** Points and sizes read along `direction` and across it. */
export const axesOf = (direction: DagDirection): Axes =>
  direction === 'right'
    ? ({
        direction,
        toPoint: ({ main, cross }) => ({ x: main, y: cross }),
        fromPoint: ({ x, y }) => ({ main: x, cross: y }),
        mainSize: ({ width }) => width,
        crossSize: ({ height }) => height,
      } as const)
    : ({
        direction,
        toPoint: ({ main, cross }) => ({ x: cross, y: main }),
        fromPoint: ({ x, y }) => ({ main: y, cross: x }),
        mainSize: ({ height }) => height,
        crossSize: ({ width }) => width,
      } as const);

/** `node`'s box, along the axis and across it. */
export const boxOf = (node: LaidOutNode, axes: Axes): AxisBox => {
  const { main, cross } = axes.fromPoint(node);

  return {
    mainStart: main,
    mainEnd: main + axes.mainSize(node),
    crossStart: cross,
    crossEnd: cross + axes.crossSize(node),
  };
};

/** `segments`, one after the other, as the `d` of an SVG path. */
export const pathOf = (segments: CubicSegments): string => {
  const { start } = segments[0];

  const curves = segments
    .map(
      ({ control1, control2, end }) =>
        `C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`,
    )
    .join(' ');

  return `M ${start.x} ${start.y} ${curves}`;
};

/** A box of `size` whose centre is `centre`. */
export const centredBox = (centre: Point, size: Size): Point & Size =>
  ({
    x: centre.x - size.width / 2,
    y: centre.y - size.height / 2,
    width: size.width,
    height: size.height,
  }) as const;

export type CubicSegment = DeepReadonly<{
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
}>;

/** One segment or more, each starting where the one before ends. */
export type CubicSegments = NonEmptyTuple<CubicSegment>;

export type EdgeGeometry = DeepReadonly<{
  id: string;
  from: GraphNodeId;
  to: GraphNodeId;
  label: string;
  /**
   * One curve, or two that go round the nodes — or, for an edge routed
   * round the nodes in its way (`edge-routing.mts`), as many as it takes.
   * The first leaves its start, and the last arrives at its end, along the
   * direction of growth.
   */
  segments: CubicSegments;
  /** `segments` as the `d` of an SVG path. */
  path: string;
  /** Centred on the middle of the curve; `undefined` for no label. */
  labelBox: (Point & Size) | undefined;
  /** Routed round the nodes in its way rather than one or two curves. */
  routed: boolean;
}>;

/**
 * Coordinates along the direction of growth (`main`) and across it
 * (`cross`), so that one piece of geometry serves both directions.
 */
export type AxisPoint = Readonly<{ main: number; cross: number }>;

export type Axes = Readonly<{
  direction: DagDirection;
  toPoint: (point: AxisPoint) => Point;
  fromPoint: (point: Point) => AxisPoint;
  /** The node's extent along the main axis and across it. */
  mainSize: (size: Size) => number;
  crossSize: (size: Size) => number;
}>;

/** One curve, or two that meet where they turn. */
type Segments<S> = FixedLengthTuple<1, S> | FixedLengthTuple<2, S>;

type AxisSegment = Readonly<{
  start: AxisPoint;
  control1: AxisPoint;
  control2: AxisPoint;
  end: AxisPoint;
}>;

/** A node's box in axis coordinates. */
export type AxisBox = Readonly<{
  mainStart: number;
  mainEnd: number;
  crossStart: number;
  crossEnd: number;
}>;

/** Which of `count` places along a side an edge takes, from 0. */
type Slot = Readonly<{ index: number; count: number }>;

const ONLY_SLOT: Slot = { index: 0, count: 1 } as const;

/** How far outside both nodes a curve that goes round them passes. */
const DETOUR_CLEARANCE = 32;

/**
 * The least gap across the axis between two nodes, one behind the other,
 * for a single curve to pass between them rather than go round.
 */
const MIN_CROSS_GAP = 24;

const crossCentre = (node: LaidOutNode, axes: Axes): number => {
  const box = boxOf(node, axes);

  return (box.crossStart + box.crossEnd) / 2;
};

const mainCentre = (node: LaidOutNode, axes: Axes): number => {
  const box = boxOf(node, axes);

  return (box.mainStart + box.mainEnd) / 2;
};

/**
 * The slot of every edge on the side of its `node`, ordered by where the
 * node at the other end is across the axis — then along it, then by id, so
 * that the order never depends on the order of the input.
 */
const slotsBySide = (
  ends: readonly Readonly<{
    edge: LaidOutEdge;
    node: LaidOutNode;
    other: LaidOutNode;
  }>[],
  axes: Axes,
): ReadonlyMap<string, Slot> =>
  new Map(
    Array.from(Map.groupBy(ends, ({ node }) => node.id).values()).flatMap(
      (group) =>
        group
          .toSorted((a, b) => compareEnds(a, b, axes))
          .map(
            ({ edge }, index) =>
              [edge.id, { index, count: group.length }] as const,
          ),
    ),
  );

const compareEnds = (
  a: Readonly<{ edge: LaidOutEdge; other: LaidOutNode }>,
  b: Readonly<{ edge: LaidOutEdge; other: LaidOutNode }>,
  axes: Axes,
): number => {
  const byCross = crossCentre(a.other, axes) - crossCentre(b.other, axes);

  if (byCross !== 0) {
    return byCross;
  }

  const byMain = mainCentre(a.other, axes) - mainCentre(b.other, axes);

  return byMain !== 0
    ? byMain
    : a.edge.id < b.edge.id
      ? -1
      : a.edge.id > b.edge.id
        ? 1
        : 0;
};

/**
 * Where an edge in `slot` meets `node`'s exit side (towards the direction of
 * growth) or entry side. A milestone's hexagon has its points on the sides
 * that face along the axis when it grows to the right — edges meet its
 * slanted edges there — and a flat top and bottom between the slants when it
 * grows down.
 */
const attachment = (
  node: LaidOutNode,
  side: 'exit' | 'entry',
  slot: Slot,
  axes: Axes,
): AxisPoint => {
  const box = boxOf(node, axes);

  const hexagon = node.kind === 'milestone';

  // The milestone's slants (`dag-milestone-node.tsx`) are half its height
  // deep, at 45 degrees.
  const inset = node.height / 2;

  const pointsAlongAxis = hexagon && axes.direction === 'right';

  const crossStart = box.crossStart + (hexagon && !pointsAlongAxis ? inset : 0);

  const crossEnd = box.crossEnd - (hexagon && !pointsAlongAxis ? inset : 0);

  const places = slot.count + 1;

  // `count` is at least 1, so there are always two places or more.
  const cross =
    crossStart +
    (Num.isNonZero(places)
      ? Num.div((crossEnd - crossStart) * (slot.index + 1), places)
      : (crossEnd - crossStart) / 2);

  const indent = pointsAlongAxis
    ? Math.abs(cross - (box.crossStart + box.crossEnd) / 2)
    : 0;

  return {
    main: side === 'exit' ? box.mainEnd - indent : box.mainStart + indent,
    cross,
  };
};

/**
 * From `start`, heading along the axis, to `end`, arriving along it. A
 * target ahead gets one curve whose control points are half the gap out (at
 * least {@link MIN_CONTROL_OFFSET}); one behind, but clear of the source
 * across the axis, an S-shaped one; one behind and in line with it, two
 * curves that turn round outside both nodes.
 */
const curveBetween = (
  start: AxisPoint,
  end: AxisPoint,
  source: AxisBox,
  target: AxisBox,
): Segments<AxisSegment> => {
  const gap = end.main - start.main;

  if (gap >= 0) {
    return [straightOn(start, end, Math.max(MIN_CONTROL_OFFSET, gap / 2))];
  }

  const crossGap = Math.max(
    target.crossStart - source.crossEnd,
    source.crossStart - target.crossEnd,
  );

  if (crossGap >= MIN_CROSS_GAP) {
    return [
      straightOn(
        start,
        end,
        Math.max(
          MIN_CONTROL_OFFSET,
          Math.min(-gap, Math.abs(end.cross - start.cross)) / 2,
        ),
      ),
    ];
  }

  const below =
    target.crossStart + target.crossEnd >= source.crossStart + source.crossEnd;

  const turn: AxisPoint = {
    main: (start.main + end.main) / 2,
    cross: below
      ? Math.max(source.crossEnd, target.crossEnd) + DETOUR_CLEARANCE
      : Math.min(source.crossStart, target.crossStart) - DETOUR_CLEARANCE,
  } as const;

  const reach = Math.max(MIN_CONTROL_OFFSET, -gap / 4);

  return [
    {
      start,
      control1: along(start, MIN_CONTROL_OFFSET),
      control2: along(turn, reach),
      end: turn,
    },
    {
      start: turn,
      control1: along(turn, -reach),
      control2: along(end, -MIN_CONTROL_OFFSET),
      end,
    },
  ];
};

const straightOn = (
  start: AxisPoint,
  end: AxisPoint,
  offset: number,
): AxisSegment =>
  ({
    start,
    control1: along(start, offset),
    control2: along(end, -offset),
    end,
  }) as const;

const along = (point: AxisPoint, distance: number): AxisPoint =>
  ({
    main: point.main + distance,
    cross: point.cross,
  }) as const;

/** The middle of the whole curve: of the one segment, or where two meet. */
const midpointOf = (segments: Segments<AxisSegment>): AxisPoint => {
  const [first] = segments;

  if (segments.length === 2) {
    return first.end;
  }

  const middle = cubicPoint(
    {
      start: { x: first.start.main, y: first.start.cross },
      control1: { x: first.control1.main, y: first.control1.cross },
      control2: { x: first.control2.main, y: first.control2.cross },
      end: { x: first.end.main, y: first.end.cross },
    },
    0.5,
  );

  return { main: middle.x, cross: middle.y };
};

const mapSegments = (
  segments: Segments<AxisSegment>,
  toPoint: (point: AxisPoint) => Point,
): Segments<CubicSegment> =>
  segments.length === 1
    ? ([mapSegment(segments[0], toPoint)] as const)
    : ([
        mapSegment(segments[0], toPoint),
        mapSegment(segments[1], toPoint),
      ] as const);

const mapSegment = (
  segment: AxisSegment,
  toPoint: (point: AxisPoint) => Point,
): CubicSegment =>
  ({
    start: toPoint(segment.start),
    control1: toPoint(segment.control1),
    control2: toPoint(segment.control2),
    end: toPoint(segment.end),
  }) as const;
