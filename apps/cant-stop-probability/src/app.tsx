import { Navbar, NavbarGroup, Tabs, type TabProps } from 'blueprint-synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import * as styles from './app.module.css';
import { DeadColumn, ProbabilityTable } from './components/index.mjs';
import { selectedTabId$, setSelectedTabId, type TabId } from './store.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <Navbar>
      <NavbarGroup>
        <Tabs
          id={'cant-stop'}
          selectedTabId={selectedTabId$}
          tabs={tabs}
          onChange={setSelectedTabId}
        />
      </NavbarGroup>
    </Navbar>
    <div class={constant(styles.content)}>
      <If
        cond={view(selectedTabId$, (id) => id === 'table')}
        then={<ProbabilityTable />}
      />
      <If
        cond={view(selectedTabId$, (id) => id === 'deadColumnUI')}
        then={<DeadColumn />}
      />
    </div>
  </div>
);

const tabs = [
  { id: 'table', title: '確率表' },
  { id: 'deadColumnUI', title: '残存列確率' },
] as const satisfies readonly TabProps<TabId>[];
