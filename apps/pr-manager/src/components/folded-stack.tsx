import { map, type InitializedObservable } from 'synstate';
import {
  constant,
  deriveBindable,
  For,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Entry } from '../load-report.mjs';
import {
  tallyLayers,
  type LayerState,
  type LayerTally,
} from '../stack-fold.mjs';
import { reader, stackFoldStore } from '../store/index.mjs';
import { presentVerdict, type StatusRole } from '../verdict.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{
  /** The pull request the stack is folded under. */
  number: InitializedObservable<number>;
  /** What is folded, nearest first (`layersBelow`). */
  layers: InitializedObservable<readonly number[]>;
}>;

/**
 * What is below a pull request, folded into one row where its first layer would
 * be: how many pull requests, how their checks stand, how many are drafts, and
 * the numbers at either end. The whole row unfolds it, as the toggle on the
 * card does.
 *
 * The counts are the verdict badge's, in its order, so that a red layer deep in
 * a folded stack still shows.
 */
export const FoldedStack = ({ number, layers }: Props): JSX.Element => {
  const tally = deriveBindable([layers, reader.byNumber], (numbers, byNumber) =>
    tallyLayers(
      Arr.generate(function* () {
        for (const each of numbers) {
          const entry = byNumber.get(each);

          if (entry !== undefined) {
            yield layerStateOf(entry);
          }
        }
      }),
    ),
  );

  return (
    <button
      aria-expanded={constant('false')}
      class={constant('folded-summary')}
      title={mapBindable(
        tally,
        ({ total }) => `Show the ${pullRequests(total)} folded here`,
      )}
      type={constant('button')}
      onClick={(
        pressed: MouseEvent & Readonly<{ currentTarget: HTMLButtonElement }>,
      ) => {
        // The row goes as the stack unfolds, and focus with it; it is put on
        // the card's toggle, which stays where it was and folds it back.
        const toggle = pressed.currentTarget
          .closest('li')
          ?.querySelector<HTMLElement>(
            ':scope > .pull-request .stack-fold-toggle',
          );

        stackFoldStore.toggle(Optional.unwrap(number.getSnapshot()));

        toggle?.focus();
      }}
    >
      <span class={constant('folded-summary-count')}>
        <BadgeIcon path={constant(CHEVRON_RIGHT)} />
        {mapBindable(tally, ({ total }) => pullRequests(total))}
      </span>
      <TallyParts parts={mapBindable(tally, partsOf)} />
      <If
        cond={mapBindable(tally, ({ drafts }) => drafts > 0)}
        then={
          <span class={constant('folded-summary-drafts')}>
            {mapBindable(tally, ({ drafts }) =>
              drafts === 1 ? '1 draft' : `${drafts} drafts`,
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

const READING_ICON = 'M4 8h.01M8 8h.01M12 8h.01';

/** The verdict badge's own, for checks read but not judged. */
const UNREAD_ICON = 'M5.8 6a2.2 2.2 0 1 1 3.2 2c-.7.4-1 .9-1 1.6v.4M8 12.2v.1';

type Part = Readonly<{
  key: string;
  status: StatusRole | 'reading' | 'unread';
  icon: string;
  count: number;
  label: string;
}>;

const shown = (
  verdict: Entry['checks']['verdict'],
): StrictPick<Part, 'icon' | 'label' | 'status'> => {
  const { icon, label, status } = presentVerdict(verdict);

  return { icon, label, status };
};

/** The counts in the order a verdict badge gives them: what is wrong first. */
const partsOf = (tally: LayerTally): readonly Part[] =>
  [
    { key: 'failing', ...shown('failing'), count: tally.failing },
    { key: 'pending', ...shown('pending'), count: tally.pending },
    { key: 'paused', ...shown('paused'), count: tally.paused },
    {
      key: 'reading',
      status: 'reading' as const,
      icon: READING_ICON,
      label: 'being read',
      count: tally.reading,
    },
    {
      key: 'unread',
      status: 'unread' as const,
      icon: UNREAD_ICON,
      label: 'checks unread',
      count: tally.unread,
    },
    { key: 'passed', ...shown('passed'), count: tally.passed },
  ].filter(({ count }) => count > 0);

const TallyParts = ({
  parts,
}: Readonly<{ parts: Bindable<readonly Part[]> }>): JSX.Element => (
  <span class={constant('folded-summary-tally')}>
    <For items={parts} key={({ key }) => key}>
      {(part$) => (
        <span
          class={constant('folded-summary-part')}
          data-status={part$.pipe(map(({ status }) => status))}
          title={part$.pipe(map(({ count, label }) => `${count} ${label}`))}
        >
          <BadgeIcon path={part$.pipe(map(({ icon }) => icon))} />
          {part$.pipe(map(({ count }) => count.toString()))}
        </span>
      )}
    </For>
  </span>
);

/** As its verdict badge says it: a stand-in verdict is not one. */
const layerStateOf = (entry: Entry): LayerState =>
  ({
    checks: entry.reading.includes('checks')
      ? ('reading' as const)
      : entry.checksUnread === undefined
        ? entry.checks.verdict
        : ('unread' as const),
    isDraft: entry.isDraft,
  }) as const;

const pullRequests = (count: number): string =>
  count === 1 ? '1 pull request' : (`${count} pull requests` as const);

const rangeText = (numbers: readonly number[]): string => {
  const first = numbers.at(0);

  const last = numbers.at(-1);

  return first === undefined || last === undefined
    ? ''
    : first === last
      ? `#${first}`
      : `#${first} … #${last}`;
};
