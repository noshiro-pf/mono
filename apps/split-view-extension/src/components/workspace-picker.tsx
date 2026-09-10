import * as React from 'react';
import { memoNamed } from 'react-utils';
import {
  type WorkspaceEntry,
  type WorkspaceRegistry,
} from '../state/index.mjs';

type Props = Readonly<{
  activeId: string | undefined;
  /** What the last import, or a refused one, had to say. */
  notice: string | undefined;
  registry: WorkspaceRegistry;
  onCreate: () => void;
  onExport: () => void;
  onImport: (text: string) => void;
  onMove: (workspaceId: string, offset: number) => void;
  onOpenInNewTab: (workspaceId: string) => void;
  onRemove: (workspaceId: string) => void;
  onRename: (workspaceId: string, workspaceName: string) => void;
  onSwitch: (workspaceId: string) => void;
}>;

/**
 * Which split view this tab is showing, and everything done to the list.
 *
 * Three controls wide — a `select`, `＋`, `Edit` — because it shares the one
 * toolbar row with the layout presets, and a second row would cost every pane
 * the height of it for the whole session. Editing therefore happens in a
 * popover that floats over the stage rather than in a strip that pushes it
 * down, and the list is a `select` rather than a chip per workspace, which
 * stays one line wide however many there are.
 *
 * It renders as a fragment inside the toolbar's row; the wrapper is
 * `display: contents`, so it is in the DOM for "did the click land outside the
 * popover" without being a box in the layout.
 */
export const WorkspacePicker = memoNamed(
  'WorkspacePicker',
  ({
    activeId,
    notice,
    registry,
    onCreate,
    onExport,
    onImport,
    onMove,
    onOpenInNewTab,
    onRemove,
    onRename,
    onSwitch,
  }: Props) => {
    const [editing, setEditing] = React.useState(false);

    const [root, setRoot] = React.useState<HTMLSpanElement | null>(null);

    const active = registry.entries.find((entry) => entry.id === activeId);

    const handleSelect = React.useCallback<
      React.ChangeEventHandler<HTMLSelectElement>
    >(
      (changeEvent) => {
        onSwitch(changeEvent.target.value);
      },
      [onSwitch],
    );

    const handleToggleEditing = React.useCallback((): void => {
      setEditing((shown) => !shown);
    }, []);

    // Switching is the one action that leaves the popover about something
    // else, so it closes it; the rest are edits to the workspace it is open on.
    React.useEffect(() => {
      setEditing(false);
    }, [activeId]);

    /**
     * Escape, or a click anywhere but in the popover, closes it.
     *
     * A click *inside a pane* is not one of those: it goes to the frame and
     * never reaches this page. The popover stays open over it, which is the
     * price of not having a row of its own.
     */
    React.useEffect(() => {
      if (!editing) {
        return undefined;
      }

      const onPointerDown = (
        pointerEvent: Readonly<{ target: unknown }>,
      ): void => {
        if (
          root !== null &&
          pointerEvent.target instanceof Node &&
          !root.contains(pointerEvent.target)
        ) {
          setEditing(false);
        }
      };

      const onKeyDown = (keyboardEvent: Readonly<{ key: string }>): void => {
        if (keyboardEvent.key === 'Escape') {
          setEditing(false);
        }
      };

      addEventListener('pointerdown', onPointerDown);

      addEventListener('keydown', onKeyDown);

      return () => {
        removeEventListener('pointerdown', onPointerDown);

        removeEventListener('keydown', onKeyDown);
      };
    }, [editing, root]);

    return (
      <span ref={setRoot} className={'workspace-picker'}>
        <select
          aria-label={'The split view shown here'}
          className={'workspace-picker__select'}
          title={'The split view shown in this tab. Alt+1..9 switches too.'}
          value={activeId ?? ''}
          onChange={handleSelect}
        >
          {registry.entries.map((entry, index) => (
            <option key={entry.id} value={entry.id}>
              {`${String(index + 1)}: ${entry.name}`}
            </option>
          ))}
        </select>

        <button
          className={'top-bar__button'}
          title={'Add a split view and show it here'}
          type={'button'}
          onClick={onCreate}
        >
          {'+'}
        </button>

        <button
          aria-expanded={editing}
          className={'top-bar__button'}
          title={
            'Rename, reorder or delete this split view, open it in a tab of its own, export and import'
          }
          type={'button'}
          onClick={handleToggleEditing}
        >
          {'Edit'}
        </button>

        {editing && active !== undefined ? (
          <WorkspaceEditor
            entry={active}
            notice={notice}
            onExport={onExport}
            onImport={onImport}
            onMove={onMove}
            onOpenInNewTab={onOpenInNewTab}
            onRemove={onRemove}
            onRename={onRename}
          />
        ) : undefined}
      </span>
    );
  },
);

const WorkspaceEditor = memoNamed(
  'WorkspaceEditor',
  ({
    entry,
    notice,
    onExport,
    onImport,
    onMove,
    onOpenInNewTab,
    onRemove,
    onRename,
  }: Readonly<{
    entry: WorkspaceEntry;
    notice: string | undefined;
    onExport: () => void;
    onImport: (text: string) => void;
    onMove: (workspaceId: string, offset: number) => void;
    onOpenInNewTab: (workspaceId: string) => void;
    onRemove: (workspaceId: string) => void;
    onRename: (workspaceId: string, workspaceName: string) => void;
  }>) => {
    const [draft, setDraft] = React.useState(entry.name);

    /**
     * Whether deleting has been asked for once. A saved layout is not
     * something to lose to a mis-click, and a second click is a cheaper guard
     * than a modal.
     */
    const [confirming, setConfirming] = React.useState(false);

    /**
     * Bumped after a file is chosen, to replace the `input` element.
     *
     * A file input holds on to what was chosen, so choosing the same file
     * twice fires no second `change`. Replacing the element is the way to
     * clear that without assigning to `value`.
     */
    const [importNonce, setImportNonce] = React.useState(0);

    React.useEffect(() => {
      setDraft(entry.name);

      setConfirming(false);
    }, [entry.id, entry.name]);

    const handleDraftChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >((changeEvent) => {
      setDraft(changeEvent.target.value);
    }, []);

    const handleSubmit = React.useCallback<
      React.SubmitEventHandler<HTMLFormElement>
    >(
      (submitEvent) => {
        submitEvent.preventDefault();

        onRename(entry.id, draft);
      },
      [onRename, entry.id, draft],
    );

    const handleMoveLeft = React.useCallback((): void => {
      onMove(entry.id, -1);
    }, [onMove, entry.id]);

    const handleMoveRight = React.useCallback((): void => {
      onMove(entry.id, 1);
    }, [onMove, entry.id]);

    const handleOpenInNewTab = React.useCallback((): void => {
      onOpenInNewTab(entry.id);
    }, [onOpenInNewTab, entry.id]);

    const handleAskRemove = React.useCallback((): void => {
      setConfirming(true);
    }, []);

    const handleRemove = React.useCallback((): void => {
      onRemove(entry.id);
    }, [onRemove, entry.id]);

    const handleChooseFile = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >(
      (changeEvent) => {
        const file = changeEvent.target.files?.[0];

        if (file === undefined) {
          return;
        }

        setImportNonce((nonce) => nonce + 1);

        const read = async (): Promise<void> => {
          onImport(await file.text());
        };

        read().catch(console.error);
      },
      [onImport],
    );

    return (
      <div className={'workspace-popover'}>
        <form className={'workspace-popover__row'} onSubmit={handleSubmit}>
          <input
            aria-label={'Name of this split view'}
            className={'workspace-popover__input'}
            value={draft}
            onChange={handleDraftChange}
          />

          <button
            className={'top-bar__button'}
            title={'Use this name'}
            type={'submit'}
          >
            {'Rename'}
          </button>
        </form>

        <div className={'workspace-popover__row'}>
          <button
            className={'top-bar__button'}
            title={
              'One place earlier in the list. The number, and its Alt+N, change with it.'
            }
            type={'button'}
            onClick={handleMoveLeft}
          >
            {'◀ Earlier'}
          </button>

          <button
            className={'top-bar__button'}
            title={
              'One place later in the list. The number, and its Alt+N, change with it.'
            }
            type={'button'}
            onClick={handleMoveRight}
          >
            {'Later ▶'}
          </button>

          <button
            className={'top-bar__button'}
            title={'Open this split view in a tab of its own'}
            type={'button'}
            onClick={handleOpenInNewTab}
          >
            {'↗ New tab'}
          </button>
        </div>

        <div className={'workspace-popover__row'}>
          {confirming ? (
            <button
              className={'workspace-popover__danger'}
              title={'Delete this split view and the layout in it'}
              type={'button'}
              onClick={handleRemove}
            >
              {'Really delete'}
            </button>
          ) : (
            <button
              className={'top-bar__button'}
              title={'Remove this split view from the list'}
              type={'button'}
              onClick={handleAskRemove}
            >
              {'Delete'}
            </button>
          )}
        </div>

        <div className={'workspace-popover__row workspace-popover__row--last'}>
          <button
            className={'top-bar__button'}
            title={
              'Write every saved split view to JSON. If the extension id ever changes, importing this is the way back.'
            }
            type={'button'}
            onClick={onExport}
          >
            {'Export'}
          </button>

          <label
            className={'top-bar__button'}
            title={
              'Read a JSON export back, or a raw chrome.storage.local.get(null) dump. An id already on the list is replaced; nothing is deleted.'
            }
          >
            {'Import'}

            <input
              key={importNonce}
              accept={'application/json, .json'}
              hidden
              type={'file'}
              onChange={handleChooseFile}
            />
          </label>
        </div>

        {notice === undefined ? undefined : (
          <p className={'workspace-popover__notice'}>{notice}</p>
        )}
      </div>
    );
  },
);
