import {
  createState,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Num, Optional } from 'ts-data-forge';
import type { QueueView } from '../../../domain/index.mjs';
import { dragFrom } from '../../layout/index.mjs';
import { QueueLayerBox } from './queue-layer-box.js';

type Props = Readonly<{ view: InitializedObservable<QueueView> }>;

/**
 * The queue in one row of equal boxes: the base and what is running, held at
 * the start, then what the worker picks next in order, then dashed boxes for
 * those whose turn has not come. When the row overflows, a map above it shows
 * one mark per box and a frame around the part in view; the frame drags like a
 * scroll bar's thumb, and a click elsewhere on the map jumps there.
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
      ...running.map((box) => ({ box, place: 'running' as const })),
      ...next.map((box, index) => ({
        box,
        place: index === 0 ? ('next' as const) : (index + 1).toString(),
      })),
      ...waiting.map((box) => ({ box, place: 'waiting' as const })),
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

  /** Scrolls so that the frame's left edge sits at `fraction` of the map. */
  const scrollTo = (fraction: number): void => {
    const element = mut_scroller.element;

    if (element !== undefined) {
      element.scrollTo({ left: fraction * element.scrollWidth });
    }
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

    // The map's frame follows the scroll position itself, which no observer
    // reports: an IntersectionObserver says what is in view, not by how much.
    // eslint-disable-next-line unicorn/prefer-observer-apis
    element.addEventListener('scroll', measure, { passive: true });

    const subscription = view.subscribe(() => {
      queueMicrotask(measure);
    });

    onScopeDispose(() => {
      observer.disconnect();

      element.removeEventListener('scroll', measure);

      subscription.unsubscribe();
    });
  };

  return (
    <div class={constant('queue-rows')}>
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

              // On the frame: drag it from where it was taken. Elsewhere: jump
              // so the frame is centred there, then drag from its middle.
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
                  data-place={item$.pipe(
                    map(({ place }) =>
                      place === 'running' || place === 'waiting'
                        ? place
                        : 'next',
                    ),
                  )}
                />
              )}
            </For>
            <span
              class={constant('queue-map-frame')}
              style={{
                left: frame.pipe(map((f) => f.left)),
                width: frame.pipe(map((f) => f.width)),
              }}
            />
          </div>
        }
      />

      <div class={constant('queue-scroll')} ref={observe}>
        <ol class={constant('queue-row')}>
          <li class={constant('queue-base')}>
            <span class={constant('queue-base-name')}>
              {view.pipe(map(({ base }) => `${base} ←`))}
            </span>
          </li>
          <For items={boxes} key={({ box }) => box.number}>
            {(item$) => (
              <QueueLayerBox
                box={item$.pipe(map(({ box }) => box))}
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
