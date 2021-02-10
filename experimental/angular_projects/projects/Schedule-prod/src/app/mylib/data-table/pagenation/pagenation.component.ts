import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, combineLatest, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { utils } from '../../utilities';


@Component({
  selector: 'app-data-table--pagenation',
  templateUrl: './pagenation.component.html',
  styleUrls: ['./pagenation.component.css']
})
export class PagenationComponent implements OnInit {

  private selectedPageIndexSource = new ReplaySubject<number>(1);
  @Input() set selectedPageIndex( value: number ) {
    this.selectedPageIndexSource.next( value );
  }
  selectedPageIndex$: Observable<number> = this.selectedPageIndexSource.asObservable();

  @Output() selectedPageIndexChange = new EventEmitter<number>();


  private itemsPerPageSource = new ReplaySubject<number>(1);
  @Input() set itemsPerPage( value: number ) {
    this.itemsPerPageSource.next( value );
  }
  itemsPerPage$: Observable<number> = this.itemsPerPageSource.asObservable();


  private dataSizeSource = new ReplaySubject<number>(1);
  @Input() set dataSize( value: number ) {
    this.dataSizeSource.next( value );
  }
  dataSize$: Observable<number> = this.dataSizeSource.asObservable();


  rangeStart$!: Observable<number>;
  rangeEnd$!:   Observable<number>;
  pageLength$!: Observable<number>;
  pageIndice$!: Observable<number[]>;


  constructor() {}

  ngOnInit() {
    this.pageLength$ = combineLatest(
        this.itemsPerPage$,
        this.dataSize$,
        (itemsPerPage, dataSize) => Math.ceil( dataSize / itemsPerPage ) );

    this.pageIndice$
      = this.pageLength$.pipe( map( len => utils.number.seq0( len ) ) );

    this.rangeStart$ = combineLatest(
        this.itemsPerPage$,
        this.selectedPageIndex$,
        (itemsPerPage, selectedPageIndex) =>
          itemsPerPage * selectedPageIndex + 1 );

    this.rangeEnd$ = combineLatest(
        this.itemsPerPage$,
        this.selectedPageIndex$,
        this.dataSize$,
        (itemsPerPage, idx, dataSize) =>
          Math.min( dataSize, (itemsPerPage * (idx + 1)) ) );
  }

  setSelectedPageIndex( idx: number ) {
    this.selectedPageIndexChange.emit( idx );
  }
}



export function getDataAtPage<T>(
  data: Array<T>,
  itemsPerPage: number,
  selectedPageIndex: number
): Array<T> {
  return data.slice( itemsPerPage * selectedPageIndex, itemsPerPage * (selectedPageIndex + 1) );
}
