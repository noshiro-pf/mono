import { map } from 'synstate';
import { constant, If, inlineMap, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { uiStore } from '../store/index.mjs';

/** The last thing that went wrong — a write refused, a listener cut off. */
export const NoticeBar = (): JSX.Element => (
  <If
    cond={uiStore.notice.pipe(map((notice) => notice !== undefined))}
    then={
      <div
        class={constant('bp6-callout bp6-intent-danger notice-bar')}
        role={constant('alert')}
      >
        <span>{inlineMap(uiStore.notice, (notice) => notice ?? '')}</span>
        <button
          class={constant('bp6-button bp6-minimal')}
          type={constant('button')}
          onClick={uiStore.dismissNotice}
        >
          {constant(m.common.close)}
        </button>
      </div>
    }
  />
);
