import { constant, If, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { projectFileStore, type ProjectImport } from '../store/index.mjs';
import { followModal } from './follow-modal.mjs';

/**
 * 「読み込む」 of a project file (`project-file-store.mts`): what replacing
 * the project with it means, asked before anything is written; why a file
 * cannot be read; and that it is being written, which goes on if it is
 * closed. A native `<dialog>` as the node's is (`node-dialog.tsx`).
 */
export const ProjectImportDialog = (): JSX.Element => (
  <dialog
    ref={(dialog) => {
      followModal(
        dialog,
        projectFileStore.importState,
        (state) => state.type !== 'idle',
        projectFileStore.close,
      );
    }}
    aria-labelledby={constant(TITLE_ID)}
    class={constant('bp6-dialog node-dialog project-import-dialog')}
    data-e2e={constant('project-import-dialog')}
    onCancel={(cancelled) => {
      cancelled.preventDefault();

      projectFileStore.close();
    }}
  >
    <div class={constant('bp6-dialog-header')}>
      <h2 class={constant('bp6-heading')} id={constant(TITLE_ID)}>
        {constant(m.projectFile.title)}
      </h2>
    </div>
    <div class={constant('bp6-dialog-body node-dialog-body')}>
      <p data-e2e={constant('project-import-message')}>
        {view(projectFileStore.importState, message)}
      </p>
      <If
        cond={view(
          projectFileStore.importState,
          (state) => state.type === 'confirming' && state.problem !== undefined,
        )}
        then={
          <p
            class={constant('bp6-callout bp6-intent-danger')}
            data-e2e={constant('project-import-problem')}
            role={constant('alert')}
          >
            {view(projectFileStore.importState, (state) =>
              state.type === 'confirming' ? (state.problem ?? '') : '',
            )}
          </p>
        }
      />
      <If
        cond={view(projectFileStore.importState, isRefused)}
        then={
          <p
            class={constant('project-import-errors')}
            data-e2e={constant('project-import-errors')}
          >
            {view(projectFileStore.importState, (state) =>
              state.type === 'refused' ? state.errors.join('\n') : '',
            )}
          </p>
        }
      />
    </div>
    <div class={constant('bp6-dialog-footer node-dialog-footer')}>
      <span />
      <div class={constant('bp6-dialog-footer-actions')}>
        <If
          cond={view(projectFileStore.importState, isConfirming)}
          then={
            <>
              <button
                class={constant('bp6-button')}
                type={constant('button')}
                onClick={projectFileStore.close}
              >
                {constant(m.common.cancel)}
              </button>
              <button
                class={constant('bp6-button bp6-intent-danger')}
                data-e2e={constant('project-import-confirm')}
                type={constant('button')}
                onClick={projectFileStore.confirm}
              >
                {constant(m.projectFile.replace)}
              </button>
            </>
          }
          else={
            <button
              class={constant('bp6-button')}
              data-e2e={constant('project-import-close')}
              type={constant('button')}
              onClick={projectFileStore.close}
            >
              {constant(m.common.close)}
            </button>
          }
        />
      </div>
    </div>
  </dialog>
);

const message = (state: ProjectImport): string =>
  state.type === 'confirming'
    ? m.projectFile.confirm(
        state.fileName,
        state.snapshot.state.tasks.length,
        state.snapshot.state.milestones.length,
        state.snapshot.groups.length,
      )
    : state.type === 'refused'
      ? m.projectFile.refused(state.fileName)
      : state.type === 'importing'
        ? m.projectFile.importing
        : '';

const isConfirming = (state: ProjectImport): boolean =>
  state.type === 'confirming';

const isRefused = (state: ProjectImport): boolean => state.type === 'refused';

const TITLE_ID = 'project-import-dialog-title';
