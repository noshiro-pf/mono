import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
/* modules */
import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyLibModule } from '../../mylib/mylib.module';
import { CardImageSizeSliderComponent } from './card-image-size-slider/card-image-size-slider.component';
/* entry components */
import { CardPropertyDialogComponent } from './card-property-dialog/card-property-dialog.component';
import { DominionCardImageComponent } from './dominion-card-image/dominion-card-image.component';
/* components */
import { ExpansionsToggleComponent } from './expansions-toggle.component';
import { RandomizerComponent } from './randomizer/randomizer.component';
import { SelectedCardsListComponent } from './selected-cards-list/selected-cards-list.component';
import { SelectedExpansionsComponent } from './selected-expansions.component';
import { SetMemoDialogComponent } from './set-memo-dialog.component';
import { SubmitGameResultDialogComponent } from './submit-game-result-dialog/submit-game-result-dialog.component';
import { VictoryPointsCalculatorComponent } from './victory-points-calculator/victory-points-calculator.component';

@NgModule({
  imports: [CommonModule, MyOwnCustomMaterialModule, MyLibModule],
  exports: [
    ExpansionsToggleComponent,
    SelectedExpansionsComponent,
    CardImageSizeSliderComponent,
    DominionCardImageComponent,
    SelectedCardsListComponent,
    VictoryPointsCalculatorComponent,
    RandomizerComponent,
    CardPropertyDialogComponent,
    SubmitGameResultDialogComponent,
    SetMemoDialogComponent,
  ],
  declarations: [
    ExpansionsToggleComponent,
    SelectedExpansionsComponent,
    CardImageSizeSliderComponent,
    DominionCardImageComponent,
    SelectedCardsListComponent,
    VictoryPointsCalculatorComponent,
    RandomizerComponent,
    CardPropertyDialogComponent,
    SubmitGameResultDialogComponent,
    SetMemoDialogComponent,
  ],
  entryComponents: [
    CardPropertyDialogComponent,
    SubmitGameResultDialogComponent,
    SetMemoDialogComponent,
  ],
})
export class SubComponentsModule {}
