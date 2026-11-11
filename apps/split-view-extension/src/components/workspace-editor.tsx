import {
  createBooleanState,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  For,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { WorkspaceEntry } from '../state/index.mjs';

/**
 * The popover's contents, for the entry shown. Mounted only while there is one;
 * `entry$` may still pass `undefined` on its way out, which no action acts on.
 */
export const WorkspaceEditor = ({
  entry$,
  notice,
  onExport,
  onImport,
  onMove,
  onOpenAll,
  onOpenInNewTab,
  onRemove,
  onRename,
}: Readonly<{
  entry$: InitializedObservable<WorkspaceEntry | undefined>;
  notice: Bindable<string | undefined>;
  onExport: () => void;
  onImport: (text: string) => void;
  onMove: (workspaceId: string, offset: number) => void;
  onOpenAll: () => void;
  onOpenInNewTab: (workspaceId: string) => void;
  onRemove: (workspaceId: string) => void;
  onRename: (workspaceId: string, workspaceName: string) => void;
}>): JSX.Element => {
  const afterUpdate = createAfterUpdate();

  /**
   * Whether deleting has been asked for once. A saved layout is not something
   * to lose to a mis-click, and a second click is a cheaper guard than a modal.
   */
  const [confirming$, { setTrue: askRemove, setFalse: stopConfirming }] =
    createBooleanState(false);

  /**
   * Bumped after a file is chosen, to replace the `input` element.
   *
   * A file input holds on to what was chosen, so choosing the same file twice
   * fires no second `change`. Replacing the element is the way to clear that
   * without assigning to `value`.
   */
  const [importNonce$, , { updateState: updateImportNonce }] = createState(0);

  const mut_state: { nameInput: HTMLInputElement | undefined } = {
    nameInput: undefined,
  };

  /** The name, written into the field whenever it changes: the draft goes. */
  const name$ = entry$.pipe(map((entry) => entry?.name ?? ''));

  entry$
    .pipe(map((entry) => `${entry?.id ?? ''}\u{0}${entry?.name ?? ''}`))
    .subscribe(() => {
      afterUpdate(stopConfirming);
    });

  /** Runs `act` on the entry shown, if there still is one. */
  const withEntry =
    (act: (entry: WorkspaceEntry) => void): (() => void) =>
    () => {
      const entry = Optional.unwrap(entry$.getSnapshot());

      if (entry !== undefined) {
        act(entry);
      }
    };

  return (
    <div
      class={constant('workspace-popover')}
      data-e2e={constant('workspace-popover')}
    >
      <form
        class={constant('workspace-popover__row')}
        onSubmit={(submitEvent) => {
          submitEvent.preventDefault();

          withEntry((entry) => {
            onRename(entry.id, mut_state.nameInput?.value ?? entry.name);
          })();
        }}
      >
        <input
          ref={(element) => {
            mut_state.nameInput = element;
          }}
          aria-label={constant('Name of this split view')}
          class={constant('workspace-popover__input')}
          value={name$}
        />

        <button
          class={constant('top-bar__button')}
          title={constant('Use this name')}
          type={constant('submit')}
        >
          {constant('Rename')}
        </button>
      </form>

      <div class={constant('workspace-popover__row')}>
        <button
          class={constant('top-bar__button')}
          title={constant(
            'One place earlier in the list. The number, and its Alt+N, change with it.',
          )}
          type={constant('button')}
          onClick={withEntry((entry) => {
            onMove(entry.id, -1);
          })}
        >
          {constant('◀ Earlier')}
        </button>

        <button
          class={constant('top-bar__button')}
          title={constant(
            'One place later in the list. The number, and its Alt+N, change with it.',
          )}
          type={constant('button')}
          onClick={withEntry((entry) => {
            onMove(entry.id, 1);
          })}
        >
          {constant('Later ▶')}
        </button>

        <button
          class={constant('top-bar__button')}
          title={constant('Open this split view in a tab of its own')}
          type={constant('button')}
          onClick={withEntry((entry) => {
            onOpenInNewTab(entry.id);
          })}
        >
          {constant('↗ New tab')}
        </button>
      </div>

      <div class={constant('workspace-popover__row')}>
        <If
          cond={confirming$}
          then={
            <button
              class={constant('workspace-popover__danger')}
              title={constant('Delete this split view and the layout in it')}
              type={constant('button')}
              onClick={withEntry((entry) => {
                onRemove(entry.id);
              })}
            >
              {constant('Really delete')}
            </button>
          }
          else={
            <button
              class={constant('top-bar__button')}
              title={constant('Remove this split view from the list')}
              type={constant('button')}
              onClick={() => {
                askRemove();
              }}
            >
              {constant('Delete')}
            </button>
          }
        />
      </div>

      <div
        class={constant('workspace-popover__row workspace-popover__row--last')}
      >
        <button
          class={constant('top-bar__button')}
          title={constant(
            'Open every saved split view, each in a tab of its own. The ones already open in a tab are left where they are, and one last seen in a pinned tab comes back pinned.',
          )}
          type={constant('button')}
          onClick={onOpenAll}
        >
          {constant('\u{2197} Open all')}
        </button>

        <button
          class={constant('top-bar__button')}
          title={constant(
            'Write every saved split view to JSON. If the extension id ever changes, importing this is the way back.',
          )}
          type={constant('button')}
          onClick={onExport}
        >
          {constant('Export')}
        </button>

        <label
          class={constant('top-bar__button')}
          title={constant(
            'Read a JSON export back, or a raw chrome.storage.local.get(null) dump. An id already on the list is replaced; nothing is deleted.',
          )}
        >
          {constant('Import')}

          <For
            items={importNonce$.pipe(map((nonce) => [nonce]))}
            key={(nonce) => nonce}
          >
            {() => (
              <input
                accept={constant('application/json, .json')}
                hidden={constant(true)}
                type={constant('file')}
                onChange={(changeEvent) => {
                  const file = changeEvent.currentTarget.files?.[0];

                  if (file === undefined) {
                    return;
                  }

                  updateImportNonce((nonce) => nonce + 1);

                  const read = async (): Promise<void> => {
                    onImport(await file.text());
                  };

                  read().catch(console.error);
                }}
              />
            )}
          </For>
        </label>
      </div>

      <If
        cond={mapBindable(notice, (shown) => shown !== undefined)}
        then={
          <p class={constant('workspace-popover__notice')}>
            {mapBindable(notice, (shown) => shown ?? '')}
          </p>
        }
      />
    </div>
  );
};
