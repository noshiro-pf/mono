/**
 * The edges routed round the nodes (`edge-routing.mts`) run along the lines of
 * one grid, so two that go through the same gap find the same line and are
 * drawn on top of each other, or turn off it across each other. Here every
 * stretch that runs along a line another edge runs along too is moved off it,
 * side by side with the others, {@link LANE_GAP} apart — as far as the nodes on
 * either side leave room — in the order that has them cross the fewest times
 * where they turn off it.
 *
 * Only the stretches between two turns move: the first and the last of an edge,
 * which leave and enter a node at its port, stay where they are.
 */

import { Arr, Num } from 'ts-data-forge';
import type { AxisBox, AxisPoint } from './edge-geometry.mjs';

/** How far apart the edges sharing a line are drawn, room allowing. */
export const LANE_GAP = 8;

/**
 * The `paths` — each the points where an edge turns, both ends included, of the
 * edge `id` — with the stretches that share a line spread across it, kept
 * `clearance` clear of every one of `boxes`. In the order given.
 */
export const separateLanes = (
  paths: readonly Readonly<{ id: string; corners: readonly AxisPoint[] }>[],
  boxes: readonly AxisBox[],
  clearance: number,
): readonly (readonly AxisPoint[])[] => {
  const stretches = paths.flatMap(({ id, corners }, path) =>
    // Neither the first stretch nor the last.
    corners.slice(1, -2).flatMap((from, offset) => {
      const index = offset + 1;

      const to = corners[index + 1];

      const before = corners[index - 1];

      const after = corners[index + 2];

      if (to === undefined || before === undefined || after === undefined) {
        return [];
      }

      const along = Math.abs(from.cross - to.cross) < EPSILON;

      const read = along ? ALONG : ACROSS;

      // The end nearer the start of the line, and the far one, each with the
      // corner beyond it.
      const [low, lowBeyond, high, highBeyond] =
        read.run(from) <= read.run(to)
          ? ([from, before, to, after] as const)
          : ([to, after, from, before] as const);

      return [
        {
          id,
          path,
          index,
          along,
          level: read.level(from),
          low: read.run(low),
          high: read.run(high),
          lowSide: Math.sign(read.level(lowBeyond) - read.level(low)),
          highSide: Math.sign(read.level(highBeyond) - read.level(high)),
        } as const satisfies Stretch,
      ];
    }),
  );

  // By path, then by the index of the stretch's first corner: how far that
  // stretch moves, across itself.
  const mut_shifts = new Map<string, number>();

  for (const bundle of bundlesOf(stretches)) {
    const shifts = laneShifts(bundle, boxes, clearance);

    for (const [index, stretch] of bundle.entries()) {
      const shift = shifts[index] ?? 0;

      if (shift !== 0) {
        mut_shifts.set(`${stretch.path} ${stretch.index}`, shift);
      }
    }
  }

  return paths.map(({ corners }, path) =>
    corners.map((corner, index) => {
      // A corner ends the stretch before it and starts the one after: one runs
      // along, the other across, and each moves it on its own axis.
      const startsAlong = isAlong(corner, corners[index + 1]);

      const fromStarting = mut_shifts.get(`${path} ${index}`) ?? 0;

      const fromEnding = mut_shifts.get(`${path} ${index - 1}`) ?? 0;

      const crossShift = startsAlong ? fromStarting : fromEnding;

      const mainShift = startsAlong ? fromEnding : fromStarting;

      return crossShift === 0 && mainShift === 0
        ? corner
        : ({
            main: corner.main + mainShift,
            cross: corner.cross + crossShift,
          } as const);
    }),
  );
};

/**
 * The `paths` — each the points where an edge from the node `from` to the node
 * `to` turns, both ends included — with the routed edges that leave one side of
 * a node, or enter it, given its ports there in the order they come from: the
 * edge that comes from lowest across takes the lowest port.
 * A port is given by the curves (`edge-geometry.mts`) in the order of the nodes
 * at the other ends, which a path round the nodes may not keep, so that two
 * edges arriving cross in front of the node. A side is left as it is where a
 * path, moved to its new port, would come within `clearance` of one of `boxes`
 * other than its own two.
 */
export const orderPorts = (
  paths: readonly Readonly<{
    from: string;
    to: string;
    corners: readonly AxisPoint[];
  }>[],
  boxes: ReadonlyMap<string, AxisBox>,
  clearance: number,
): readonly (readonly AxisPoint[])[] => {
  const mut_corners = paths.map(({ corners }) => Array.from(corners));

  for (const end of ['start', 'end'] as const) {
    const sides = Map.groupBy(
      paths.flatMap(({ from, to, corners }, path) =>
        corners.length < 4 ? [] : [{ node: end === 'start' ? from : to, path }],
      ),
      ({ node }) => node,
    );

    for (const members of sides.values()) {
      if (members.length < 2) {
        continue;
      }

      const ends = members.map(({ path }) => {
        const corners = mut_corners[path] ?? [];

        const at = (index: number): AxisPoint =>
          corners.at(end === 'start' ? index : -1 - index) ?? ORIGIN;

        return { path, port: at(0), approach: at(2).cross };
      });

      const ports = ends
        .map(({ port }) => port)
        .toSorted((a, b) => a.cross - b.cross);

      const assigned = ends
        .toSorted((a, b) =>
          firstNonZero(a.approach - b.approach, a.port.cross - b.port.cross),
        )
        .map((member, index) => ({
          ...member,
          port: ports[index] ?? member.port,
        }));

      if (
        assigned.every(
          ({ path, port }) => ends.find((e) => e.path === path)?.port === port,
        )
      ) {
        continue;
      }

      const moved = assigned.map(({ path, port }) => {
        const corners = mut_corners[path] ?? [];

        const turn = end === 'start' ? 1 : corners.length - 2;

        const next = corners.map((corner, index) =>
          index === (end === 'start' ? 0 : corners.length - 1)
            ? port
            : index === turn
              ? { main: corner.main, cross: port.cross }
              : corner,
        );

        return { path, corners: next };
      });

      const clear = moved.every(({ path, corners }) => {
        const own = paths[path];

        const others = Array.from(boxes)
          .filter(([id]) => id !== own?.from && id !== own?.to)
          .map(([, box]) => box);

        // The two pieces either side of the turn that moved.
        const first = end === 'start' ? 0 : corners.length - 3;

        return [first, first + 1].every((index) => {
          const a = corners[index];

          const b = corners[index + 1];

          return (
            a === undefined ||
            b === undefined ||
            others.every((box) => !crosses(a, b, box, clearance))
          );
        });
      });

      if (!clear) {
        continue;
      }

      for (const { path, corners } of moved) {
        mut_corners[path] = corners;
      }
    }
  }

  return mut_corners;
};

const ORIGIN: AxisPoint = { main: 0, cross: 0 } as const;

/** Whether the straight piece from `a` to `b` comes within `margin` of `box`. */
const crosses = (
  a: AxisPoint,
  b: AxisPoint,
  box: AxisBox,
  margin: number,
): boolean =>
  Math.max(a.main, b.main) > box.mainStart - margin &&
  Math.min(a.main, b.main) < box.mainEnd + margin &&
  Math.max(a.cross, b.cross) > box.crossStart - margin &&
  Math.min(a.cross, b.cross) < box.crossEnd + margin;

/**
 * A stretch between two turns: of the path `path`, from its corner `index`;
 * along the main axis or across it, at `level` on the other, from `low` to
 * `high`; turning off at each end to the side `lowSide` and `highSide` say,
 * -1 or 1.
 */
type Stretch = Readonly<{
  id: string;
  path: number;
  index: number;
  along: boolean;
  level: number;
  low: number;
  high: number;
  lowSide: number;
  highSide: number;
}>;

/** How a point is read for a stretch along an axis: along it, and across. */
type Reading = Readonly<{
  run: (point: AxisPoint) => number;
  level: (point: AxisPoint) => number;
}>;

const ALONG: Reading = {
  run: ({ main }) => main,
  level: ({ cross }) => cross,
} as const;

const ACROSS: Reading = {
  run: ({ cross }) => cross,
  level: ({ main }) => main,
} as const;

/** Coordinates closer than this are one. */
const EPSILON = 1e-6;

const isAlong = (from: AxisPoint, to: AxisPoint | undefined): boolean =>
  to !== undefined && Math.abs(from.cross - to.cross) < EPSILON;

/** `sorted`, by level, cut where two levels are {@link LANE_GAP} apart. */
const bandsOf = (
  sorted: readonly Stretch[],
): readonly (readonly Stretch[])[] => {
  const mut_bands: Stretch[][] = [];

  for (const stretch of sorted) {
    const mut_band = mut_bands.at(-1);

    const last = mut_band?.at(-1);

    if (
      mut_band !== undefined &&
      last !== undefined &&
      stretch.level - last.level < LANE_GAP
    ) {
      mut_band.push(stretch);
    } else {
      mut_bands.push([stretch]);
    }
  }

  return mut_bands;
};

/** The first of `differences` that is not 0, for an order by several keys. */
const firstNonZero = (...differences: readonly number[]): number =>
  differences.find((difference) => difference !== 0) ?? 0;

/** `band` cut where no stretch of it overlaps the next along the line. */
const overlapping = (
  band: readonly Stretch[],
): readonly (readonly Stretch[])[] => {
  const mut_runs: Stretch[][] = [];

  let mut_reach = Number.NEGATIVE_INFINITY;

  for (const stretch of band.toSorted((a, b) =>
    firstNonZero(a.low - b.low, a.path - b.path),
  )) {
    const mut_run = mut_runs.at(-1);

    if (mut_run !== undefined && stretch.low < mut_reach - EPSILON) {
      mut_run.push(stretch);

      mut_reach = Math.max(mut_reach, stretch.high);
    } else {
      mut_runs.push([stretch]);

      mut_reach = stretch.high;
    }
  }

  return mut_runs;
};

/**
 * The stretches that share a line with one another, or run closer to it than
 * {@link LANE_GAP}, each set in no order: on one axis, each overlapping
 * another, of two paths or more.
 */
const bundlesOf = (
  stretches: readonly Stretch[],
): readonly (readonly Stretch[])[] =>
  [true, false]
    .flatMap((along) =>
      bandsOf(
        stretches
          .filter((stretch) => stretch.along === along)
          .toSorted((a, b) => firstNonZero(a.level - b.level, a.low - b.low)),
      ),
    )
    .flatMap(overlapping)
    .filter((bundle) => Arr.uniq(bundle.map(({ path }) => path)).length > 1);

/**
 * Where a stretch goes among the others of its line, lowest first. One that
 * turns off to the low side goes below one that turns off to the high side;
 * of two that turn off to the same side at the same end, the one that turns
 * further out goes further from that side, round the other's turn rather than
 * across it.
 */
const laneKey = (stretch: Stretch, low: number, high: number): number => {
  const span = high - low + 1;

  const atLow = stretch.lowSide * (span + (stretch.low - low));

  const atHigh = stretch.highSide * (span + (high - stretch.high));

  return atLow + atHigh;
};

const compareIds = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * How far each stretch of `bundle` moves across its line: side by side, in
 * order, {@link LANE_GAP} apart or as close as the room between `boxes` makes
 * them, round the line where the room allows. Nothing moves where there is no
 * room.
 */
const laneShifts = (
  bundle: readonly Stretch[],
  boxes: readonly AxisBox[],
  clearance: number,
): readonly number[] => {
  const first = bundle[0];

  if (first === undefined) {
    return [];
  }

  const { along } = first;

  // Round the middle of the lines the stretches are on.
  const level =
    (Math.min(...bundle.map((stretch) => stretch.level)) +
      Math.max(...bundle.map((stretch) => stretch.level))) /
    2;

  const low = Math.min(...bundle.map((stretch) => stretch.low));

  const high = Math.max(...bundle.map((stretch) => stretch.high));

  let mut_floor = Number.NEGATIVE_INFINITY;

  let mut_ceiling = Number.POSITIVE_INFINITY;

  for (const box of boxes) {
    const runStart = (along ? box.mainStart : box.crossStart) - clearance;

    const runEnd = (along ? box.mainEnd : box.crossEnd) + clearance;

    if (runEnd <= low || runStart >= high) {
      continue;
    }

    const levelStart = (along ? box.crossStart : box.mainStart) - clearance;

    const levelEnd = (along ? box.crossEnd : box.mainEnd) + clearance;

    if (levelEnd <= level + EPSILON) {
      mut_floor = Math.max(mut_floor, levelEnd);
    } else if (levelStart >= level - EPSILON) {
      mut_ceiling = Math.min(mut_ceiling, levelStart);
    } else {
      // On the line already too close to a box: squeezed in, and left so.
      return bundle.map(() => 0);
    }
  }

  const gaps = bundle.length - 1;

  const room = Math.min(LANE_GAP * gaps, mut_ceiling - mut_floor);

  if (room <= 0 || !Num.isNonZero(gaps)) {
    return bundle.map(() => 0);
  }

  const spacing = Num.div(room, gaps);

  // Round the line, moved inside the room if it reaches past either side.
  const centred = level - room / 2;

  const lowest = Math.min(Math.max(centred, mut_floor), mut_ceiling - room);

  const order = bundle
    .map((stretch, index) => ({ index, key: laneKey(stretch, low, high) }))
    .toSorted((a, b) =>
      firstNonZero(
        a.key - b.key,
        compareIds(bundle[a.index]?.id ?? '', bundle[b.index]?.id ?? ''),
      ),
    );

  const mut_shifts = bundle.map(() => 0);

  for (const [lane, { index }] of order.entries()) {
    mut_shifts[index] =
      lowest + lane * spacing - (bundle[index]?.level ?? level);
  }

  return mut_shifts;
};
