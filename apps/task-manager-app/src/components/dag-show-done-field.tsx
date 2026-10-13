import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { dagShowDoneSignal, dagShowDoneStore } from '../store/index.mjs';

/**
 * Whether the done tasks are drawn, in every view mode: off unless turned
 * on, and then they and the edges from them are left out
 * (`dag/hidden-nodes.mts`). Kept on this device, apart from the list's
 * 「完了を隠す」.
 */
export const DagShowDoneField = memoNamed('DagShowDoneField', () => (
  <div className={'settings-field'}>
    <label className={'bp6-control bp6-switch settings-switch'}>
      <input
        aria-describedby={HINT_ID}
        checked={dagShowDoneSignal.value}
        className={'bp6-control-input'}
        data-e2e={'dag-show-done'}
        type={'checkbox'}
        onChange={onShowDoneChange}
      />
      <span className={'bp6-control-indicator'} />
      {'完了済みのタスクを表示'}
    </label>
    <p className={'settings-hint'} id={HINT_ID}>
      {
        'オフのあいだは、完了したタスクとそこからの依存の線を描きません。リストの「完了を隠す」とは別の設定です。'
      }
    </p>
  </div>
));

const onShowDoneChange: GenericEventHandler<HTMLInputElement> = (changed) => {
  dagShowDoneStore.set(changed.currentTarget.checked);
};

const HINT_ID = 'dag-show-done-hint';
