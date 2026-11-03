// organize-imports-ignore -- the bordered table first: the answer tables'
// padding is drawn over it, so the order is the cascade.
import * as borderedTable from './bordered-table.module.css';
import * as answerInputTable from './answer-input-table.module.css';
import * as maxWidthModal from './max-width-modal.module.css';
import * as nowrap from './nowrap.module.css';

/** react-blueprintjs-utils' bordered table, as it was drawn. */
export const borderedTableClass: string = borderedTable.table;

/** An Alert or a Dialog as wide as its contents, up to 500px or 90% of the screen. */
export const maxWidthModalClass: string = maxWidthModal.maxWidth;

/** Text that does not wrap, such as a button's. */
export const nowrapClass: string = nowrap.nowrap;

/** The answer form's and the batch input's table, cells padded less. */
export const answerInputTableClass: string = answerInputTable.table;

/** The answer tables' point column. */
export const answerPointCellClass: string = answerInputTable.pointCell;

/** The answer tables' comment input. */
export const answerCommentCellClass: string = answerInputTable.cellComment;
