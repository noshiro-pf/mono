import {
  Navbar,
  NavbarGroup,
  Tabs,
  tabTitleId,
  type TabProps,
} from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import * as styles from './app.module.css';
import { DeadColumn, ProbabilityTable } from './components/index.mjs';
import { selectedTabId$, setSelectedTabId, type TabId } from './store.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <Navbar>
      <NavbarGroup>
        <Tabs
          id={TABS_ID}
          selectedTabId={selectedTabId$}
          tabs={tabs}
          onChange={setSelectedTabId}
        />
      </NavbarGroup>
    </Navbar>
    {/* The panel every tab controls, labelled by the one chosen. */}
    <div
      aria-labelledby={selectedTabId$.pipe(
        map((id) => tabTitleId(TABS_ID, id)),
      )}
      class={constant(styles.content)}
      id={constant(PANEL_ID)}
      role={constant('tabpanel')}
    >
      <If
        cond={selectedTabId$.pipe(map((id) => id === 'table'))}
        then={<ProbabilityTable />}
      />
      <If
        cond={selectedTabId$.pipe(map((id) => id === 'deadColumnUI'))}
        then={<DeadColumn />}
      />
    </div>
  </div>
);

const TABS_ID = 'cant-stop';

const PANEL_ID = 'cant-stop-panel';

const tabs = [
  { id: 'table', title: '確率表', panelId: PANEL_ID },
  { id: 'deadColumnUI', title: '残存列確率', panelId: PANEL_ID },
] as const satisfies readonly TabProps<TabId>[];
