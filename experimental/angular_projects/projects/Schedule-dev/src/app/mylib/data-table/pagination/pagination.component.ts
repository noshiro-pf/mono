import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RN, combine, manual } from 'rnjs';
import { utils } from '../../utilities';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit {
  readonly rowSize$ = manual<number>(1);

  @Input() set rowSize(value: number) {
    if (value === undefined || value === null) return;
    this.rowSize$.emit(value);
  }

  readonly itemsPerPage$ = manual(1);

  @Input() set itemsPerPage(value: number) {
    if (value === undefined || value === null) return;
    this.itemsPerPage$.emit(value);
  }

  readonly pageNumber$ = manual(1);

  @Input() set pageNumber(value: number) {
    if (value === undefined || value === null) return;
    this.pageNumber$.emit(value);
  }

  @Output() pageNumberChange = new EventEmitter<number>();

  readonly pageLength$: RN<number> = combine(
    this.rowSize$,
    this.itemsPerPage$
  ).map(([rowSize, itemsPerPage]) => Math.ceil(rowSize / itemsPerPage));

  readonly rangeStart$: RN<number> = combine(
    this.itemsPerPage$,
    this.pageNumber$
  ).map(([itemsPerPage, pageNumber]) => itemsPerPage * (pageNumber - 1) + 1);

  readonly rangeEnd$: RN<number> = combine(
    this.itemsPerPage$,
    this.pageNumber$,
    this.rowSize$
  ).map(([itemsPerPage, pageNumber, rowSize]) =>
    Math.min(rowSize, itemsPerPage * pageNumber)
  );

  readonly pageIndice$: RN<number[]> = this.pageLength$.map((len) =>
    utils.number.numSeq(1, len)
  );

  constructor() {}

  ngOnInit() {}

  setPageNumber(pageNumber: number) {
    this.pageNumber$.emit(pageNumber);
    this.pageNumberChange.emit(pageNumber);
  }
}
