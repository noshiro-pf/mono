import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import { outlineOf, type LaidOutNode, type Point } from '../dag/index.mjs';
import type { ConnectOverlayState } from './dag-canvas-scene.mjs';

type Props = Readonly<{
  overlay: InitializedObservable<ConnectOverlayState>;
}>;

/**
 * Drawing a dependency, over the nodes (`dag-canvas.tsx`): the handle on a
 * node's outline where the pointer is near it, a circle a press there draws an
 * arrow from; then the arrow, from that circle to the pointer, and the node it
 * would join outlined — dashed and in the danger colour when the dependency
 * would be refused. Takes no pointer events: the canvas finds the nodes under
 * the pointer itself.
 */
export const DagConnectOverlay = ({ overlay }: Props): JSX.Element => (
  <g
    aria-hidden={constant('true')}
    class={constant('dag-connect')}
    data-e2e={constant('dag-connect')}
    data-refused={overlay.pipe(
      map(({ target }) => (target?.refused ?? false).toString()),
    )}
  >
    <If
      cond={overlay.pipe(map((state) => around(state)?.kind === 'task'))}
      then={
        <rect
          class={constant('dag-connect-target')}
          height={overlay.pipe(map((state) => around(state)?.height ?? 0))}
          rx={constant(TASK_RX + TARGET_GAP)}
          width={overlay.pipe(map((state) => around(state)?.width ?? 0))}
          x={overlay.pipe(map((state) => around(state)?.x ?? 0))}
          y={overlay.pipe(map((state) => around(state)?.y ?? 0))}
        />
      }
    />
    <If
      cond={overlay.pipe(map((state) => around(state)?.kind === 'milestone'))}
      then={
        <polygon
          class={constant('dag-connect-target')}
          points={overlay.pipe(
            map((state) => {
              const node = around(state);

              return node === undefined
                ? ''
                : outlineOf(node)
                    .map(({ x, y }) => `${x},${y}`)
                    .join(' ');
            }),
          )}
        />
      }
    />
    <If
      cond={overlay.pipe(map(({ connecting }) => connecting !== undefined))}
      then={
        <line
          class={constant('dag-connect-line')}
          marker-end={overlay.pipe(
            map(({ target }) =>
              target?.refused === true
                ? 'url(#dag-arrow-refused)'
                : 'url(#dag-arrow-connect)',
            ),
          )}
          x1={overlay.pipe(map(({ anchor }) => anchor.x))}
          x2={overlay.pipe(map((state) => arrowTo(state).x))}
          y1={overlay.pipe(map(({ anchor }) => anchor.y))}
          y2={overlay.pipe(map((state) => arrowTo(state).y))}
        />
      }
    />
    <circle
      class={constant('dag-connect-handle')}
      cx={overlay.pipe(map(({ anchor }) => anchor.x))}
      cy={overlay.pipe(map(({ anchor }) => anchor.y))}
      data-e2e={constant('dag-connect-handle')}
      r={overlay.pipe(
        map(({ scale }) =>
          Num.isNonZero(scale)
            ? Num.div(HANDLE_RADIUS_PX, scale)
            : HANDLE_RADIUS_PX,
        ),
      )}
    />
  </g>
);

/** Of the handle, on the screen. */
const HANDLE_RADIUS_PX = 6;

/** Between a node's outline and the outline drawn round it. */
const TARGET_GAP = 4;

/** A task's corners, as `dag-task-node.tsx` rounds them. */
const TASK_RX = 8;

/** `node` grown by {@link TARGET_GAP} on every side. */
const grown = (node: LaidOutNode): LaidOutNode =>
  ({
    ...node,
    x: node.x - TARGET_GAP,
    y: node.y - TARGET_GAP,
    width: node.width + 2 * TARGET_GAP,
    height: node.height + 2 * TARGET_GAP,
  }) as const;

/** The outline drawn round the node the arrow would be dropped on. */
const around = (state: ConnectOverlayState): LaidOutNode | undefined =>
  state.target === undefined ? undefined : grown(state.target.node);

/** Where the arrow being drawn ends: at the pointer. */
const arrowTo = (state: ConnectOverlayState): Point =>
  state.connecting?.to ?? state.anchor;
