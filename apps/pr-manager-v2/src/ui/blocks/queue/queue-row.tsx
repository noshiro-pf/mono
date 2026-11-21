import {
  createState,
  map,
  onCleanup,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Num, Optional } from 'ts-data-forge';
import type { QueueBox, QueueView } from '../../../domain/index.mjs';
import { dragFrom } from '../../layout/index.mjs';
import { arcLevelOf, QueueLayerBox } from './queue-layer-box.js';

type Props = Readonly<{ view: InitializedObservable<QueueView> }>;

/**
 * The queue in one row of joined boxes after the base it merges into: what is
 * running, held at the start, then what the worker picks next in order, then
 * dashed boxes for those whose turn has not come. When the row overflows it
 * scrolls across, its edges fading where there is more, and a map above it, one
 * mark per box, shows a window around the part in view in place of a scroll
 * bar: the window drags like a thumb, a press elsewhere jumps there, and a
 * mouse wheel over either scrolls the row across until it is at its end.
 */
export const QueueRow = ({ view }: Props): JSX.Element => {
  const [metrics, setMetrics] = createState<Metrics>({
    left: 0,
    width: 0,
    client: 0,
  });

  const mut_scroller: { element: HTMLElement | undefined } = {
    element: undefined,
  };

  const boxes = view.pipe(
    map(({ running, next, waiting }) => [
      ...running.map((box) => ({
        box,
        kind: 'running' as const,
        place: 'running',
      })),
      ...[
        ...next.map((box) => ({ box, kind: 'next' as const })),
        ...waiting.map((box) => ({ box, kind: 'waiting' as const })),
      ].map((item, index) => ({
        ...item,
        place: index === 0 ? 'next' : (index + 1).toString(),
      })),
    ]),
  );

  const overflows = metrics.pipe(
    map(({ width, client }) => width > client + 1),
  );

  const frame = metrics.pipe(
    map(({ left, width, client }) =>
      Num.isNonZero(width)
        ? {
            left: `${Num.div(left * 100, width)}%`,
            width: `${Num.div(client * 100, width)}%`,
          }
        : { left: '0%', width: '100%' },
    ),
  );

  /** Scrolls so that the window's left edge sits at `fraction` of the map. */
  const scrollTo = (fraction: number): void => {
    const element = mut_scroller.element;

    if (element !== undefined) {
      element.scrollTo({ left: fraction * element.scrollWidth });
    }
  };

  // A vertical wheel turned over the row scrolls it across, and leaves the page
  // to scroll on once the row is at its end: a mouse wheel cannot be told from
  // a trackpad's vertical swipe, and turning one over the row is what this is
  // for.
  const onWheel = (event: WheelEvent): void => {
    const element = mut_scroller.element;

    if (
      element === undefined ||
      event.ctrlKey ||
      Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
      element.scrollWidth <= element.clientWidth + 1
    ) {
      return;
    }

    const delta =
      event.deltaY *
      (event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? LINE_PIXELS
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? element.clientWidth
          : 1);

    const max = element.scrollWidth - element.clientWidth;

    const left = Math.min(Math.max(element.scrollLeft + delta, 0), max);

    if (Math.abs(left - element.scrollLeft) < 1) {
      return;
    }

    event.preventDefault();

    element.scrollTo({ left });
  };

  const observe = (element: HTMLElement): void => {
    mut_scroller.element = element;

    const measure = (): void => {
      setMetrics({
        left: element.scrollLeft,
        width: element.scrollWidth,
        client: element.clientWidth,
      });
    };

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    // The map's window follows the scroll position itself, which no observer
    // reports: an IntersectionObserver says what is in view, not by how much.
    // eslint-disable-next-line unicorn/prefer-observer-apis
    element.addEventListener('scroll', measure, { passive: true });

    const subscription = view.subscribe(() => {
      queueMicrotask(measure);
    });

    onCleanup(() => {
      observer.disconnect();

      element.removeEventListener('scroll', measure);

      subscription();
    });
  };

  return (
    <div class={constant('queue-row')}>
      <span class={constant('queue-base')}>
        {view.pipe(map(({ base }) => base))}
        <span aria-hidden={constant('true')}>{constant(' ←')}</span>
      </span>

      <div
        class={constant('queue-track')}
        data-arc-level={view.pipe(map(arcRoomOf))}
        data-more-after={metrics.pipe(
          map(({ left, width, client }) =>
            (left + client < width - 1).toString(),
          ),
        )}
        data-more-before={metrics.pipe(
          map(({ left }) => (left > 1).toString()),
        )}
        data-overflows={overflows.pipe(map((o) => o.toString()))}
        onWheel={onWheel}
      >
        <If
          cond={overflows}
          then={
            <div
              aria-hidden={constant('true')}
              class={constant('queue-map')}
              onPointerDown={(event) => {
                const box = event.currentTarget.getBoundingClientRect();

                const mapWidth = box.width;

                const { width, client, left } = Optional.unwrap(
                  metrics.getSnapshot(),
                );

                if (!Num.isNonZero(mapWidth) || !Num.isNonZero(width)) {
                  return;
                }

                const visible = Num.div(client, width);

                const frameStart = Num.div(left, width);

                const at = Num.div(event.clientX - box.left, mapWidth);

                // On the window: drag it from where it was taken. Elsewhere:
                // jump so the window is centred there, then drag from its
                // middle.
                const grip =
                  frameStart <= at && at <= frameStart + visible
                    ? at - frameStart
                    : visible / 2;

                scrollTo(at - grip);

                dragFrom(event, (x) => {
                  scrollTo(Num.div(x - box.left, mapWidth) - grip);
                });
              }}
            >
              <For items={boxes} key={({ box }) => box.number}>
                {(item$) => (
                  <span
                    class={constant('queue-map-mark')}
                    data-kind={item$.pipe(
                      map(({ box, kind }) =>
                        kind === 'waiting' && box.failing ? 'failing' : kind,
                      ),
                    )}
                    data-priority={item$.pipe(map(({ box }) => box.priority))}
                  />
                )}
              </For>
              <span
                class={constant('queue-map-window')}
                style={{
                  left: frame.pipe(map((f) => f.left)),
                  width: frame.pipe(map((f) => f.width)),
                }}
              />
            </div>
          }
        />

        <ol class={constant('queue')} ref={observe}>
          <For items={boxes} key={({ box }) => box.number}>
            {(item$) => (
              <QueueLayerBox
                box={item$.pipe(map(({ box }) => box))}
                kind={item$.pipe(map(({ kind }) => kind))}
                place={item$.pipe(map(({ place }) => place))}
              />
            )}
          </For>
        </ol>
      </div>
    </div>
  );
};

type Metrics = Readonly<{ left: number; width: number; client: number }>;

/** A wheel's line, in pixels, about what a browser scrolls a page by. */
const LINE_PIXELS = 20;

/** The highest arc in the row, which the room above the boxes is made for. */
const arcRoomOf = ({ running, next, waiting }: QueueView): string =>
  Math.max(
    0,
    ...[...running, ...next, ...waiting].flatMap(({ arcs }: QueueBox) =>
      arcs.map(({ span }) => arcLevelOf(span)),
    ),
  ).toString();
