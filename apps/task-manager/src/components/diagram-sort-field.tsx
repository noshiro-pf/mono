import { constant, type JSX } from 'synstate-dom';
import { diagramSortStore } from '../store/index.mjs';
import { SortEditor } from './sort-editor.js';

/**
 * 「並び順」: the order of the tasks in 「アーク」 and 「タイル」, one for
 * both and apart from the list's, edited with the list's sort editor. With
 * no keys, by title ascending. Kept on this device.
 */
export const DiagramSortField = (): JSX.Element => (
  <fieldset
    aria-describedby={constant(HINT_ID)}
    class={constant('settings-field')}
  >
    <legend class={constant('settings-field-label')}>
      {constant('並び順')}
    </legend>
    <SortEditor
      actions={diagramSortStore}
      data-e2e={'diagram-sort-editor'}
      emptyNote={'キーがありません。タイトルの昇順で並べます。'}
      label={'並び順のキー'}
      sort={diagramSortStore.sort}
    />
    <p class={constant('settings-hint')} id={constant(HINT_ID)}>
      {constant(
        '「アーク」と「タイル」で共通の並び順。上のキーから順に比べ、同じなら次のキーで比べます。',
      )}
    </p>
  </fieldset>
);

const HINT_ID = 'diagram-sort-hint';
