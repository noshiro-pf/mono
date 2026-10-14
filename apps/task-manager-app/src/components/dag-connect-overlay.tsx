import { memoNamed } from 'preact-utils';
import { Num } from 'ts-data-forge';
import {
  outlineOf,
  type ConnectDrag,
  type ConnectHandle,
  type LaidOutNode,
} from '../dag/index.mjs';

type Props = Readonly<{
  /** The handle under the pointer, while no arrow is being drawn. */
  handle: ConnectHandle | undefined;
  /** The arrow being drawn. */
  connecting: ConnectDrag | undefined;
  /** The node the arrow would be dropped on, and whether that is refused. */
  target: ConnectTarget | undefined;
  /** The view's, for the handle to keep its size on the screen. */
  scale: number;
}>;

/**
 * Drawing a dependency, over the nodes (`dag-canvas.tsx`): the handle on a
 * node's outline where the pointer is near it, a circle a press there draws
 * an arrow from; then the arrow, from that circle to the pointer, and the
 * node it would join outlined — dashed and in the danger colour when the
 * dependency would be refused. Takes no pointer events: the canvas finds the
 * nodes under the pointer itself.
 */
export const DagConnectOverlay = memoNamed<Props>(
  'DagConnectOverlay',
  (props) => {
    const { handle, connecting, target, scale } = props;

    const anchor = connecting?.anchor ?? handle?.at;

    if (anchor === undefined) {
      return undefined;
    }

    const radius = Num.isNonZero(scale)
      ? Num.div(HANDLE_RADIUS_PX, scale)
      : HANDLE_RADIUS_PX;

    const around = target === undefined ? undefined : grown(target.node);

    return (
      <g
        aria-hidden={'true'}
        className={'dag-connect'}
        data-e2e={'dag-connect'}
        data-refused={target?.refused ?? false}
      >
        {around === undefined ? undefined : around.kind === 'task' ? (
          <rect
            className={'dag-connect-target'}
            height={around.height}
            rx={TASK_RX + TARGET_GAP}
            width={around.width}
            x={around.x}
            y={around.y}
          />
        ) : (
          <polygon
            className={'dag-connect-target'}
            points={outlineOf(around)
              .map(({ x, y }) => `${x},${y}`)
              .join(' ')}
          />
        )}
        {connecting === undefined ? undefined : (
          <line
            className={'dag-connect-line'}
            markerEnd={
              target?.refused === true
                ? 'url(#dag-arrow-refused)'
                : 'url(#dag-arrow-connect)'
            }
            x1={anchor.x}
            x2={connecting.to.x}
            y1={anchor.y}
            y2={connecting.to.y}
          />
        )}
        <circle
          className={'dag-connect-handle'}
          cx={anchor.x}
          cy={anchor.y}
          data-e2e={'dag-connect-handle'}
          r={radius}
        />
      </g>
    );
  },
);

/** The node an arrow is about to be dropped on, and whether it is refused. */
export type ConnectTarget = Readonly<{ node: LaidOutNode; refused: boolean }>;

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
