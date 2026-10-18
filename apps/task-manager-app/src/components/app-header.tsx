import { memoNamed } from 'preact-utils';
import {
  editorStore,
  groupEditorStore,
  sessionStore,
  signOutStateSignal,
} from '../store/index.mjs';
import { ViewSwitch } from './view-switch.js';

type Props = Readonly<{
  userName: string;
}>;

export const AppHeader = memoNamed<Props>('AppHeader', (props) => {
  const { userName } = props;

  return (
    <header className={'app-header'}>
      <h1 className={'app-title'}>{'タスク管理'}</h1>
      <ViewSwitch />
      <div className={'header-actions'}>
        <button
          className={'bp6-button bp6-intent-primary'}
          data-e2e={'add-task'}
          type={'button'}
          onClick={editorStore.createTask}
        >
          {'＋タスク'}
        </button>
        <button
          className={'bp6-button'}
          data-e2e={'add-milestone'}
          type={'button'}
          onClick={editorStore.createMilestone}
        >
          {'＋マイルストーン'}
        </button>
        {/* Drawn in 「DAG」 alone, and chosen in a node's dialog in any view. */}
        <button
          className={'bp6-button'}
          data-e2e={'add-group'}
          type={'button'}
          onClick={groupEditorStore.create}
        >
          {'＋グループ'}
        </button>
        <button
          className={'bp6-button bp6-minimal'}
          disabled={signOutStateSignal.value !== 'idle'}
          title={`${userName} としてサインイン中`}
          type={'button'}
          onClick={sessionStore.signOut}
        >
          {signOutStateSignal.value === 'waiting'
            ? 'サインアウト中…'
            : 'サインアウト'}
        </button>
      </div>
    </header>
  );
});
