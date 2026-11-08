import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The reference pages: one per public API of synstate-next, under
 * `src/content/docs/reference/<group>/<slug>.mdx` (and the same under `ja/`).
 * `gen:reference` fills each English page from the JSDoc of the exports it
 * lists (see `embed-reference.mts` for what is by hand), and fails on a public
 * export no page lists, so a new API cannot go without a page. Each page's code block is
 * `libs/synstate-next/samples/docs-site/reference/<slug>.mts`.
 */
export const referencePages: readonly ReferencePage[] = [
  page('state', 'create-state', ['createState', 'utils/create-state.mts']),
  page('state', 'create-reducer', [
    'createReducer',
    'utils/create-reducer.mts',
  ]),
  page('state', 'create-boolean-state', [
    'createBooleanState',
    'utils/create-boolean-state.mts',
  ]),
  page('state', 'state', ['state', 'core/state.mts']),
  page('events', 'create-value-emitter', [
    'createValueEmitter',
    'utils/create-event-emitter.mts',
  ]),
  page('events', 'create-event-emitter', [
    'createEventEmitter',
    'utils/create-event-emitter.mts',
  ]),
  page('events', 'source', ['source', 'core/state.mts']),
  page('sources', 'just', ['just', 'sources/just.mts']),
  page('sources', 'empty', ['empty', 'sources/just.mts']),
  page('sources', 'from-promise', ['fromPromise', 'sources/from-promise.mts']),
  page('sources', 'from-abortable-promise', [
    'fromAbortablePromise',
    'sources/from-promise.mts',
  ]),
  page('sources', 'from-subscribable', [
    'fromSubscribable',
    'sources/from-subscribable.mts',
  ]),
  page('sources', 'timer', ['timer', 'sources/timer.mts']),
  page('sources', 'counter', ['counter', 'sources/timer.mts']),
  page('sources', 'create-source', [
    'createSource',
    'sources/create-source.mts',
  ]),
  page('combining', 'derive', ['derive', 'operators/derive.mts']),
  page('combining', 'merge', ['merge', 'operators/derive.mts']),
  page('combining', 'zip', ['zip', 'operators/zip.mts']),
  page('operators', 'map', ['map', 'operators/map.mts']),
  page('operators', 'filter', ['filter', 'operators/filter.mts']),
  page('operators', 'scan', ['scan', 'operators/scan.mts']),
  page('operators', 'pairwise', ['pairwise', 'operators/pairwise.mts']),
  page('operators', 'take', ['take', 'operators/take.mts']),
  page('operators', 'skip', ['skip', 'operators/take.mts']),
  page('operators', 'take-while', ['takeWhile', 'operators/take-while.mts']),
  page('operators', 'skip-while', ['skipWhile', 'operators/take-while.mts']),
  page('operators', 'take-until', ['takeUntil', 'operators/take-until.mts']),
  page('operators', 'skip-until', ['skipUntil', 'operators/take-until.mts']),
  page('operators', 'skip-if-no-change', [
    'skipIfNoChange',
    'operators/skip-if-no-change.mts',
  ]),
  page('operators', 'keep-equal-parts', [
    'keepEqualParts',
    'operators/keep-equal-parts.mts',
  ]),
  page('operators', 'with-initial-value', [
    'withInitialValue',
    'operators/with-initial-value.mts',
  ]),
  page('operators', 'with-current-value-from', [
    'withCurrentValueFrom',
    'operators/with-current-value-from.mts',
  ]),
  page('operators', 'with-buffered-from', [
    'withBufferedFrom',
    'operators/with-buffered-from.mts',
  ]),
  page('operators', 'debounce', ['debounce', 'operators/debounce.mts']),
  page('operators', 'throttle', ['throttle', 'operators/throttle.mts']),
  page('operators', 'audit', ['audit', 'operators/audit.mts']),
  page('operators', 'switch-map', ['switchMap', 'operators/switch-map.mts']),
  page('operators', 'merge-map', ['mergeMap', 'operators/merge-map.mts']),
  page('operators', 'create-derived', [
    'createDerived',
    'operators/create-derived.mts',
  ]),
  page('lifetime', 'batch', ['batch', 'core/scheduler.mts']),
  page(
    'lifetime',
    'owners',
    ['createOwner', 'core/owner.mts'],
    ['createRootOwner', 'core/owner.mts'],
    ['getOwner', 'core/owner.mts'],
    ['onCleanup', 'core/owner.mts'],
    ['untracked', 'core/owner.mts'],
    ['Owner', 'core/owner.mts'],
  ),
  page('lifetime', 'is-observable', [
    'isObservable',
    'core/observable-class.mts',
  ]),
] as const;

/** Each group's heading, in the sidebar and on the index, in its order. */
export const groupTitles = {
  en: {
    state: 'State',
    events: 'Events',
    sources: 'Sources',
    combining: 'Combining',
    operators: 'Operators',
    lifetime: 'Updates and lifetime',
  },
  ja: {
    state: '状態',
    events: 'イベント',
    sources: 'ソース',
    combining: '組み合わせ',
    operators: 'オペレーター',
    lifetime: '更新と寿命',
  },
} as const satisfies ReadonlyRecord<
  'en' | 'ja',
  ReadonlyRecord<ReferencePage['group'], string>
>;

export type ReferenceGroup =
  'combining' | 'events' | 'lifetime' | 'operators' | 'sources' | 'state';

export type ReferencePage = Readonly<{
  group: ReferenceGroup;
  slug: string;
  /**
   * What the page documents: each export's name and the file under
   * `libs/synstate-next/src/` that declares it with its JSDoc.
   */
  exports: readonly (readonly [name: string, file: string])[];
}>;

function page(
  group: ReferenceGroup,
  slug: string,
  ...documented: readonly (readonly [name: string, file: string])[]
): ReferencePage {
  return { group, slug, exports: documented };
}
