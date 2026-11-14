import { createState, map, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  deriveBindable,
  If,
  toObservable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  isOpen: Bindable<boolean>;
  children: Child;
  /**
   * Keeps the children in the document while closed, hidden, as Blueprint's
   * `keepChildrenMounted`; otherwise they are made again on each opening.
   */
  keepChildrenMounted?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
}>;

/**
 * Blueprint's `Collapse`: `div.bp6-collapse` round `div.bp6-collapse-body`,
 * with the inline heights and transforms Blueprint's own animation goes
 * through, so that its style sheets slide the body in and out over the same
 * 200ms.
 *
 * Opening measures the body, animates the height to it and then lets it be
 * `auto`; closing animates from the height last measured to `0`.
 */
export const Collapse = ({
  isOpen,
  children,
  keepChildrenMounted = false,
  class: className,
}: Props): JSX.Element => {
  const isOpen$ = toObservable(isOpen);

  const [phase$, setPhase] = createState<Phase>(
    Optional.unwrap(isOpen$.getSnapshot()) ? 'open' : 'closed',
  );

  // The body's height when last measured, which the closing body is moved up
  // by. A closed body is not drawn: Blueprint's style sheet hides it.
  const [bodyHeight$, setBodyHeight] = createState<number>(0);

  // The container's height while it moves, animated to or from.
  const [height$, setHeight] = createState<string | undefined>(undefined);

  const afterUpdate = createAfterUpdate();

  const mut_state: {
    body: HTMLDivElement | undefined;
    timers: readonly ReturnType<typeof setTimeout>[];
    /** Counts the moves begun, so that work left by an earlier one stops. */
    move: number;
  } = { body: undefined, timers: [], move: 0 };

  const later = (work: () => void, delayMs: number): void => {
    mut_state.timers = Arr.toPushed(
      mut_state.timers,
      setTimeout(work, delayMs),
    );
  };

  const cancelTimers = (): void => {
    for (const timer of mut_state.timers) {
      clearTimeout(timer);
    }

    mut_state.timers = [];

    mut_state.move += 1;
  };

  onScopeDispose(cancelTimers);

  const measure = (): number => mut_state.body?.clientHeight ?? 0;

  const startOpening = (): void => {
    cancelTimers();

    // The body is drawn first, then measured and grown to.
    setPhase('opening');

    const { move } = mut_state;

    afterUpdate(() => {
      // Closed again before the body was drawn: the closing has it now.
      if (mut_state.move !== move) {
        return;
      }

      const measured = measure();

      setBodyHeight(measured);

      setHeight(`${measured.toString()}px`);

      later(() => {
        setPhase('open');
      }, transitionMs);
    });
  };

  const startClosing = (): void => {
    cancelTimers();

    // From the body's height now, then to nothing on the next task.
    setHeight(`${measure().toString()}px`);

    setPhase('closingStart');

    later(() => {
      // Read once the pixel height is in place, which makes the browser lay it
      // out before it goes to 0: from `auto`, height would not animate.
      setBodyHeight(measure());

      setHeight('0px');

      setPhase('closing');
    }, 0);

    later(() => {
      setPhase('closed');
    }, transitionMs);
  };

  const follow = (open: boolean): void => {
    const phase = Optional.unwrap(phase$.getSnapshot());

    const settled = open
      ? phase === 'open' || phase === 'opening'
      : phase === 'closed' || phase === 'closing' || phase === 'closingStart';

    if (settled) {
      return;
    }

    if (open) {
      startOpening();
    } else {
      startClosing();
    }
  };

  // Once the update that changed `isOpen` has finished, since a state is not
  // written while another is propagating; and to the value it has then, so that
  // a change undone in the same task moves nothing.
  isOpen$.subscribe(() => {
    afterUpdate(() => {
      follow(Optional.unwrap(isOpen$.getSnapshot()));
    });
  });

  const isContentVisible = phase$.pipe(map((phase) => phase !== 'closed'));

  const body = (
    <div
      ref={(element) => {
        mut_state.body = element;
      }}
      aria-hidden={phase$.pipe(map((phase) => phase === 'closed'))}
      class={constant('bp6-collapse-body')}
      style={{
        transform: deriveBindable([phase$, bodyHeight$], (phase, bodyHeight) =>
          phase === 'closed' || phase === 'closing'
            ? `translateY(-${bodyHeight.toString()}px)`
            : 'translateY(0)',
        ),
        transition: phase$.pipe(
          map((phase) => (phase === 'open' ? 'none' : undefined)),
        ),
      }}
    >
      {keepChildrenMounted ? (
        children
      ) : (
        <If cond={isContentVisible} then={<>{children}</>} />
      )}
    </div>
  );

  return (
    <div
      class={classObject(['bp6-collapse', className])}
      style={{
        height: deriveBindable([phase$, height$], (phase, height) =>
          phase === 'closed' ? undefined : phase === 'open' ? 'auto' : height,
        ),
        'overflow-y': phase$.pipe(
          map((phase) => (phase === 'open' ? 'visible' : undefined)),
        ),
        transition: phase$.pipe(
          map((phase) => (phase === 'open' ? 'none' : undefined)),
        ),
      }}
    >
      {body}
    </div>
  );
};

/**
 * Blueprint's animation states, less `OPEN_START`, which is `opening` before
 * the body is measured.
 */
type Phase = 'closed' | 'closing' | 'closingStart' | 'open' | 'opening';

/** Blueprint's default `transitionDuration`. */
const transitionMs = 200;
