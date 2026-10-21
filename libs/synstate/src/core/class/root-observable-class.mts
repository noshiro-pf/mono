// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import {
  isRootObservable,
  type RootObservable,
  type UpdateToken,
} from '../types/index.mjs';
import { ManagerObservableClass } from './manager-observable-class.mjs';
import { isPropagating, outermostUpdateToken } from './propagation-state.mjs';

export class RootObservableClass<A>
  extends ManagerObservableClass<A, 'root', 0>
  implements RootObservable<A>
{
  /**
   * The outermost update propagating when this root was created. A root
   * created while an update propagates (inside a `switchMap` projection,
   * say) may emit while it is created, as `fromSubscribable` does for a
   * synchronous source. Nothing is derived from it yet, so that is its
   * initial value rather than a write (#2336).
   */
  readonly #createdDuring: UpdateToken | undefined;
  #mut_hasWarned: boolean;

  constructor({
    initialValue,
  }: Readonly<{
    initialValue: Optional<A>;
  }>) {
    super({
      kind: 'root',
      depth: 0,
      initialValue,
    });

    this.#createdDuring = outermostUpdateToken();

    this.#mut_hasWarned = false;

    this.adoptIntoCurrentScope();
  }

  /**
   * Emits `nextValue` and propagates the update to all descendants, warning
   * once when it is a write from inside another update.
   */
  protected override startUpdate(nextValue: A): void {
    if (
      !this.#mut_hasWarned &&
      isPropagating() &&
      outermostUpdateToken() !== this.#createdDuring
    ) {
      this.#mut_hasWarned = true;

      console.warn(writeDuringPropagationWarning);
    }

    super.startUpdate(nextValue);
  }
}

/**
 * Shown once per root observable, the first time it is written to (`next`,
 * `setState`, `dispatch`, …) while another update is still propagating —
 * from a subscriber or a projection. The write still propagates immediately,
 * as it always has; the warning is there because the pattern is wrong, not
 * because anything was refused.
 */
export const writeDuringPropagationWarning =
  'synstate: an observable was written to (next / setState / dispatch) while an update was propagating, so subscribers can see intermediate states. Derive the value with map / combine instead of writing from a subscriber or a projection.';

if (import.meta.vitest !== undefined) {
  test('isRootObservable', () => {
    assert.isTrue(
      isRootObservable(
        new RootObservableClass({
          initialValue: Optional.some(0),
        }),
      ),
    );
  });
}
