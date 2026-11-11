import {
  createState,
  derive,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, listenInScope, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import {
  computeGeometry,
  dropTargetAt,
  firstPxAtPointer,
  type Divider,
  type DropTarget,
  type LayoutGeometry,
  type PaneId,
  type WorkspaceAction,
} from '../../core/index.mjs';
import type { Session } from '../controller.mjs';
import { DividerHandle } from './divider.js';
import { DropIndicator } from './drop-indicator.js';
import { PaneFrame, type PaneView } from './pane.js';

/**
 * The panes and the dividers, positioned from the layout's geometry (spec L1,
 * L6–L9). Panes are siblings in id order whatever the tree does, because moving
 * an `iframe` in the DOM reloads it. Drags are followed on `window` against the
 * computed rectangles: a pointer over a pane is the frame's.
 */
export const Stage = ({
  session$,
  resetOrigins$,
  dispatch,
  onNavigate,
  onShortcut,
  onToggleResetOrigin,
}: Readonly<{
  session$: InitializedObservable<Session>;
  resetOrigins$: InitializedObservable<readonly string[]>;
  dispatch: (action: WorkspaceAction) => void;
  onNavigate: (paneId: PaneId, input: string) => void;
  onShortcut: (code: string) => void;
  onToggleResetOrigin: (origin: string, enabled: boolean) => void;
}>): JSX.Element => {
  const [size$, setSize] = createState<
    Readonly<{ width: number; height: number }> | undefined
  >(undefined);

  const [drag$, setDrag] = createState<Divider | undefined>(undefined);

  const [move$, setMove, { updateState: updateMove }] = createState<
    Readonly<{ paneId: PaneId; target: DropTarget | undefined }> | undefined
  >(undefined);

  const mut_stage: { element: HTMLElement | undefined } = {
    element: undefined,
  };

  const geometry$ = derive(
    [session$.pipe(map(({ workspace }) => workspace.root)), size$],
    (root, size): LayoutGeometry | undefined =>
      size === undefined
        ? undefined
        : computeGeometry(
            root,
            { left: 0, top: 0, width: size.width, height: size.height },
            gutterPx,
          ),
  );

  const movingId$ = move$.pipe(map((move) => move?.paneId));

  const slots$ = derive(
    [session$, geometry$, movingId$],
    ({ id, workspace }, geometry, movingId): readonly PaneSlot[] => {
      if (id === undefined || geometry === undefined) {
        return [];
      }

      const rects = new Map(
        geometry.panes.map(({ paneId, rect }) => [paneId, rect] as const),
      );

      return Arr.generate(function* () {
        for (const pane of Arr.toSorted(
          workspace.panes,
          (a, b) => a.id - b.id,
        )) {
          const rect = rects.get(pane.id);

          if (rect !== undefined) {
            yield {
              key: `${id}:${pane.id.toString()}`,
              paneId: pane.id,
              view: {
                pane,
                rect,
                active: pane.id === workspace.activePaneId,
                canClose: workspace.panes.length > 1,
                moving: pane.id === movingId,
              },
            };
          }
        }
      });
    },
  );

  const dividers$ = derive(
    [session$, geometry$],
    ({ id }, geometry): readonly Divider[] =>
      id === undefined || geometry === undefined ? [] : geometry.dividers,
  );

  const pointOf = (
    event: Event,
  ): Readonly<{ x: number; y: number }> | undefined => {
    const bounds = mut_stage.element?.getBoundingClientRect();

    return bounds === undefined || !(event instanceof PointerEvent)
      ? undefined
      : { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const resize = (divider: Divider, firstPx: number): void => {
    dispatch({
      type: 'resize',
      path: divider.path,
      firstPx,
      availablePx: divider.availablePx,
    });
  };

  const targetAt = (event: Event): DropTarget | undefined => {
    const move = Optional.unwrap(move$.getSnapshot());

    const geometry = Optional.unwrap(geometry$.getSnapshot());

    const point = pointOf(event);

    return move === undefined || geometry === undefined || point === undefined
      ? undefined
      : dropTargetAt(geometry, point, move.paneId);
  };

  listenInScope(globalThis, 'pointermove', (event) => {
    const drag = Optional.unwrap(drag$.getSnapshot());

    const point = pointOf(event);

    if (drag === undefined || point === undefined) {
      return;
    }

    resize(
      drag,
      firstPxAtPointer(drag, drag.axis === 'row' ? point.x : point.y, gutterPx),
    );
  });

  listenInScope(globalThis, 'pointermove', (event) => {
    if (Optional.unwrap(move$.getSnapshot()) === undefined) {
      return;
    }

    const target = targetAt(event);

    // Replaced only when it names another pane or side: one update per
    // crossing, not one per pixel.
    updateMove((current) =>
      current === undefined ||
      (current.target?.paneId === target?.paneId &&
        current.target?.zone === target?.zone)
        ? current
        : { ...current, target },
    );
  });

  listenInScope(globalThis, 'pointerup', (event) => {
    setDrag(undefined);

    const move = Optional.unwrap(move$.getSnapshot());

    if (move === undefined) {
      return;
    }

    const target = targetAt(event);

    setMove(undefined);

    if (target !== undefined) {
      dispatch({
        type: 'move',
        paneId: move.paneId,
        target: target.paneId,
        zone: target.zone,
      });
    }
  });

  listenInScope(globalThis, 'pointercancel', () => {
    setDrag(undefined);

    setMove(undefined);
  });

  listenInScope(globalThis, 'keydown', (event) => {
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
      setMove(undefined);
    }
  });

  const dropTarget$ = move$.pipe(map((move) => move?.target));

  return (
    <main
      ref={(element) => {
        mut_stage.element = element;

        const observer = new ResizeObserver(() => {
          setSize({ width: element.clientWidth, height: element.clientHeight });
        });

        observer.observe(element);

        onScopeDispose(() => {
          observer.disconnect();
        });
      }}
      class={derive([drag$, move$], (drag, move) =>
        [
          'stage',
          drag === undefined && move === undefined ? '' : 'stage--dragging',
          move === undefined ? '' : 'stage--moving',
        ]
          .filter((part) => part !== '')
          .join(' '),
      )}
      data-e2e={constant('stage')}
    >
      <For items={slots$} key={({ key }) => key}>
        {(slot$) => (
          <PaneFrame
            dispatch={dispatch}
            paneId={Optional.unwrap(slot$.getSnapshot()).paneId}
            resetOrigins$={resetOrigins$}
            view$={slot$.pipe(map(({ view }) => view))}
            onMoveStart={(paneId) => {
              setMove({ paneId, target: undefined });
            }}
            onNavigate={onNavigate}
            onShortcut={onShortcut}
            onToggleResetOrigin={onToggleResetOrigin}
          />
        )}
      </For>

      <For items={dividers$} key={({ path }) => path.join('/')}>
        {(divider$) => (
          <DividerHandle
            divider$={divider$}
            onDragStart={setDrag}
            onResize={resize}
          />
        )}
      </For>

      <If
        cond={dropTarget$.pipe(map((target) => target !== undefined))}
        then={<DropIndicator target$={dropTarget$} />}
      />
    </main>
  );
};

/** The width of a divider, and so the gap between panes (spec L1). */
const gutterPx = 6;

type PaneSlot = Readonly<{ key: string; paneId: PaneId; view: PaneView }>;
