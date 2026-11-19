// organize-imports-ignore -- the bordered table first: the answer tables'
// padding is drawn over it, so the order is the cascade.
import * as borderedTable from './bordered-table.module.css';
import * as answerInputTable from './answer-input-table.module.css';
import * as maxWidthModal from './max-width-modal.module.css';
import * as nowrap from './nowrap.module.css';
import * as pageWidth from './page-width.module.css';

/** react-blueprintjs-utils' bordered table, as it was drawn. */
export const borderedTableClass: string = borderedTable.table;

/** An Alert or a Dialog as wide as its contents, up to 500px or 90% of the screen. */
export const maxWidthModalClass: string = maxWidthModal.maxWidth;

/**
 * A page's content and title, 1220px at most, centred, each keeping its own
 * margins inside; the navbar stays screen-wide.
 */
export const pageWidthClass: string = pageWidth.pageWidth;

/** Text that does not wrap, such as a button's. */
export const nowrapClass: string = nowrap.nowrap;

/** The answer form's and the batch input's table, cells padded less. */
export const answerInputTableClass: string = answerInputTable.table;

/** The answer tables' point column. */
export const answerPointCellClass: string = answerInputTable.pointCell;

/** The answer tables' comment input. */
export const answerCommentCellClass: string = answerInputTable.cellComment;
