import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { editorStore } from '../store/index.mjs';

type Props = Readonly<{
  confirming: Bindable<boolean>;
}>;

/**
 * Delete, in two steps: the first press asks, the second deletes — the node
 * and every dependency on it.
 */
export const DeleteControls = ({ confirming }: Props): JSX.Element => (
  <If
    cond={confirming}
    then={
      <fieldset
        aria-label={constant('削除の確認')}
        class={constant('delete-confirm')}
      >
        <span>{constant('依存ごと削除しますか？')}</span>
        <button
          class={constant('bp6-button bp6-intent-danger')}
          data-e2e={constant('confirm-delete')}
          type={constant('button')}
          onClick={editorStore.confirmDelete}
        >
          {constant('削除する')}
        </button>
        <button
          class={constant('bp6-button')}
          type={constant('button')}
          onClick={editorStore.cancelDelete}
        >
          {constant('やめる')}
        </button>
      </fieldset>
    }
    else={
      <button
        class={constant('bp6-button bp6-minimal bp6-intent-danger')}
        data-e2e={constant('delete')}
        type={constant('button')}
        onClick={editorStore.requestDelete}
      >
        {constant('削除')}
      </button>
    }
  />
);
