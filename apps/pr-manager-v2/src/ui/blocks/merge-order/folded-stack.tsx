import { combine, map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import {
  foldedStackParts,
  pullRequestsText,
  tallyLayers,
  type MergeOrderCard,
} from '../../../domain/index.mjs';
import type { StackFoldStore } from '../../../store/index.mjs';
import { PathIcon } from '../../common/index.mjs';

type Props = Readonly<{
  /** The pull request the stack is folded under. */
  number: InitializedObservable<number>;
  /** What is folded, nearest first (`layersBelow`). */
  layers: InitializedObservable<readonly number[]>;
  cards: InitializedObservable<ReadonlyMap<number, MergeOrderCard>>;
  fold: StackFoldStore;
}>;

/**
 * What is below a pull request, folded into one row where its first layer would
 * be (spec §7.4): how many pull requests, how their checks stand, how many are
 * drafts, and the numbers at either end. The whole row unfolds it, as the
 * toggle on the card does.
 */
export const FoldedStack = ({
  number,
  layers,
  cards,
  fold,
}: Props): JSX.Element => {
  const tally = combine([layers, cards]).pipe(
    map(([numbers, byNumber]) =>
      tallyLayers(
        Arr.generate(function* () {
          for (const each of numbers) {
            const card = byNumber.get(each);

            if (card !== undefined) {
              yield {
                checks:
                  card.checks.kind === 'unread'
                    ? ('unread' as const)
                    : card.checks.verdict,
                isDraft: card.isDraft,
              };
            }
          }
        }),
      ),
    ),
  );

  return (
    <button
      aria-expanded={constant('false')}
      class={constant('folded-summary')}
      title={tally.pipe(
        map(({ total }) => `Show the ${pullRequestsText(total)} folded here`),
      )}
      type={constant('button')}
      onClick={(
        pressed: MouseEvent & Readonly<{ currentTarget: HTMLButtonElement }>,
      ) => {
        // The row goes as the stack unfolds, and focus with it; it is put on
        // the card's toggle, which stays where it was and folds it back.
        const toggle = pressed.currentTarget
          .closest('li')
          ?.querySelector<HTMLElement>(':scope > .card .stack-fold-toggle');

        fold.toggle(Optional.unwrap(number.getSnapshot()));

        toggle?.focus();
      }}
    >
      <span class={constant('folded-summary-count')}>
        <PathIcon path={constant(CHEVRON_RIGHT)} />
        {tally.pipe(map(({ total }) => pullRequestsText(total)))}
      </span>
      <span class={constant('folded-summary-tally')}>
        <For items={tally.pipe(map(foldedStackParts))} key={({ key }) => key}>
          {(part$) => (
            <span
              class={constant('folded-summary-part')}
              data-tone={part$.pipe(map(({ tone }) => tone))}
              title={part$.pipe(map(({ title }) => title))}
            >
              <If
                cond={part$.pipe(map(({ icon }) => icon !== undefined))}
                then={
                  <PathIcon path={part$.pipe(map(({ icon }) => icon ?? ''))} />
                }
                else={
                  <span aria-hidden={constant('true')}>
                    {part$.pipe(map(({ glyph }) => glyph))}
                  </span>
                }
              />
              {part$.pipe(map(({ count }) => count.toString()))}
            </span>
          )}
        </For>
      </span>
      <If
        cond={tally.pipe(map(({ drafts }) => drafts > 0))}
        then={
          <span class={constant('folded-summary-drafts')}>
            {tally.pipe(
              map(({ drafts }) =>
                drafts === 1 ? '1 draft' : `${drafts} drafts`,
              ),
            )}
          </span>
        }
      />
      <span class={constant('folded-summary-range')}>
        {layers.pipe(map(rangeText))}
      </span>
    </button>
  );
};

const CHEVRON_RIGHT = 'M6 3.5L10.5 8 6 12.5';

const rangeText = (numbers: readonly number[]): string => {
  const first = numbers.at(0);

  const last = numbers.at(-1);

  return first === undefined || last === undefined
    ? ''
    : first === last
      ? `#${first}`
      : `#${first} … #${last}`;
};
