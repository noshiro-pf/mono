import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Sort, SortDirection } from '@angular/material';
import { RN, combine, manual, merge } from 'rnjs';
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

  private readonly tableSource = manual<any[][]>([]);

  @Input() set table(value: any[][]) {
    this.tableSource.emit(value);
  }

  private readonly settingsSource = manual<TableSettings>(new TableSettings());

  @Input() set settings(value: TableSettings) {
    this.settingsSource.emit(value);
  }

  private readonly _tableSettingsPair$: RN<[any[][], TableSettings]> = combine(
    this.tableSource.debounce(DEBOUNCE_TIME),
    this.settingsSource.debounce(DEBOUNCE_TIME),
  ).filter([[], new TableSettings()], ([table, settings]) =>
    isValidSetting_withTable(settings, table),
  );

  readonly table$: RN<any[][]> = this._tableSettingsPair$.map((e) => e[0]);
  readonly settings$: RN<TableSettings> = this._tableSettingsPair$.map(
    (e) => e[1],
  );

  @Output() clickedCellPosition = new EventEmitter<CellPosition>();

  @Output() tableFilteredIndexedChange = new EventEmitter<
    { val: any; idx: number }[]
  >();

  /***************************************************************************/

  /* user input */

  private readonly itemsPerPageSource = manual<number>(50);
  private readonly itemsPerPageChange$ =
    this.itemsPerPageSource.debounce(DEBOUNCE_TIME_SHORT);

  private readonly pageNumberSource = manual<number>(1);
  private readonly pageNumberChange$ =
    this.pageNumberSource.debounce(DEBOUNCE_TIME_SHORT);

  private readonly headerValueSource = manual<{
    columnIndex: number;
    value: any;
  }>({ columnIndex: 0, value: 0 });
  private readonly headerValueChange$ =
    this.headerValueSource.debounce(DEBOUNCE_TIME);

  private readonly resetAllClickSource = manual<void>(null);
  private readonly resetAllClick$ =
    this.resetAllClickSource.debounce(DEBOUNCE_TIME_SHORT);

  private readonly resetClickSource = manual<number>(0);
  private readonly resetClick$ =
    this.resetClickSource.debounce(DEBOUNCE_TIME_SHORT);

  private readonly sortBySource = manual<Sort>({
    active: '',
    direction: 'asc',
  });
  private readonly sortByChange$ =
    this.sortBySource.debounce(DEBOUNCE_TIME_SHORT);

  /***************************************************************************/

  readonly headerValuesAll$: RN<(any | undefined)[]> = merge(
    this.settings$.map((e) => e.headerSettings.map(() => undefined)), // 初期値
    this.resetAllClick$.mapTo({ columnIndex: -1, value: undefined }),
    this.resetClick$.map((colIndex) => ({
      columnIndex: colIndex,
      value: undefined,
    })),
    this.headerValueChange$,
  ).scan(
    [],
    (
      acc: (any | undefined)[],
      value: { columnIndex: number; value: any } | undefined[],
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
    },
  );

  readonly itemsPerPage$: RN<number> = merge(
    this.settings$.map((e) => e.itemsPerPageInit || 100),
    this.itemsPerPageChange$,
    this.resetAllClick$
      .withLatest(this.settings$)
      .map(([_, settings]) => settings.itemsPerPageInit || 100),
  );

  private readonly tableFilteredIndexed$: RN<{ val: any[]; idx: number }[]> =
    combine(this.table$, this.settings$, this.headerValuesAll$).map(
      ([table, settings, headerValuesAll]) =>
        table
          .map((e, i) => ({ val: e, idx: i }))
          .filter((e) =>
            filterFn(e.val, settings.headerSettings, headerValuesAll),
          ),
    );

  readonly filteredLength$: RN<number> =
    this.tableFilteredIndexed$.pluck('length');

  private readonly pageLength$: RN<number> = combine(
    this.filteredLength$,
    this.itemsPerPage$,
  ).map(([length, itemsPerPage]) => Math.ceil(length / itemsPerPage));

  readonly pageNumber$: RN<number> = merge(
    this.pageNumberChange$,
    this.pageLength$.mapTo(1),
    this.resetAllClick$.mapTo(1),
  );

  readonly sortBy$: RN<Sort> = merge(
    this.settings$.pluck('sortInit'),
    this.sortByChange$,
    this.resetAllClick$.mapTo({
      active: NoColumn,
      direction: '' as SortDirection,
    }),
  ).skipUnchanged(
    (a, b) => a.active === b.active && a.direction === b.direction,
  );

  private readonly tableFilteredSortedIndexed$: RN<
    { val: any[]; idx: number }[]
  > = combine(this.tableFilteredIndexed$, this.sortBy$, this.settings$).map(
    ([tbl, sortBy, settings]) => getSorted(tbl, sortBy, settings),
  );

  private readonly tableSlicedIndexed$: RN<{ val: any[]; idx: number }[]> =
    combine(
      this.itemsPerPage$,
      this.pageNumber$,
      this.settings$.map((e) => !!e.usepagination),
      this.tableFilteredSortedIndexed$,
    ).map(([itemsPerPage, pageNumber, usePagenation, tbl]) =>
      usePagenation ? slice(tbl, itemsPerPage, pageNumber) : tbl,
    );

  readonly tableSlicedTransformedIndexed$: RN<
    { val: string[]; idx: number }[]
  > = combine(this.tableSlicedIndexed$, this.settings$).map(([tbl, settings]) =>
    tbl.map((line) => ({
      idx: line.idx,
      val: line.val.map((e, i) => {
        const tr = settings.headerSettings[i].transform;
        return tr === undefined ? e : tr(e);
      }),
    })),
  );

  readonly selectorOptionsAll$: RN<SelectorOption[][]> = combine(
    this.tableFilteredIndexed$.map((list) => list.map((e) => e.val)),
    this.table$,
    this.settings$,
  ).map(([tableFiltered, table, settings]) =>
    makeSelectOptions(table, tableFiltered, settings.headerSettings),
  );

  readonly NoColumn = NoColumn;

  constructor() {
    this.tableFilteredIndexed$
      .takeWhile(() => this.alive)
      .subscribe((val) => {
        this.tableFilteredIndexedChange.emit(val);
      });
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
    tableSlicedTransformedIndexed: { val: any; idx: number }[],
  ) {
    this.clickedCellPosition.emit({
      rowIndex: tableSlicedTransformedIndexed[rowIndexInThisPage].idx,
      rowIndexInTableFiltered:
        itemsPerPage * (pageNumber - 1) + rowIndexInThisPage,
      columnIndex: columnIndex,
    });
  }
}
