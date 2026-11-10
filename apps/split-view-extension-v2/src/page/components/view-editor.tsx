import {
  createBooleanState,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { constant, createAfterUpdate, For, If, type JSX } from 'synstate-dom';
import type { ListEntry } from '../../core/index.mjs';

/**
 * The Edit popover for the split view on screen (spec W4–W6). Mounted while
 * there is one; `entry$` may still pass `undefined` on its way out.
 */
export const ViewEditor = ({
  entry$,
  onRename,
  onMove,
  onOpenInNewTab,
  onRemove,
  onOpenAll,
  onExport,
  onImport,
}: Readonly<{
  entry$: InitializedObservable<ListEntry | undefined>;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, offset: number) => void;
  onOpenInNewTab: (id: string) => void;
  onRemove: (id: string) => void;
  onOpenAll: () => void;
  onExport: () => void;
  onImport: (text: string) => void;
}>): JSX.Element => {
  const afterUpdate = createAfterUpdate();

  // A second click confirms: cheaper than a modal, safer than one click.
  const [confirming$, { setTrue: askRemove, setFalse: stopConfirming }] =
    createBooleanState(false);

  // A file input keeps its file, so the same file twice fires no `change`;
  // a new element is the way to clear it.
  const [importKey$, , { updateState: updateImportKey }] = createState(0);

  const mut_refs: { name: HTMLInputElement | undefined } = { name: undefined };

  entry$.subscribe(() => {
    afterUpdate(stopConfirming);
  });

  const withEntry =
    (act: (entry: ListEntry) => void): (() => void) =>
    () => {
      const entry = entry$.getSnapshot().value;

      if (entry !== undefined) {
        act(entry);
      }
    };

  return (
    <div
      aria-label={constant('Edit this split view')}
      class={constant('view-editor')}
      data-e2e={constant('view-editor')}
      role={constant('dialog')}
    >
      <form
        class={constant('view-editor__row')}
        onSubmit={(event) => {
          event.preventDefault();

          withEntry((entry) => {
            onRename(entry.id, mut_refs.name?.value ?? entry.name);
          })();
        }}
      >
        <input
          ref={(element) => {
            mut_refs.name = element;
          }}
          aria-label={constant('Name of this split view')}
          class={constant('view-editor__input')}
          value={entry$.pipe(map((entry) => entry?.name ?? ''))}
        />
        <button class={constant('button')} type={constant('submit')}>
          {constant('Rename')}
        </button>
      </form>

      <div class={constant('view-editor__row')}>
        <button
          class={constant('button')}
          title={constant(
            'One place earlier in the list; its number and Alt+N change with it.',
          )}
          type={constant('button')}
          onClick={withEntry(({ id }) => {
            onMove(id, -1);
          })}
        >
          {constant('◀ Earlier')}
        </button>
        <button
          class={constant('button')}
          title={constant(
            'One place later in the list; its number and Alt+N change with it.',
          )}
          type={constant('button')}
          onClick={withEntry(({ id }) => {
            onMove(id, 1);
          })}
        >
          {constant('Later ▶')}
        </button>
        <button
          class={constant('button')}
          title={constant('Open this split view in a tab of its own')}
          type={constant('button')}
          onClick={withEntry(({ id }) => {
            onOpenInNewTab(id);
          })}
        >
          {constant('↗ New tab')}
        </button>
        <If
          cond={confirming$}
          then={
            <button
              class={constant('button button--danger')}
              data-e2e={constant('view-delete-confirm')}
              title={constant('Delete this split view and the layout in it')}
              type={constant('button')}
              onClick={withEntry(({ id }) => {
                onRemove(id);
              })}
            >
              {constant('Really delete')}
            </button>
          }
          else={
            <button
              class={constant('button')}
              data-e2e={constant('view-delete')}
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

      <div class={constant('view-editor__row view-editor__row--last')}>
        <button
          class={constant('button')}
          title={constant(
            'Open every saved split view, each in a tab of its own. Those already open stay where they are; one last seen pinned comes back pinned.',
          )}
          type={constant('button')}
          onClick={onOpenAll}
        >
          {constant('↗ Open all')}
        </button>
        <button
          class={constant('button')}
          title={constant(
            'Write every saved split view to JSON. If the extension id ever changes, importing it is the way back.',
          )}
          type={constant('button')}
          onClick={onExport}
        >
          {constant('Export')}
        </button>
        <label
          class={constant('button')}
          title={constant(
            'Read an export back, or a raw chrome.storage.local.get(null) dump. An id on the list is replaced; nothing is deleted.',
          )}
        >
          {constant('Import')}
          <For items={importKey$.pipe(map((key) => [key]))} key={(key) => key}>
            {() => (
              <input
                accept={constant('application/json, .json')}
                data-e2e={constant('view-import')}
                hidden={constant(true)}
                type={constant('file')}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];

                  if (file === undefined) {
                    return;
                  }

                  updateImportKey((key) => key + 1);

                  file.text().then(onImport).catch(console.error);
                }}
              />
            )}
          </For>
        </label>
      </div>
    </div>
  );
};
