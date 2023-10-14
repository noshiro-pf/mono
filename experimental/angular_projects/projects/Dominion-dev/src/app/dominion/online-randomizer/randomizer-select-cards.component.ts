import { Component, OnInit } from '@angular/core';
import { BlackMarketPileCard } from '../types/black-market-pile-card';
import { SelectedCards } from '../types/selected-cards';
import { MyRandomizerGroupService } from './my-randomizer-group.service';
import { BlackMarketPhase } from './types/black-market-phase.enum';

@Component({
  selector: 'app-randomizer-select-cards',
  template: `
    <app-randomizer
      [implementedOnly]="false"
      [showSelectedCardsCheckbox]="true"
      [useHistory]="true"
      [isSelectedExpansions$]="isSelectedExpansions$"
      [selectedCardsHistory$]="selectedCardsHistory$"
      [selectedIndexInHistory$]="selectedIndexInHistory$"
      [selectedCardsCheckbox$]="selectedCardsCheckbox$"
      (isSelectedExpansionsPartEmitter)="isSelectedExpansionsOnChange($event)"
      (selectedCardsAdded)="selectedCardsAdded($event)"
      (BlackMarketPileShuffledChange)="BlackMarketPileShuffledOnChange($event)"
      (selectedCardsCheckboxPartEmitter)="selectedCardsCheckboxOnChange($event)"
      (selectedCardsCheckboxOnReset)="selectedCardsCheckboxOnReset()"
      (selectedIndexInHistoryChange)="selectedIndexInHistoryOnChange($event)"
    >
    </app-randomizer>
  `,
  styles: [],
})
export class RandomizerSelectCardsComponent implements OnInit {
  isSelectedExpansions$ = this.myRandomizerGroup.isSelectedExpansions$;
  selectedCardsCheckbox$ = this.myRandomizerGroup.selectedCardsCheckbox$;
  selectedCardsHistory$ = this.myRandomizerGroup.selectedCardsHistory$;
  selectedIndexInHistory$ = this.myRandomizerGroup.selectedIndexInHistory$;

  constructor(private myRandomizerGroup: MyRandomizerGroupService) {}

  ngOnInit() {}

  /* app-randomizer */
  async isSelectedExpansionsOnChange(value: {
    index: number;
    checked: boolean;
  }) {
    await this.myRandomizerGroup.setIsSelectedExpansions(
      value.index,
      value.checked,
    );
  }

  async selectedCardsAdded(selectedCards: SelectedCards) {
    if (selectedCards.isEmpty()) return;
    await Promise.all([
      this.myRandomizerGroup.addToHistory(selectedCards),
      this.myRandomizerGroup.resetVPCalculator(),
    ]);
  }

  async selectedIndexInHistoryOnChange(newValue: number) {
    await this.myRandomizerGroup.setSelectedIndexInHistory(newValue);
  }

  async BlackMarketPileShuffledOnChange(value: BlackMarketPileCard[]) {
    await Promise.all([
      this.myRandomizerGroup.setBMPileShuffled(value),
      this.myRandomizerGroup.setBlackMarketPhase(BlackMarketPhase.init),
    ]);
  }

  async selectedCardsCheckboxOnChange(value: {
    category: string;
    index: number;
    checked: boolean;
  }) {
    await this.myRandomizerGroup.setSelectedCardsCheckbox(
      value.category,
      value.index,
      value.checked,
    );
  }

  async selectedCardsCheckboxOnReset() {
    await this.myRandomizerGroup.resetSelectedCardsCheckbox();
  }
}
