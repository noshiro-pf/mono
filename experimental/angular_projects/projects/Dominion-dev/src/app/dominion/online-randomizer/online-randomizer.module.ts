import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyLibModule } from '../../mylib/mylib.module';
import { SubComponentsModule } from '../sub-components/sub-components.module';
import { AddGameResultComponent } from './add-game-result/add-game-result.component';
import { SetVpDialogComponent } from './add-game-result/set-vp-dialog.component';
import { BlackMarketPileComponent } from './black-market-pile/black-market-pile.component';
import { MyRandomizerGroupService } from './my-randomizer-group.service';
import { OnlineRandomizerComponent } from './online-randomizer.component';
import { OnlineVictoryPointsCalculatorComponent } from './online-victory-points-calculator.component';
import { RandomizerCardImageComponent } from './randomizer-card-image/randomizer-card-image.component';
import { RandomizerGroupListComponent } from './randomizer-group-list/randomizer-group-list.component';
import { RandomizerSelectCardsComponent } from './randomizer-select-cards.component';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    SubComponentsModule,
  ],
  exports: [
    OnlineRandomizerComponent,
    OnlineVictoryPointsCalculatorComponent,
    RandomizerSelectCardsComponent,
    AddGameResultComponent,
    BlackMarketPileComponent,
    RandomizerCardImageComponent,
    RandomizerGroupListComponent,
    SetVpDialogComponent,
  ],
  declarations: [
    OnlineRandomizerComponent,
    OnlineVictoryPointsCalculatorComponent,
    RandomizerSelectCardsComponent,
    AddGameResultComponent,
    BlackMarketPileComponent,
    RandomizerCardImageComponent,
    RandomizerGroupListComponent,
    SetVpDialogComponent,
  ],
  providers: [MyRandomizerGroupService],
  entryComponents: [SetVpDialogComponent],
})
export class OnlineRandomizerModule {}
