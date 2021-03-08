import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { debounceTime, map, takeWhile, withLatestFrom } from 'rxjs/operators';
import { utils } from '../utilities';
import { getDataAtPage } from './pagenation/pagenation.component';

export class ColumnSetting {
  name: string = '';
  headerTitle: string = '';
  align?: 'l' | 'c' | 'r' = 'c';
  isButton?: boolean = false;
  manip?: '' | 'input' | 'select' | 'multiSelect-and' | 'multiSelect-or' = '';
  selectOptions$?: Observable<{ value: any; viewValue: string }[]>; // select, multiSelect-and
  selectOptions?: { value: any; viewValue: string }[] = []; // select, multiSelect-and
  manipState?: any;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  @Input() readonly usePagenation: boolean = true;

  private dataSource = new ReplaySubject<any[]>(1);
  @Input() set data(value: any[]) {
    this.dataSource.next(value);
  }
  data$: Observable<any[]> = this.dataSource.asObservable();

  private filteredData$!: Observable<any[]>;
  private filteredIndice$!: Observable<number[]>;
  filteredDataLength$!: Observable<number>;
  @Output() filteredDataOnChange = new EventEmitter<any[]>();
  @Output() filteredIndiceOnChange = new EventEmitter<number[]>();

  private columnSettingsSource = new BehaviorSubject<ColumnSetting[]>([]);
  columnSettings$ = this.columnSettingsSource
    .asObservable()
    .pipe(debounceTime(300 /* ms */));
  @Input() set columnSettings(value: ColumnSetting[]) {
    this.columnSettingsSource.next(value);
  }

  // pagenation
  @Input() readonly itemsPerPageOptions: number[] = [];

  private itemsPerPageSource = new BehaviorSubject<number>(100);
  itemsPerPage$ = this.itemsPerPageSource.asObservable();
  @Input() set itemsPerPageInit(value: number) {
    this.itemsPerPageSource.next(value);
  }

  private selectedPageIndexSource = new BehaviorSubject<number>(0);
  selectedPageIndex$ = this.selectedPageIndexSource.asObservable();

  private pagenatedData$!: Observable<any[]>;

  @Input() readonly transform = (columnName: string, value: any) => value; // transform cell data at printing
  transformedPagenatedData$!: Observable<any[]>;

  @Output() clicked = new EventEmitter<{
    rowIndex: number;
    rowIndexOnFiltered: number;
    columnName: string;
  }>();

  constructor() {}

  ngOnInit() {
    this.filteredIndice$ = combineLatest(
      this.data$,
      this.columnSettings$,
      (data, columnSettings) =>
        data
          .map((e, i) => ({ val: e, idx: i }))
          .filter((e) => this.filterFn(e.val, columnSettings))
          .map((e) => e.idx)
    );

    this.filteredData$ = this.filteredIndice$.pipe(
      withLatestFrom(this.data$),
      map(([indice, data]) => indice.map((idx) => data[idx]))
    );

    this.filteredDataLength$ = this.filteredData$.pipe(map((e) => e.length));

    this.pagenatedData$ = combineLatest(
      this.filteredData$,
      this.itemsPerPage$,
      this.selectedPageIndex$,
      (filteredData, itemsPerPage, selectedPageIndex) =>
        getDataAtPage(filteredData, itemsPerPage, selectedPageIndex)
    );

    this.transformedPagenatedData$ = this.pagenatedData$.pipe(
      map((data) =>
        data.map((line) => {
          const transformed: any = {};
          Object.keys(line).forEach((key) => {
            if (Array.isArray(line[key])) {
              transformed[key] = line[key]
                .map((e: any) => this.transform(key, e))
                .join(', ');
            } else {
              transformed[key] = this.transform(key, line[key]);
            }
          });
          return transformed;
        })
      )
    );

    /* subscriptions */
    this.filteredIndice$.pipe(takeWhile(() => this.alive)).subscribe((val) => {
      this.selectedPageIndexSource.next(0);
      this.filteredIndiceOnChange.emit(val);
    });

    this.filteredData$
      .pipe(takeWhile(() => this.alive))
      .subscribe((val) => this.filteredDataOnChange.emit(val));

    this.filteredData$
      .pipe(
        withLatestFrom(this.data$),
        takeWhile(() => this.alive)
      )
      .subscribe(([filteredData, data]) => {
        const columnSettings = this.columnSettingsSource.getValue();
        columnSettings.forEach((column) => {
          const dataOfColumn = data.map((line) => line[column.name]);
          const dataOfColumnFiltered = filteredData.map(
            (line) => line[column.name]
          );
          switch (column.manip) {
            case 'select':
              {
                const options = utils.array.uniq(dataOfColumn).sort();
                column.selectOptions = options.map((e) => ({
                  value: e,
                  viewValue:
                    this.transform(column.name, e) +
                    `(${
                      dataOfColumnFiltered.filter((cell) => cell === e).length
                    })`,
                }));
              }
              break;
            case 'multiSelect-or':
            case 'multiSelect-and':
              {
                const options = utils.array
                  .uniq([].concat(...dataOfColumn))
                  .sort();
                column.selectOptions = options.map((e) => ({
                  value: e,
                  viewValue:
                    this.transform(column.name, e) +
                    `(${
                      dataOfColumnFiltered.filter((cell) => cell.includes(e))
                        .length
                    })`,
                }));
              }
              break;
            default:
              break;
          }
        });
        this.columnSettingsSource.next(columnSettings);
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  itemsPerPageOnChange(value: number) {
    this.itemsPerPageSource.next(value);
    this.selectedPageIndexSource.next(0);
  }

  selectedPageIndexOnChange(value: number) {
    this.selectedPageIndexSource.next(value);
  }

  cellClicked(
    rawData: any,
    rowIndexOnThisPage: number,
    columnName: string,
    columnSettings: ColumnSetting[]
  ) {
    const rowIndexOnFilteredData =
      this.itemsPerPageSource.value * this.selectedPageIndexSource.value +
      rowIndexOnThisPage;
    this.clicked.emit({
      rowIndex: this.indexOnRawData(
        rawData,
        rowIndexOnFilteredData,
        columnSettings
      ),
      rowIndexOnFiltered: rowIndexOnFilteredData,
      columnName: columnName,
    });
  }

  changeColumnState(columnName: string, value: any) {
    const columnSettings = this.columnSettingsSource.getValue();
    const column = columnSettings.find((e) => e.name === columnName);
    if (column === undefined) return;
    column.manipState = value;
    this.columnSettingsSource.next(columnSettings);
  }

  reset(columnName: string) {
    this.changeColumnState(columnName, undefined);
  }

  resetAll() {
    const columnSettings = this.columnSettingsSource.getValue();
    columnSettings.forEach((e) => (e.manipState = undefined));
    this.columnSettingsSource.next(columnSettings);
  }

  private filterFn(lineOfData: any, columnSettings: ColumnSetting[]): boolean {
    const validSettings = columnSettings.filter(
      (column) => column.manipState !== undefined
    );

    for (const column of validSettings) {
      /* no mismatches => return true; 1 or more mismatches => return false */
      switch (column.manip) {
        case 'input':
          if (
            !utils.string.submatch(
              lineOfData[column.name],
              column.manipState,
              true
            )
          )
            return false;
          break;

        case 'select':
          if (lineOfData[column.name] !== column.manipState) return false;
          break;

        case 'multiSelect-and':
          if (!!column.manipState && column.manipState.length > 0) {
            const cellValue = lineOfData[column.name];
            if (!utils.array.isSubset(column.manipState, cellValue))
              return false;
            /* for any e \in column.manipState, e \in cellValue */
          }
          break;

        case 'multiSelect-or':
          /* column.manipStateの初期状態はundefinedなのでfilteringされなくなっており，
             column.manipStateの全選択初期化は不要になっている */
          if (!!column.manipState && column.manipState.length > 0) {
            const cellValue = lineOfData[column.name];
            if (
              utils.array.setIntersection(column.manipState, cellValue)
                .length === 0
            )
              return false;
            /* for some e \in column.manipState, e \in cellValue */
          }
          break;

        default:
          break;
      }
    }
    return true;
  }

  private indexOnRawData(
    rawData: any,
    indexOnFilteredData: number,
    columnSettings: ColumnSetting[]
  ): number {
    for (let i = 0, filteredDataNum = 0; i < rawData.length; ++i) {
      if (this.filterFn(rawData[i], columnSettings)) filteredDataNum++;
      if (filteredDataNum > indexOnFilteredData) return i;
    }
    return rawData.length - 1;
  }
}
