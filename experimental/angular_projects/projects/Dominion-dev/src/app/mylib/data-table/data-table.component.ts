import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Sort, SortDirection } from '@angular/material';
import { combine, manual, merge, RN } from 'rnjs';
import { filterFn } from './functions/filter-function';
import { getSorted } from './functions/get-sorted';
import { isValidSetting_withTable } from './functions/is-valid-setting';
import { makeSelectOptions } from './functions/make-select-options';
import { slice } from './functions/slice';
import { CellPosition } from './types/cell-position';
import { NoColumn } from './types/no-column';
import { SelectorOption } from './types/selector-option';
import { TableSettings } from './types/table-settings';

const DEBOUNCE_TIME = 300;
const DEBOUNCE_TIME_SHORT = 50;

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent implements OnInit, OnDestroy {
  private alive = true;

  /**
   * sypported cell types:
   *   * number
   *   * string
   *   * boolean,
   *   * Array<number>
   *   * Array<string>
   *   * Array<boolean>
   */

  // input & output

  private tableSource = manual<any[][]>([]);

  @Input() set table(value: any[][]) {
    this.tableSource.emit(value);
  }

  private settingsSource = manual<TableSettings>(new TableSettings());

  @Input() set settings(value: TableSettings) {
    this.settingsSource.emit(value);
  }

  private readonly _tableSettingsPair$: RN<[any[][], TableSettings]> = combine(
    this.tableSource.debounce(DEBOUNCE_TIME),
    this.settingsSource.debounce(DEBOUNCE_TIME)
  ).filter([[], new TableSettings()], ([table, settings]) =>
    isValidSetting_withTable(settings, table)
  );

  readonly table$: RN<any[][]> = this._tableSettingsPair$.map((e) => e[0]);
  private readonly settings$: RN<TableSettings> = this._tableSettingsPair$.map(
    (e) => e[1]
  );

  @Output() clickedCellPosition = new EventEmitter<CellPosition>();

  @Output() tableFilteredIndexedChange = new EventEmitter<
    { val: any; idx: number }[]
  >();

  /***************************************************************************/

  /* user input */

  private itemsPerPageSource = manual<number>(50);
  private itemsPerPageChange$ =
    this.itemsPerPageSource.debounce(DEBOUNCE_TIME_SHORT);

  private pageNumberSource = manual<number>(1);
  private pageNumberChange$ =
    this.pageNumberSource.debounce(DEBOUNCE_TIME_SHORT);

  private headerValueSource = manual<{ columnIndex: number; value: any }>({
    columnIndex: 0,
    value: 0,
  });
  private headerValueChange$ = this.headerValueSource.debounce(DEBOUNCE_TIME);

  private resetAllClickSource = manual<void>(null);
  private resetAllClick$ =
    this.resetAllClickSource.debounce(DEBOUNCE_TIME_SHORT);

  private resetClickSource = manual<number>(0);
  private resetClick$ = this.resetClickSource.debounce(DEBOUNCE_TIME_SHORT);

  private sortBySource = manual<Sort>({ active: '', direction: 'asc' });
  private sortByChange$ = this.sortBySource.debounce(DEBOUNCE_TIME_SHORT);

  /***************************************************************************/

  itemsPerPage$: RN<number>;
  pageNumber$: RN<number>;
  headerValuesAll$: RN<(any | undefined)[]>;
  selectorOptionsAll$: RN<SelectorOption[][]>;
  tableSlicedTransformedIndexed$: RN<{ val: string[]; idx: number }[]>;
  filteredLength$: RN<number>;
  sortBy$: RN<Sort>;

  readonly NoColumn = NoColumn;

  constructor() {
    /* table header */

    const headerValuesAll$: RN<(any | undefined)[]> = merge(
      this.settings$.map((e) => e.headerSettings.map(() => undefined)), // 初期値
      this.resetAllClick$.mapTo({ columnIndex: -1, value: undefined }),
      this.resetClick$.map((colIndex) => ({
        columnIndex: colIndex,
        value: undefined,
      })),
      this.headerValueChange$
    ).scan(
      [],
      (
        acc: (any | undefined)[],
        value: { columnIndex: number; value: any } | undefined[]
      ) => {
        if (Array.isArray(value)) {
          return value;
        } else {
          if (value.columnIndex === -1) {
            acc.forEach((_, i, a) => (a[i] = undefined));
            return acc;
          } else {
            acc[value.columnIndex] = value.value;
            return acc;
          }
        }
      }
    );

    const sortBy$: RN<Sort> = merge(
      this.settings$.pluck('sortInit'),
      this.sortByChange$,
      this.resetAllClick$.mapTo({
        active: NoColumn,
        direction: '' as SortDirection,
      })
    ).skipUnchanged(
      (a, b) => a.active === b.active && a.direction === b.direction
    );

    const tableFilteredIndexed$: RN<{ val: any[]; idx: number }[]> = combine(
      this.table$,
      this.settings$,
      headerValuesAll$
    ).map(([table, settings, headerValuesAll]) =>
      table
        .map((e, i) => ({ val: e, idx: i }))
        .filter((e) =>
          filterFn(e.val, settings.headerSettings, headerValuesAll)
        )
    );

    const filteredLength$: RN<number> = tableFilteredIndexed$.pluck('length');

    /* pagenation */

    const itemsPerPage$: RN<number> = merge(
      this.settings$.map((e) => e.itemsPerPageInit || 100),
      this.itemsPerPageChange$,
      this.resetAllClick$
        .withLatest(this.settings$)
        .map(([_, settings]) => settings.itemsPerPageInit || 100)
    );

    const pageLength$: RN<number> = combine(filteredLength$, itemsPerPage$).map(
      ([length, itemsPerPage]) => Math.ceil(length / itemsPerPage)
    );

    const pageNumber$: RN<number> = merge(
      this.pageNumberChange$,
      pageLength$.mapTo(1),
      this.resetAllClick$.mapTo(1)
    );

    /* table */

    const tableFilteredSortedIndexed$: RN<{ val: any[]; idx: number }[]> =
      combine(tableFilteredIndexed$, sortBy$, this.settings$).map(
        ([tbl, sortBy, settings]) => getSorted(tbl, sortBy, settings)
      );

    const tableSlicedIndexed$: RN<{ val: any[]; idx: number }[]> = combine(
      itemsPerPage$,
      pageNumber$,
      this.settings$.map((e) => !!e.usepagination),
      tableFilteredSortedIndexed$
    ).map(([itemsPerPage, pageNumber, usePagenation, tbl]) =>
      usePagenation ? slice(tbl, itemsPerPage, pageNumber) : tbl
    );

    const tableSlicedTransformedIndexed$: RN<{ val: string[]; idx: number }[]> =
      combine(tableSlicedIndexed$, this.settings$).map(([tbl, settings]) =>
        tbl.map((line) => ({
          idx: line.idx,
          val: line.val.map((e, i) => {
            const tr = settings.headerSettings[i].transform;
            return tr === undefined ? e : tr(e);
          }),
        }))
      );

    const selectorOptionsAll$: RN<SelectorOption[][]> = combine(
      tableFilteredIndexed$.map((list) => list.map((e) => e.val)),
      this.table$,
      this.settings$
    ).map(([tableFiltered, table, settings]) =>
      makeSelectOptions(table, tableFiltered, settings.headerSettings)
    );

    tableFilteredIndexed$
      .takeWhile(() => this.alive)
      .subscribe((val) => {
        this.tableFilteredIndexedChange.emit(val);
      });

    this.itemsPerPage$ = itemsPerPage$;
    this.pageNumber$ = pageNumber$;
    this.headerValuesAll$ = headerValuesAll$;
    this.selectorOptionsAll$ = selectorOptionsAll$;
    this.filteredLength$ = filteredLength$;
    this.sortBy$ = sortBy$;
    this.tableSlicedTransformedIndexed$ = tableSlicedTransformedIndexed$;
  }

  ngOnDestroy() {
    this.alive = false;
  }

  ngOnInit() {}

  itemsPerPageOnChange(itemsPerPage: number) {
    this.itemsPerPageSource.emit(itemsPerPage);
  }

  pageNumberOnChange(pageNumber: number) {
    this.pageNumberSource.emit(pageNumber);
  }

  headerValueOnChange(columnIndex: number, value: any | undefined) {
    this.headerValueSource.emit({ columnIndex: columnIndex, value: value });
  }

  resetOnClick(columnIndex: number) {
    this.resetClickSource.emit(columnIndex);
  }

  resetAllOnClick() {
    this.resetAllClickSource.emit(null);
  }

  sortOnChange(sortBy: Sort) {
    this.sortBySource.emit(sortBy);
  }

  cellOnClick(
    rowIndexInThisPage: number,
    columnIndex: number,
    itemsPerPage: number,
    pageNumber: number,
    tableSlicedTransformedIndexed: { val: any; idx: number }[]
  ) {
    this.clickedCellPosition.emit({
      rowIndex: tableSlicedTransformedIndexed[rowIndexInThisPage].idx,
      rowIndexInTableFiltered:
        itemsPerPage * (pageNumber - 1) + rowIndexInThisPage,
      columnIndex: columnIndex,
    });
  }
}
