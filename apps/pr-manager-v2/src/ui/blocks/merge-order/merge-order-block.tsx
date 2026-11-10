import { map, type InitializedObservable } from 'synstate';
import { constant, MatchOptional } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  githubSearchUrl,
  mergeOrderSearchOf,
  mergeOrderSearchTitle,
  type Repo,
} from '../../../domain/index.mjs';
import type { MergeOrderStore } from '../../../store/index.mjs';
import { ExternalLink } from '../../common/index.mjs';
import type { BlockView } from '../../layout/index.mjs';
import { MergeOrderBody } from './merge-order-body.js';
import { MergeOrderFilters } from './merge-order-filters.js';
import './merge-order.css';

/**
 * The merge order block (spec §7): its title with the counts and filters, which
 * stay in view while it scrolls, then the tree and the cycles under it.
 */
export const mergeOrderBlock = (
  store: MergeOrderStore,
  repo: Repo,
  now: InitializedObservable<number>,
): BlockView => {
  const ready = store.view.pipe(
    map((view) =>
      view.kind === 'ready' ? Optional.some(view) : Optional.none,
    ),
  );

  return {
    title: constant('merge order'),
    extras: (
      <MatchOptional
        value={ready}
        some={(view$) => (
          <>
            <ExternalLink
              class={constant('on-github')}
              href={view$.pipe(
                map(({ applied }) =>
                  githubSearchUrl(
                    repo,
                    'pulls',
                    mergeOrderSearchOf(applied).query,
                  ),
                ),
              )}
              title={view$.pipe(
                map(({ applied }) =>
                  mergeOrderSearchTitle(mergeOrderSearchOf(applied)),
                ),
              )}
            >
              {constant('on GitHub')}
            </ExternalLink>
            <MergeOrderFilters update={store.update} view={view$} />
          </>
        )}
      />
    ),
    body: () => (
      <MatchOptional
        value={ready}
        some={(view$) => <MergeOrderBody now={now} view={view$} />}
        none={
          <p class={constant('muted')}>
            {store.view.pipe(
              map((view) =>
                view.kind === 'unread' && view.reason !== undefined
                  ? `Could not decide the merge order: ${view.reason}`
                  : 'Not read yet.',
              ),
            )}
          </p>
        }
      />
    ),
  };
};
