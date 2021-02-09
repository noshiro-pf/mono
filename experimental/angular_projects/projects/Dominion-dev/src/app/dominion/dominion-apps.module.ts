import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* modules */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule        } from '../mylib/mylib.module';
import { SubComponentsModule       } from './sub-components/sub-components.module';
import { OnlineRandomizerModule    } from './online-randomizer/online-randomizer.module';
import { OnlineGameModule          } from './online-game/online-game.module';

/* components */
import { CardPropertyListComponent        } from './card-property-list.component';
import { RuleBooksComponent               } from './rule-books.component';
import { ScoringTableComponent            } from './game-result/scoring-table.component';
import { GameResultComponent              } from './game-result/game-result.component';
import { GameResultOfPlayerComponent      } from './game-result/game-result-of-player.component';
import { GameResultListComponent          } from './game-result/game-result-list.component';

/* entry components */
import { GameResultDetailDialogComponent } from './sub-components/game-result-detail-dialog/game-result-detail-dialog.component';




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
  providers: [
  ],
  entryComponents: [
    GameResultDetailDialogComponent,
  ]
})
export class DominionAppsModule { }
