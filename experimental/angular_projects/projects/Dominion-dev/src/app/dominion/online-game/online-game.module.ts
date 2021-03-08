import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgPipesModule } from 'ngx-pipes';
import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyLibModule } from '../../mylib/mylib.module';
import { SubComponentsModule } from '../sub-components/sub-components.module';
import { AddGameGroupComponent } from './add-game-group/add-game-group.component';
import { CardsAreaComponent } from './game-main/cards-area/cards-area/cards-area/cards-area.component';
import { CardsLinedUpComponent } from './game-main/cards-area/cards-area/cards-lined-up.component';
import { CardsPileComponent } from './game-main/cards-area/cards-area/cards-pile.component';
import { MyCardAreaComponent } from './game-main/cards-area/my-card-area/my-card-area.component';
import { OtherPlayerAreaComponent } from './game-main/cards-area/other-players-area/other-players-area.component';
import { SmallPlayerAreaComponent } from './game-main/cards-area/other-players-area/small-player-area/small-player-area.component';
import { SharedAreaComponent } from './game-main/cards-area/shared-area/shared-area.component';
import { TurnPlayerAreaComponent } from './game-main/cards-area/turn-player-area/turn-player-area.component';
import { ChatComponent } from './game-main/chat/chat.component';
import { GameConfigDialogComponent } from './game-main/dialogs/game-config-dialog/game-config-dialog.component';
import { HelpDialogComponent } from './game-main/dialogs/help-dialog/help-dialog.component';
import { MessageForMeListDialogComponent } from './game-main/dialogs/message-for-me-dialog-list.component';
import { OnlineGameResultDialogComponent } from './game-main/dialogs/online-game-result-dialog/online-game-result-dialog.component';
import {
  EachPlayerCardsComponent,
  OnlineGamePlayerCardsDialogComponent,
} from './game-main/dialogs/online-game-result-player-cards-dialog/online-game-result-player-cards-dialog.component';
import { GameMainComponent } from './game-main/game-main.component';
import { MessageForMeAreaComponent } from './game-main/my-area/message-for-me-area/message-for-me-area.component';
import { MyAreaComponent } from './game-main/my-area/my-area.component';
import { GameConfigService } from './game-main/services/game-config.service';
import { SideBarLeftComponent } from './game-main/sidebars/sidebar-left/sidebar-left.component';
import { TurnInfoComponent } from './game-main/sidebars/sidebar-left/turn-info/turn-info.component';
import { UserInputLogDialogComponent } from './game-main/sidebars/sidebar-left/user-input-log-dialog.component';
import { SideBarRightComponent } from './game-main/sidebars/sidebar-right/sidebar-right.component';
import { DebtComponent } from './game-main/token/debt.component';
import { DebtsComponent } from './game-main/token/debts.component';
import { VcoinComponent } from './game-main/token/vcoin.component';
import { VcoinsComponent } from './game-main/token/vcoins.component';
import { VpTokenComponent } from './game-main/token/vp-token.component';
import { VpTokensComponent } from './game-main/token/vp-tokens.component';
import { GameRoomListComponent } from './game-room-list/game-room-list.component';
import { OnlineGameComponent } from './online-game.component';
import { SignInToGameRoomDialogComponent } from './sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    NgPipesModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    SubComponentsModule,
  ],
  exports: [
    OnlineGameComponent,
    // AddGameGroupComponent,
    // GameRoomListComponent,
    // SignInToGameRoomDialogComponent,
    // GameMainComponent,
    // MessageForMeListDialogComponent,
    // UserInputLogDialogComponent,
    // ChatComponent,
    // CardsPileComponent,
    // CardsLinedUpComponent,
    // TurnInfoComponent,
    // SharedAreaComponent,
    // OtherPlayerAreaComponent,
    // TurnPlayerAreaComponent,
  ],
  declarations: [
    OnlineGameComponent,
    AddGameGroupComponent,
    GameRoomListComponent,
    SignInToGameRoomDialogComponent,
    GameMainComponent,
    MessageForMeListDialogComponent,
    UserInputLogDialogComponent,
    ChatComponent,
    CardsPileComponent,
    CardsLinedUpComponent,
    TurnInfoComponent,
    SharedAreaComponent,
    OtherPlayerAreaComponent,
    TurnPlayerAreaComponent,
    MyCardAreaComponent,
    SmallPlayerAreaComponent,
    GameConfigDialogComponent,
    OnlineGameResultDialogComponent,
    OnlineGamePlayerCardsDialogComponent,
    EachPlayerCardsComponent,
    SideBarLeftComponent,
    SideBarRightComponent,
    MyAreaComponent,
    CardsAreaComponent,
    HelpDialogComponent,
    VcoinComponent,
    DebtComponent,
    VpTokenComponent,
    VcoinsComponent,
    VpTokensComponent,
    DebtsComponent,
    MessageForMeAreaComponent,
  ],
  entryComponents: [
    SignInToGameRoomDialogComponent,
    GameConfigDialogComponent,
    UserInputLogDialogComponent,
    OnlineGameResultDialogComponent,
    OnlineGamePlayerCardsDialogComponent,
    MessageForMeListDialogComponent,
    HelpDialogComponent,
  ],
  providers: [GameConfigService],
})
export class OnlineGameModule {}
