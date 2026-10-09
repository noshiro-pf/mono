import { memoNamed } from 'preact-utils';
import { editorStore, sessionStore } from '../store/index.mjs';
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
        <button
          className={'bp6-button bp6-minimal'}
          title={`${userName} としてサインイン中`}
          type={'button'}
          onClick={sessionStore.signOut}
        >
          {'サインアウト'}
        </button>
      </div>
    </header>
  );
});
