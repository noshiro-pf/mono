import { Component, Input, OnInit } from '@angular/core';
import { RN, combine, manual } from 'rnjs';
import { FireDatabaseService } from '../../database/database.service';

@Component({
  selector: 'app-selected-expansions',
  template: `
    <mat-chip-list *ngIf="expansions$ | async as expansions">
      <mat-chip
        color="accent"
        *ngFor="let expansion of expansions"
        [selected]="expansion.selected"
      >
        {{ expansion.name }}
      </mat-chip>
    </mat-chip-list>
  `,
  styles: [],
})
export class SelectedExpansionsComponent implements OnInit {
  selectedExpansionNameList$ = manual<string[]>([]);
  @Input() set selectedExpansionNameList(value: string[]) {
    this.selectedExpansionNameList$.emit(value);
  }

  expansions$: RN<{ name: string; selected: boolean }[]> = combine(
    this.database.expansionNameList$,
    this.selectedExpansionNameList$
  ).map(([nameList, selectedNameList]) =>
    nameList.map((name) => ({
      name: name,
      selected: selectedNameList.includes(name),
    }))
  );

  constructor(private database: FireDatabaseService) {}

  ngOnInit() {}
}
