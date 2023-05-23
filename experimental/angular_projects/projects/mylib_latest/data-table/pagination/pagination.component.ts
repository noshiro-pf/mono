import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RN, combine, manual } from '../../rn/RN';
import { utils } from '../../utilities';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit {
  rowSize$ = manual<number>(1);

  @Input() set rowSize(value: number) {
    if (value === undefined || value === null) return;
    this.rowSize$.emit(value);
  }

  itemsPerPage$ = manual(1);

  @Input() set itemsPerPage(value: number) {
    if (value === undefined || value === null) return;
    this.itemsPerPage$.emit(value);
  }

  pageNumber$ = manual(1);

  @Input() set pageNumber(value: number) {
    if (value === undefined || value === null) return;
    this.pageNumber$.emit(value);
  }

  @Output() pageNumberChange = new EventEmitter<number>();

  pageLength$: RN<number>;
  rangeStart$: RN<number>;
  rangeEnd$: RN<number>;
  pageIndice$: RN<number[]>;

  constructor() {
    this.pageLength$ = combine(this.rowSize$, this.itemsPerPage$).map(
      ([rowSize, itemsPerPage]) => Math.ceil(rowSize / itemsPerPage)
    );

    this.pageIndice$ = this.pageLength$.map((len) =>
      utils.number.numSeq(1, len)
    );

    this.rangeStart$ = combine(this.itemsPerPage$, this.pageNumber$).map(
      ([itemsPerPage, pageNumber]) => itemsPerPage * (pageNumber - 1) + 1
    );

    this.rangeEnd$ = combine(
      this.itemsPerPage$,
      this.pageNumber$,
      this.rowSize$
    ).map(([itemsPerPage, pageNumber, rowSize]) =>
      Math.min(rowSize, itemsPerPage * pageNumber)
    );
  }

  ngOnInit() {}

  setPageNumber(pageNumber: number) {
    this.pageNumberChange.emit(pageNumber);
  }
}
