import { memoNamed } from 'preact-utils';
import { noticeSignal, uiStore } from '../store/index.mjs';

/** The last thing that went wrong — a write refused, a listener cut off. */
export const NoticeBar = memoNamed('NoticeBar', () => {
  const notice = noticeSignal.value;

  return notice === undefined ? undefined : (
    <div className={'bp6-callout bp6-intent-danger notice-bar'} role={'alert'}>
      <span>{notice}</span>
      <button
        className={'bp6-button bp6-minimal'}
        type={'button'}
        onClick={uiStore.dismissNotice}
      >
        {'閉じる'}
      </button>
    </div>
  );
});
