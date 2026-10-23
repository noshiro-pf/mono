import { constant, If, view, type Bindable, type JSX } from 'synstate-dom';
import { uiStore } from '../store/index.mjs';
import { AppHeader } from './app-header.js';
import { BulkEditDialog } from './bulk-edit-dialog.js';
import { DagView } from './dag-view.js';
import { GroupDialog } from './group-dialog.js';
import { ListView } from './list-view.js';
import { NodeDialog } from './node-dialog.js';
import { NoticeBar } from './notice-bar.js';
import { UnsentWritesBar } from './unsent-writes-bar.js';

type Props = Readonly<{
  userName: Bindable<string>;
}>;

/**
 * The app once signed in: the header, the list or the DAG, and the dialogs
 * of a node, of a group, and of 「一括編集」.
 */
export const MainScreen = ({ userName }: Props): JSX.Element => (
  <div class={constant('main-screen')}>
    <AppHeader userName={userName} />
    <UnsentWritesBar />
    <NoticeBar />
    <If
      cond={view(uiStore.view, (v) => v === 'list')}
      then={<ListView />}
      else={<DagView />}
    />
    <NodeDialog />
    <GroupDialog />
    <BulkEditDialog />
  </div>
);
