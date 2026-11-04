import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { UnframeableKind } from '../state/index.mjs';
import { Icon } from './icon.js';

type Props = Readonly<{
  /**
   * Why the browser refuses the address, where that is known from the address
   * alone. `undefined` is the ordinary case: something refused the framing and
   * only the frame knows what.
   */
  refusal: Bindable<UnframeableKind | undefined>;
  /** Shown only when it is certainly the address that failed. */
  address: Bindable<string | undefined>;
  canOpenExternally: Bindable<boolean>;
  /** Only where the address that failed is known, which is what a retry needs. */
  canReload: Bindable<boolean>;
  canClearServiceWorkers: Bindable<boolean>;
  onOpenExternally: () => void;
  onReload: () => void;
  onClearServiceWorkers: () => void;
  onDismiss: () => void;
}>;

/**
 * What a pane shows in place of a page that would not load.
 *
 * It covers the frame rather than replacing it: taking the `iframe` out of the
 * document would lose the pane's history, and putting it back is a reload. The
 * frame is still there behind this, which is also why there is a way to send
 * this away — the signal behind it is "nothing in the frame answered us", and a
 * page this extension merely cannot script (a PDF, a viewer of the browser's
 * own) answers the same way as a page that never loaded.
 */
export const PaneFallback = ({
  refusal,
  address,
  canOpenExternally,
  canReload,
  canClearServiceWorkers,
  onOpenExternally,
  onReload,
  onClearServiceWorkers,
  onDismiss,
}: Props): JSX.Element => (
  <div class={constant('pane__fallback')} data-e2e={constant('pane-fallback')}>
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
          kind === undefined ? unexplainedDetail : refusalDetail[kind],
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
          disabled={mapBindable(canOpenExternally, (can) => !can)}
          type={constant('button')}
          onClick={onOpenExternally}
        >
          <Icon icon={'external'} />

          {constant('Open in a new tab')}
        </button>

        <If
          cond={canReload}
          then={
            <button
              class={constant('pane__fallback-action')}
              type={constant('button')}
              onClick={onReload}
            >
              <Icon icon={'reload'} />

              {constant('Try again')}
            </button>
          }
        />

        <If
          cond={canClearServiceWorkers}
          then={
            <button
              class={constant('pane__fallback-action')}
              title={constant(
                'The site\u{2019}s own service worker can answer a request before it reaches the network, where the header rules work. This removes it and reloads the pane; the site registers it again on its next ordinary visit.',
              )}
              type={constant('button')}
              onClick={onClearServiceWorkers}
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

const unexplainedDetail =
  'Nothing answered from inside the frame. The site is probably refusing to be framed in a way the header rules cannot undo \u{2014} a page served by the site\u{2019}s own service worker does that. Opening it in a tab of its own always works.';

const refusalDetail: ReadonlyRecord<UnframeableKind, string> = {
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
