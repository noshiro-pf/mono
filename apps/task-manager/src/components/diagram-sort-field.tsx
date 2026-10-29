import { constant, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
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
      {constant(m.settings.diagramSort)}
    </legend>
    <SortEditor
      actions={diagramSortStore}
      data-e2e={'diagram-sort-editor'}
      emptyNote={m.settings.noDiagramSortKeys}
      label={m.settings.diagramSortKeys}
      sort={diagramSortStore.sort}
    />
    <p class={constant('settings-hint')} id={constant(HINT_ID)}>
      {constant(m.settings.diagramSortHint)}
    </p>
  </fieldset>
);

const HINT_ID = 'diagram-sort-hint';
