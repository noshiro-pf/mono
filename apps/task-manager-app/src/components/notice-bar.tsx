import { constant, If, view, type JSX } from 'synstate-dom';
import { uiStore } from '../store/index.mjs';

/** The last thing that went wrong — a write refused, a listener cut off. */
export const NoticeBar = (): JSX.Element => (
  <If
    cond={view(uiStore.notice, (notice) => notice !== undefined)}
    then={
      <div
        class={constant('bp6-callout bp6-intent-danger notice-bar')}
        role={constant('alert')}
      >
        <span>{view(uiStore.notice, (notice) => notice ?? '')}</span>
        <button
          class={constant('bp6-button bp6-minimal')}
          type={constant('button')}
          onClick={uiStore.dismissNotice}
        >
          {constant('閉じる')}
        </button>
      </div>
    }
  />
);
