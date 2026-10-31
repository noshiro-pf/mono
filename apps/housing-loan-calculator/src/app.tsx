import { Spinner, SpinnerSize } from 'blueprint-synstate';
import { constant, If, type Child, type JSX } from 'synstate-dom';
import * as styles from './app.module.css';
import {
  ConfigSection,
  PaymentTable,
  SummarySection,
} from './components/index.mjs';
import { dict } from './constants/index.mjs';
import { loanStore } from './store/index.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)} data-e2e={constant('root')}>
    <div class={constant(styles.title)}>{constant(dict.appTitle)}</div>
    <div class={constant(styles.section)}>
      <div class={constant(styles.paper)}>
        <ConfigSection />
      </div>
    </div>
    <div class={constant(styles.section)}>
      <div class={constant(styles.paper)}>
        <WhileCalculating>
          <SummarySection />
        </WhileCalculating>
      </div>
    </div>
    <div class={constant(styles.section)}>
      <div class={constant(styles.paper)}>
        <WhileCalculating>
          <PaymentTable />
        </WhileCalculating>
      </div>
    </div>
  </div>
);

/**
 * A spinner in place of `children` while the figures are being calculated.
 * `children` stay mounted, hidden, so that they update in place.
 */
const WhileCalculating = ({
  children,
}: Readonly<{ children: Child }>): JSX.Element => (
  <>
    <If
      cond={loanStore.isCalculating}
      then={
        <div class={constant(styles.spinner)}>
          <Spinner intent={'primary'} size={SpinnerSize.STANDARD} />
        </div>
      }
    />
    <div hidden={loanStore.isCalculating}>{children}</div>
  </>
);
