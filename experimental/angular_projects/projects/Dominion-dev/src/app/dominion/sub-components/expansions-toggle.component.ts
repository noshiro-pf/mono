import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RN, combine, manual } from 'rnjs';
import { FireDatabaseService } from '../../database/database.service';

@Component({
  selector: 'app-expansions-toggle',
  template: `
    <div *ngFor="let expansion of expansions$ | async">
      <mat-slide-toggle
        color="primary"
        [checked]="expansion.selected"
        (change)="toggleExpansion($event.checked, expansion.index)"
      >
        {{ expansion.name }}
      </mat-slide-toggle>
    </div>
  `,
  styles: [],
})
export class ExpansionsToggleComponent implements OnInit {
  isSelectedExpansions$ = manual<boolean[]>([]);
  @Input() set isSelectedExpansions(value: boolean[]) {
    this.isSelectedExpansions$.emit(value);
  }
  @Output() isSelectedExpansionsPartEmitter = new EventEmitter<{
    index: number;
    checked: boolean;
  }>();

  expansions$!: RN<{ selected: boolean; name: string; index: number }[]>;

  constructor(private database: FireDatabaseService) {}

  ngOnInit() {
    this.expansions$ = combine(
      this.isSelectedExpansions$,
      this.database.expansionNameList$,
    )
      .map(([isSelectedList, nameList]) =>
        isSelectedList.map((e, i) => ({
          selected: e,
          name: nameList[i],
          index: i,
        })),
      )
      .withInitialValue([]);
  }

  toggleExpansion(checked: boolean, index: number) {
    this.isSelectedExpansionsPartEmitter.emit({
      checked: checked,
      index: index,
    });
  }
}
