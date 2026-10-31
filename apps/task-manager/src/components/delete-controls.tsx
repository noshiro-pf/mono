import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { editorStore } from '../store/index.mjs';

type Props = Readonly<{
  confirming: Bindable<boolean>;
}>;

/**
 * Delete, in two steps: the first press asks, the second deletes — the node and
 * every dependency on it.
 */
export const DeleteControls = ({ confirming }: Props): JSX.Element => (
  <If
    cond={confirming}
    then={
      <fieldset
        aria-label={constant(m.common.deleteConfirmation)}
        class={constant('delete-confirm')}
      >
        <span>{constant(m.nodeDialog.confirmDelete)}</span>
        <button
          class={constant('bp6-button bp6-intent-danger')}
          data-e2e={constant('confirm-delete')}
          type={constant('button')}
          onClick={editorStore.confirmDelete}
        >
          {constant(m.common.confirmDelete)}
        </button>
        <button
          class={constant('bp6-button')}
          type={constant('button')}
          onClick={editorStore.cancelDelete}
        >
          {constant(m.common.keep)}
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
        {constant(m.common.delete)}
      </button>
    }
  />
);
