import {
  constant,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { Mutable } from 'ts-type-forge';
import { m } from '../i18n/index.mjs';
import {
  editorStore,
  groupEditorStore,
  projectFileStore,
  sessionStore,
  uiStore,
} from '../store/index.mjs';
import { ViewSwitch } from './view-switch.js';

type Props = Readonly<{
  userName: Bindable<string>;
}>;

export const AppHeader = ({ userName }: Props): JSX.Element => (
  <header class={constant('app-header')}>
    <h1 class={constant('app-title')}>{constant(m.app.title)}</h1>
    <ViewSwitch />
    <div class={constant('header-actions')}>
      <button
        class={constant('bp6-button bp6-intent-primary')}
        data-e2e={constant('add-task')}
        type={constant('button')}
        onClick={editorStore.createTask}
      >
        {constant(m.header.addTask)}
      </button>
      <button
        class={constant('bp6-button')}
        data-e2e={constant('add-milestone')}
        type={constant('button')}
        onClick={editorStore.createMilestone}
      >
        {constant(m.header.addMilestone)}
      </button>
      {/* Drawn in 「DAG」 alone, and chosen in a node's dialog in any view. */}
      <button
        class={constant('bp6-button')}
        data-e2e={constant('add-group')}
        type={constant('button')}
        onClick={groupEditorStore.create}
      >
        {constant(m.header.addGroup)}
      </button>
      <button
        class={constant('bp6-button bp6-minimal')}
        data-e2e={constant('export-project')}
        title={constant(m.header.exportTitle)}
        type={constant('button')}
        onClick={projectFileStore.exportProject}
      >
        {constant(m.header.export)}
      </button>
      {/* The input is hidden; the label is what is clicked, and chosen by keyboard. */}
      <label
        class={constant('bp6-button bp6-minimal project-import-button')}
        title={constant(m.header.importTitle)}
      >
        {constant(m.header.import)}
        <input
          accept={constant('.json,application/json')}
          class={constant('visually-hidden')}
          data-e2e={constant('import-project')}
          type={constant('file')}
          onChange={(changed) => {
            const mut_input: Mutable<HTMLInputElement> = changed.currentTarget;

            const file = mut_input.files?.[0];

            // So that choosing the same file again is a change too.
            mut_input.value = '';

            if (file !== undefined) {
              file
                .text()
                .then((text) => {
                  projectFileStore.openFile(file.name, text);
                })
                .catch((error: unknown) => {
                  console.error(error);

                  uiStore.showNotice(m.header.unreadableFile(file.name));
                });
            }
          }}
        />
      </label>
      <button
        class={constant('bp6-button bp6-minimal')}
        disabled={view(sessionStore.signOutState, (state) => state !== 'idle')}
        title={mapBindable(userName, (name) => m.header.signedInAs(name))}
        type={constant('button')}
        onClick={sessionStore.signOut}
      >
        {view(sessionStore.signOutState, (state) =>
          state === 'waiting' ? m.header.signingOut : m.header.signOut,
        )}
      </button>
    </div>
  </header>
);
