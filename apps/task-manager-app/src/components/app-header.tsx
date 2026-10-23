import {
  constant,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import {
  editorStore,
  groupEditorStore,
  sessionStore,
} from '../store/index.mjs';
import { ViewSwitch } from './view-switch.js';

type Props = Readonly<{
  userName: Bindable<string>;
}>;

export const AppHeader = ({ userName }: Props): JSX.Element => (
  <header class={constant('app-header')}>
    <h1 class={constant('app-title')}>{constant('タスク管理')}</h1>
    <ViewSwitch />
    <div class={constant('header-actions')}>
      <button
        class={constant('bp6-button bp6-intent-primary')}
        data-e2e={constant('add-task')}
        type={constant('button')}
        onClick={editorStore.createTask}
      >
        {constant('＋タスク')}
      </button>
      <button
        class={constant('bp6-button')}
        data-e2e={constant('add-milestone')}
        type={constant('button')}
        onClick={editorStore.createMilestone}
      >
        {constant('＋マイルストーン')}
      </button>
      {/* Drawn in 「DAG」 alone, and chosen in a node's dialog in any view. */}
      <button
        class={constant('bp6-button')}
        data-e2e={constant('add-group')}
        type={constant('button')}
        onClick={groupEditorStore.create}
      >
        {constant('＋グループ')}
      </button>
      <button
        class={constant('bp6-button bp6-minimal')}
        disabled={view(sessionStore.signOutState, (state) => state !== 'idle')}
        title={mapBindable(userName, (name) => `${name} としてサインイン中`)}
        type={constant('button')}
        onClick={sessionStore.signOut}
      >
        {view(sessionStore.signOutState, (state) =>
          state === 'waiting' ? 'サインアウト中…' : 'サインアウト',
        )}
      </button>
    </div>
  </header>
);
