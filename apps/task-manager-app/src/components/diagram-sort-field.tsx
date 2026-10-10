import { memoNamed } from 'preact-utils';
import { diagramSortSignal, diagramSortStore } from '../store/index.mjs';
import { SortEditor } from './sort-editor.js';

/**
 * 「並び順」: the order of the tasks in 「アーク」 and 「タイル」, one for
 * both and apart from the list's, edited with the list's sort editor. With
 * no keys, by title ascending. Kept on this device.
 */
export const DiagramSortField = memoNamed('DiagramSortField', () => (
  <fieldset aria-describedby={HINT_ID} className={'settings-field'}>
    <legend className={'settings-field-label'}>{'並び順'}</legend>
    <SortEditor
      actions={diagramSortStore}
      data-e2e={'diagram-sort-editor'}
      emptyNote={'キーがありません。タイトルの昇順で並べます。'}
      label={'並び順のキー'}
      sort={diagramSortSignal.value}
    />
    <p className={'settings-hint'} id={HINT_ID}>
      {
        '「アーク」と「タイル」で共通の並び順。上のキーから順に比べ、同じなら次のキーで比べます。'
      }
    </p>
  </fieldset>
));

const HINT_ID = 'diagram-sort-hint';
