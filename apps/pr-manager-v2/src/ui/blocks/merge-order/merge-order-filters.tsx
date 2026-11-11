import { map, type InitializedObservable } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  PRIORITIES,
  STATUS_NAMES,
  toggleHidden,
  toggleOnly,
  togglePriority,
  type MergeOrderStatus,
  type Priority,
  type Tone,
} from '../../../domain/index.mjs';
import type { MergeOrderStore, MergeOrderView } from '../../../store/index.mjs';
import { ChipSwitch, OpenTile, TileSwitch } from '../../common/index.mjs';

type Ready = MergeOrderView & Readonly<{ kind: 'ready' }>;

type Props = Readonly<{
  view: InitializedObservable<Ready>;
  update: MergeOrderStore['update'];
}>;

/**
 * The counts and filters the merge order leads with (spec §7.3): `open`, then a
 * switch per status with an `only` in its corner, the priorities, the drafts
 * and the sort. Every number is what the list shows; a hidden one is how many
 * showing it would add, struck through.
 */
export const MergeOrderFilters = ({ view, update }: Props): JSX.Element => (
  <div class={constant('filters')}>
    <div class={constant('tiles')}>
      <OpenTile open={view.pipe(map(({ counts }) => counts.open))} />

      <For items={view.pipe(map(({ available }) => available))} key={(s) => s}>
        {(status$) => {
          // Keyed by the status: it never changes within a row.
          const status = Optional.unwrap(status$.getSnapshot());

          return (
            <TileSwitch
              count={view.pipe(map(({ counts }) => counts.statuses[status]))}
              label={STATUS_NAMES[status]}
              only={view.pipe(map(({ applied }) => applied.only === status))}
              subject={`the pull requests that are ${STATUS_NAMES[status]}`}
              tone={STATUS_TONES[status]}
              onOnly={() => {
                update((prev) => toggleOnly(prev, status));
              }}
              onToggle={() => {
                update((prev) => toggleHidden(prev, status));
              }}
            />
          );
        }}
      </For>
    </div>

    <div class={constant('controls')}>
      <fieldset class={constant('control-group')}>
        <legend>{constant('priority')}</legend>
        {PRIORITIES.map((priority) => (
          <ChipSwitch
            count={view.pipe(map(({ counts }) => counts.priorities[priority]))}
            label={priority}
            title={PRIORITY_TITLES[priority]}
            onToggle={() => {
              update((prev) => togglePriority(prev, priority));
            }}
          />
        ))}
      </fieldset>

      <fieldset class={constant('control-group')}>
        <legend>{constant('state')}</legend>
        <ChipSwitch
          count={view.pipe(map(({ counts }) => counts.drafts))}
          label={'draft'}
          title={
            'Drafts; switched off, they are hidden whatever else they are.'
          }
          onToggle={() => {
            update((prev) => ({ ...prev, hideDrafts: !prev.hideDrafts }));
          }}
        />
      </fieldset>

      <fieldset class={constant('control-group')}>
        <legend>{constant('sort')}</legend>
        <button
          aria-pressed={view.pipe(
            map(({ applied }) => applied.sort === 'order'),
          )}
          class={constant('chip')}
          title={constant('In the order the trailers and the stacks declare.')}
          type={constant('button')}
          onClick={() => {
            update((prev) => ({ ...prev, sort: 'order' }));
          }}
        >
          {constant('merge order')}
        </button>
        <button
          aria-pressed={view.pipe(
            map(({ applied }) => applied.sort === 'priority'),
          )}
          class={constant('chip')}
          title={constant(
            'Each level of the tree by the best priority in it and below it; no priority sits between mid and low.',
          )}
          type={constant('button')}
          onClick={() => {
            update((prev) => ({ ...prev, sort: 'priority' }));
          }}
        >
          {constant('priority')}
        </button>
      </fieldset>
    </div>
  </div>
);

const STATUS_TONES = {
  queued: undefined,
  failing: 'critical',
  setAside: 'serious',
  codeOwner: 'warning',
  pending: undefined,
} as const satisfies ReadonlyRecord<MergeOrderStatus, Tone | undefined>;

const PRIORITY_TITLES = {
  high: 'Labelled priority:high.',
  mid: 'Labelled priority:mid.',
  low: 'Labelled priority:low.',
  none: 'No priority label, or several.',
} as const satisfies ReadonlyRecord<Priority, string>;
