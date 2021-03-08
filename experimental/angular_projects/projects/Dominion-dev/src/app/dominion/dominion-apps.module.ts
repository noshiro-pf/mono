import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
/* modules */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';
/* components */
import { CardPropertyListComponent } from './card-property-list.component';
import { GameResultListComponent } from './game-result/game-result-list.component';
import { GameResultOfPlayerComponent } from './game-result/game-result-of-player.component';
import { GameResultComponent } from './game-result/game-result.component';
import { ScoringTableComponent } from './game-result/scoring-table.component';
import { OnlineGameModule } from './online-game/online-game.module';
import { OnlineRandomizerModule } from './online-randomizer/online-randomizer.module';
import { RuleBooksComponent } from './rule-books.component';
/* entry components */
import { GameResultDetailDialogComponent } from './sub-components/game-result-detail-dialog/game-result-detail-dialog.component';
import { SubComponentsModule } from './sub-components/sub-components.module';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    SubComponentsModule,
    OnlineRandomizerModule,
    OnlineGameModule,
  ],
  exports: [
    CardPropertyListComponent,
    RuleBooksComponent,
    ScoringTableComponent,
    GameResultComponent,
    GameResultOfPlayerComponent,
    GameResultListComponent,
    GameResultDetailDialogComponent,
    OnlineRandomizerModule,
    OnlineGameModule,
  ],
  declarations: [
    CardPropertyListComponent,
    RuleBooksComponent,
    ScoringTableComponent,
    GameResultComponent,
    GameResultOfPlayerComponent,
    GameResultListComponent,
    GameResultDetailDialogComponent,
  ],
  providers: [],
  entryComponents: [GameResultDetailDialogComponent],
})
export class DominionAppsModule {}
