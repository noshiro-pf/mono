import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Unframeable } from '../../core/index.mjs';
import { Icon } from './icon.js';

/**
 * What covers a pane whose page did not load (spec P12). Over the frame, not
 * instead of it: taking an `iframe` out and putting it back is a reload. It can
 * be sent away, since a page this extension merely cannot script answers the
 * same way as one that never loaded.
 */
export const PaneFallback = ({
  refusal,
  address,
  canOpen,
  canRetry,
  canClearWorkers,
  onOpen,
  onRetry,
  onClearWorkers,
  onDismiss,
}: Readonly<{
  refusal: Bindable<Unframeable | undefined>;
  /** Shown only when it is certainly the address that failed. */
  address: Bindable<string | undefined>;
  canOpen: Bindable<boolean>;
  canRetry: Bindable<boolean>;
  canClearWorkers: Bindable<boolean>;
  onOpen: () => void;
  onRetry: () => void;
  onClearWorkers: () => void;
  onDismiss: () => void;
}>): JSX.Element => (
  <div
    class={constant('pane__fallback')}
    data-e2e={constant('pane-fallback')}
    role={constant('alert')}
  >
    <div class={constant('pane__fallback-card')}>
      <p class={constant('pane__fallback-title')}>
        <Icon icon={'warning'} />
        {mapBindable(refusal, (kind) =>
          kind === undefined
            ? 'This page did not open in the pane'
            : 'This page cannot be shown in a pane',
        )}
      </p>

      <p class={constant('pane__fallback-detail')}>
        {mapBindable(refusal, (kind) =>
          kind === undefined ? unexplained : refusalDetail[kind],
        )}
      </p>

      <If
        cond={mapBindable(address, (shown) => shown !== undefined)}
        then={
          <p class={constant('pane__fallback-address')}>
            {mapBindable(address, (shown) => shown ?? '')}
          </p>
        }
      />

      <div class={constant('pane__fallback-actions')}>
        <button
          class={constant('pane__fallback-action')}
          disabled={mapBindable(canOpen, (can) => !can)}
          type={constant('button')}
          onClick={onOpen}
        >
          <Icon icon={'external'} />
          {constant('Open in a new tab')}
        </button>

        <If
          cond={canRetry}
          then={
            <button
              class={constant('pane__fallback-action')}
              type={constant('button')}
              onClick={onRetry}
            >
              <Icon icon={'reload'} />
              {constant('Try again')}
            </button>
          }
        />

        <If
          cond={canClearWorkers}
          then={
            <button
              class={constant('pane__fallback-action')}
              title={constant(clearWorkersTitle)}
              type={constant('button')}
              onClick={onClearWorkers}
            >
              <Icon icon={'clear-sw'} />
              {constant('Clear the site\u{2019}s service workers')}
            </button>
          }
        />

        <button
          class={constant('pane__fallback-action')}
          title={constant(
            'Hide this and show the frame. The page may be there and simply be one this extension cannot see into.',
          )}
          type={constant('button')}
          onClick={onDismiss}
        >
          {constant('Show the frame anyway')}
        </button>
      </div>
    </div>
  </div>
);

export const clearWorkersTitle =
  'The site\u{2019}s own service worker can answer a request before it reaches the network, where the header rules work. This removes it and reloads the pane; the site registers it again on its next ordinary visit.';

const unexplained =
  'Nothing answered from inside the frame. The site is probably refusing to be framed in a way the header rules cannot undo \u{2014} a page served by the site\u{2019}s own service worker does that. Opening it in a tab of its own always works.';

const refusalDetail: ReadonlyRecord<Unframeable, string> = {
  'browser-page':
    'Chrome keeps its own pages \u{2014} chrome:// addresses, the settings, view-source: \u{2014} out of reach of every extension, so none of them can be framed here.',
  'extension-page':
    'Chrome does not let an extension put another extension\u{2019}s pages in a frame.',
  'local-file':
    'Chrome refuses to load a local file into a frame that belongs to an extension page.',
  'unsupported-scheme':
    'This is not an address Chrome will navigate a frame to.',
  'web-store':
    'The Chrome Web Store is out of reach of every extension, this one included \u{2014} which is what stops an extension from installing another one behind your back.',
} as const;
