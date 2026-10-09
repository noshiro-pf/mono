import { memoNamed } from 'preact-utils';
import { viewSignal } from '../store/index.mjs';
import { AppHeader } from './app-header.js';
import { DagView } from './dag-view.js';
import { ListView } from './list-view.js';
import { NodeDialog } from './node-dialog.js';
import { NoticeBar } from './notice-bar.js';

type Props = Readonly<{
  userName: string;
}>;

/** The app once signed in: the header, the list or the DAG, the dialog. */
export const MainScreen = memoNamed<Props>('MainScreen', (props) => {
  const { userName } = props;

  return (
    <div className={'main-screen'}>
      <AppHeader userName={userName} />
      <NoticeBar />
      {viewSignal.value === 'list' ? <ListView /> : <DagView />}
      <NodeDialog />
    </div>
  );
});
