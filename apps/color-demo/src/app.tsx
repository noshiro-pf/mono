import { constant, inlineMap, type JSX } from 'synstate-dom';
import * as styles from './app.module.css';
import {
  LuminanceVisualizer,
  MuiPaper,
  MuiTabs,
  TextColorContrastTable,
} from './components/index.mjs';
import { setTabIndex, tabIndex$ } from './store.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <h1 class={constant(styles.title)} data-e2e={constant('title')}>
      {constant('Color demo')}
    </h1>
    <MuiPaper variant={'elevation'}>
      <MuiTabs
        labels={labels}
        tabIndex={tabIndex$}
        tabIndexChange={setTabIndex}
      />
      {/* Both stay mounted, so that each keeps what was set in it. */}
      <div
        style={{
          display: inlineMap(tabIndex$, (i) => (i === 0 ? undefined : 'none')),
        }}
      >
        <LuminanceVisualizer />
      </div>
      <div
        style={{
          display: inlineMap(tabIndex$, (i) => (i === 1 ? undefined : 'none')),
        }}
      >
        <TextColorContrastTable />
      </div>
    </MuiPaper>
  </div>
);

const labels = ['luminance', 'text-color'] as const;
