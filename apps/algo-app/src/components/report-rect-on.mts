import { onScopeDispose, type InitializedObservable } from 'synstate';
import type { Rect } from 'ts-utils-additional';
import { subscribeInScope } from './scope-effects.mjs';

/**
 * Measures the element given to the returned `ref` after every value of
 * `measureOn`, the current one included — once the update that brought it has
 * been drawn — and reports its rect when it differs from the last one
 * reported, so that an update that moved nothing writes nothing.
 *
 * The measurements requested during one update are taken together: every rect
 * is read before any is reported, since a report writes positions that the page
 * draws at once, and a read after that write would lay the page out again.
 */
export const reportRectOn = (
  measureOn: InitializedObservable<unknown>,
  onRect: (rect: Rect) => void,
): ((element: MeasurableElement) => void) => {
  const mut_state: {
    element: MeasurableElement | undefined;
    last: Rect | undefined;
    alive: boolean;
    scheduled: boolean;
  } = { element: undefined, last: undefined, alive: true, scheduled: false };

  onScopeDispose(() => {
    mut_state.alive = false;
  });

  const measure = (): (() => void) | undefined => {
    mut_state.scheduled = false;

    if (!mut_state.alive || mut_state.element === undefined) {
      return undefined;
    }

    const { top, left, width, height } =
      mut_state.element.getBoundingClientRect();

    const rect: Rect = { top, left, width, height } as const;

    if (mut_state.last !== undefined && isSameRect(mut_state.last, rect)) {
      return undefined;
    }

    return () => {
      onRect(rect);

      // Taken as reported only once it is: a report that throws is sent again
      // at the next measurement.
      mut_state.last = rect;
    };
  };

  // Several values in one update are measured once.
  subscribeInScope(measureOn, () => {
    if (mut_state.scheduled) {
      return;
    }

    mut_state.scheduled = true;

    scheduleMeasure(measure);
  });

  return (element) => {
    mut_state.element = element;
  };
};

/** What `reportRectOn` reads of an element. */
export type MeasurableElement = Readonly<{
  getBoundingClientRect: () => Rect;
}>;

/** A measurement: reads now, and returns the report to send, if any. */
type Measure = () => (() => void) | undefined;

const mut_pending: { measures: Measure[]; scheduled: boolean } = {
  measures: [],
  scheduled: false,
};

const flushMeasures = (): void => {
  const measures = mut_pending.measures;

  mut_pending.measures = [];

  mut_pending.scheduled = false;

  // One measurement or report that throws keeps no other from running.
  const reports = measures.map(runCaught);

  for (const report of reports) {
    if (report !== undefined) {
      runCaught(report);
    }
  }
};

const scheduleMeasure = (measure: Measure): void => {
  mut_pending.measures.push(measure);

  if (mut_pending.scheduled) {
    return;
  }

  mut_pending.scheduled = true;

  queueMicrotask(flushMeasures);
};

const runCaught = <R,>(fn: () => R): R | undefined => {
  try {
    return fn();
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

const isSameRect = (a: Rect, b: Rect): boolean =>
  a.top === b.top &&
  a.left === b.left &&
  a.width === b.width &&
  a.height === b.height;
