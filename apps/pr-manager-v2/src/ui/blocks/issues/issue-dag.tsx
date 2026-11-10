import {
  combine,
  createState,
  map,
  onScopeDispose,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr, fastDeepEqual, Num, Result } from 'ts-data-forge';
import {
  bestFreeColumns,
  fitScale,
  layoutDag,
  NATURAL_ZOOM,
  zoomInFrom,
  zoomOutFrom,
  type DagLayout,
  type DagZoom,
} from '../../../domain/index.mjs';
import type { IssuesBlockView, IssuesStore } from '../../../store/index.mjs';
import { DagFreeCaption } from './dag-free-caption.js';
import { DagLegend } from './dag-legend.js';
import { DagNodeShape } from './dag-node-shape.js';

type Ready = IssuesBlockView & Readonly<{ kind: 'ready' }>;

type Props = Readonly<{
  view: InitializedObservable<Ready>;
  store: IssuesStore;
  now: InitializedObservable<number>;
}>;

/**
 * The open issues as a graph of what each waits for, read left to right (spec
 * §11.3), in a box that scrolls over it at the zoom chosen above it. The
 * `viewBox` stays the layout's; what is scaled is the size the SVG takes.
 */
export const IssueDag = ({ view, store, now }: Props): JSX.Element => {
  const [box, setBox] = createState({ width: 0, height: 0 });

  const mut_scroller: { element: HTMLElement | undefined } = {
    element: undefined,
  };

  // Laid out again only when the graph changes, or the box while fitting: the
  // view also changes with the list's search box, which the DAG does not read,
  // and at a chosen zoom the box only scrolls.
  // Compared by value: every read builds a new graph, and one with nothing
  // changed is not laid out again.
  const graph = view
    .pipe(map((v) => v.graph))
    .pipe(skipIfNoChange(fastDeepEqual));

  const fitBox = combine([store.zoom, box])
    .pipe(map(([zoom, size]) => (zoom.kind === 'fit' ? size : undefined)))
    .pipe(skipIfNoChange(sameBox));

  const laidOutGraph = combine([graph, fitBox]).pipe(
    map(([g, size]) =>
      layoutDag(
        g,
        size === undefined
          ? undefined
          : bestFreeColumns(g, size.width, size.height),
      ),
    ),
  );

  const drawn = combine([laidOutGraph, store.zoom, box]).pipe(
    map(([laidOut, zoom, size]) => ({
      layout: laidOut,
      scale: zoom.kind === 'fit' ? fitScale(padded(laidOut), size) : zoom.scale,
    })),
  );

  /** Moves to `next`, keeping the point at the middle of the box there. */
  const zoomTo = (next: DagZoom): void => {
    const element = mut_scroller.element;

    const { scale } = drawn.getSnapshot().value;

    store.setZoom(next);

    if (element === undefined || next.kind === 'fit' || !Num.isNonZero(scale)) {
      return;
    }

    const cx = Num.div(element.scrollLeft + element.clientWidth / 2, scale);

    const cy = Num.div(element.scrollTop + element.clientHeight / 2, scale);

    requestAnimationFrame(() => {
      element.scrollTo({
        left: Math.max(0, cx * next.scale - element.clientWidth / 2),
        top: Math.max(0, cy * next.scale - element.clientHeight / 2),
      });
    });
  };

  const observe = (element: HTMLElement): void => {
    mut_scroller.element = element;

    const measure = (): void => {
      setBox({
        width: Math.floor(element.clientWidth),
        height: Math.floor(roomBelow(element)),
      });
    };

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    const body = element.closest('.block-body');

    if (body !== null) {
      observer.observe(body);
    }

    globalThis.addEventListener('resize', measure);

    onScopeDispose(() => {
      observer.disconnect();

      globalThis.removeEventListener('resize', measure);
    });
  };

  return (
    <div class={constant('dag')}>
      <div
        class={constant('dag-zoom')}
        role={constant('group')}
        aria-label={constant('Zoom')}
      >
        <button
          aria-label={constant('Zoom out')}
          class={constant('button')}
          type={constant('button')}
          onClick={() => {
            zoomTo({
              kind: 'scale',
              scale: zoomOutFrom(drawn.getSnapshot().value.scale),
            });
          }}
        >
          {constant('−')}
        </button>
        <span class={constant('dag-scale')}>
          {drawn.pipe(map(({ scale }) => `${Math.round(scale * 100)}%`))}
        </span>
        <button
          aria-label={constant('Zoom in')}
          class={constant('button')}
          type={constant('button')}
          onClick={() => {
            zoomTo({
              kind: 'scale',
              scale: zoomInFrom(drawn.getSnapshot().value.scale),
            });
          }}
        >
          {constant('+')}
        </button>
        <button
          aria-pressed={store.zoom.pipe(map((z) => z.kind === 'fit'))}
          class={constant('button')}
          title={constant(
            'Draw it all in the box, never above 100%, following the box as it resizes; the nodes with no edge are laid out to draw the graph largest.',
          )}
          type={constant('button')}
          onClick={() => {
            zoomTo({ kind: 'fit' });
          }}
        >
          {constant('Fit')}
        </button>
        <button
          class={constant('button')}
          type={constant('button')}
          onClick={() => {
            zoomTo(NATURAL_ZOOM);
          }}
        >
          {constant('100%')}
        </button>
      </div>

      <If
        cond={graph.pipe(map(({ nodes }) => Arr.isEmpty(nodes)))}
        then={
          <p class={constant('muted')}>
            {view.pipe(
              map(({ rows }) =>
                rows.size === 0
                  ? 'No open issues.'
                  : 'No open issue has the tiers and in progress shown.',
              ),
            )}
          </p>
        }
      />

      <div class={constant('dag-box')} ref={observe}>
        <svg
          aria-label={constant('What each open issue waits for')}
          class={constant('dag-svg')}
          height={drawn.pipe(
            map(({ layout, scale }) =>
              Math.floor((layout.height + 2 * PAD) * scale).toString(),
            ),
          )}
          role={constant('img')}
          viewBox={drawn.pipe(
            map(
              ({ layout }) =>
                `${-PAD} ${-PAD} ${layout.width + 2 * PAD} ${layout.height + 2 * PAD}`,
            ),
          )}
          width={drawn.pipe(
            map(({ layout, scale }) =>
              Math.floor((layout.width + 2 * PAD) * scale).toString(),
            ),
          )}
        >
          <defs>
            <marker
              id={constant('dag-arrow')}
              markerHeight={constant('8')}
              markerWidth={constant('8')}
              orient={constant('auto')}
              refX={constant('8')}
              refY={constant('4')}
              viewBox={constant('0 0 8 8')}
            >
              <path
                class={constant('dag-arrow')}
                d={constant('M0,0 L8,4 L0,8 z')}
              />
            </marker>
          </defs>
          <For
            items={drawn.pipe(map(({ layout }) => layout.edges))}
            key={({ edge }) => `${edge.kind}-${edge.from}-${edge.to}`}
          >
            {(edge$) => (
              <path
                class={edge$.pipe(
                  map(({ edge }) => `dag-edge dag-edge-${edge.kind}`),
                )}
                d={edge$.pipe(map(({ path }) => path))}
                marker-end={edge$.pipe(
                  map(({ edge }) =>
                    edge.kind === 'waits' ? 'url(#dag-arrow)' : '',
                  ),
                )}
              />
            )}
          </For>
          <DagFreeCaption layout={drawn.pipe(map(({ layout }) => layout))} />
          <For
            items={drawn.pipe(map(({ layout }) => layout.nodes))}
            key={({ node }) => node.id}
          >
            {(placed$) => <DagNodeShape now={now} placed={placed$} />}
          </For>
        </svg>
      </div>

      <DagLegend />
    </div>
  );
};

/** Room around the layout for the strokes at its edges. */
const PAD = 8;

const padded = (
  layout: DagLayout,
): Readonly<{ width: number; height: number }> =>
  ({
    width: layout.width + 2 * PAD,
    height: layout.height + 2 * PAD,
  }) as const;

const sameBox = (
  a: Readonly<{ width: number; height: number }> | undefined,
  b: Readonly<{ width: number; height: number }> | undefined,
): boolean => a?.width === b?.width && a?.height === b?.height;

/**
 * The height a fit may fill, read from what holds the box and never from the
 * box, whose height follows the drawing (a fit read from it would read back its
 * own last answer and shrink a step every resize): in a block that scrolls on
 * its own, the rest of that block below the box's top; elsewhere, as much as
 * the box may grow, 70% of the window.
 */
const roomBelow = (element: HTMLElement): number => {
  const body = element.closest('.block-body');

  if (
    body instanceof HTMLElement &&
    getComputedStyle(body).overflowY === 'auto'
  ) {
    const top =
      element.getBoundingClientRect().top -
      body.getBoundingClientRect().top +
      body.scrollTop;

    return Math.max(
      0,
      body.clientHeight -
        top -
        Result.unwrapOkOr(
          Num.safeParseFloat(getComputedStyle(body).paddingBottom),
          0,
        ),
    );
  }

  return window.innerHeight * 0.7;
};
