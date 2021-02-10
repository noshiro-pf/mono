import { Component, OnInit } from '@angular/core';
import { isDevMode } from '@angular/core';

import { RN, manual, combine } from 'rnjs';

import { MatDialog, MatSnackBar } from '@angular/material';

import { utils } from '../../../mylib/utilities';
import { UserService } from '../../../database/user.service';
import { FireDatabaseService } from '../../../database/database.service';
import { AddGameGroupService } from './add-game-group.service';

import { SignInToGameRoomDialogComponent } from '../sign-in-to-game-room-dialog/sign-in-to-game-room-dialog.component';
import { SetMemoDialogComponent } from '../../sub-components/set-memo-dialog.component';

import { SelectedCards       } from '../../types/selected-cards';
import { BlackMarketPileCard } from '../../types/black-market-pile-card';
import { testKingdomCards } from '../game-main/services/game-state-services/card-effect-definitions/testKingdomCards10';



@Component({
  providers: [AddGameGroupService],
  selector: 'app-add-game-group',
  templateUrl: './add-game-group.component.html',
  styles: [`
    .mini-button {
      padding : 0;
      min-width : 0;
      width: 35px;
      color: rgba(0,0,0,.54);
    }
  `]
})
export class AddGameGroupComponent implements OnInit {
  // form elements
  memo$ = manual<string>('');

  numberOfPlayers$ = this.user.onlineGame.numberOfPlayers$;
  isSelectedExpansions$ = this.user.onlineGame.isSelectedExpansions$;

  // app-randomizer
  selectedCards$ = manual<SelectedCards>( new SelectedCards() );

  BlackMarketPileShuffled$ = manual<BlackMarketPileCard[]>([]);

  preparingDialog$ = manual<boolean>(false);

  disableMakeRoomButton$: RN<boolean>
    = combine(
        this.numberOfPlayers$.map( e => !utils.number.isInRange( e, 2, 7 ) ),
        this.isSelectedExpansions$.map( list => list.every( e => !e ) ),
        this.selectedCards$.map( e => e.isEmpty() ),
        this.preparingDialog$
      ).map( (conditions) => conditions.some( e => e ) )
      .withInitialValue( true )
      .skipUnchanged();

  isdevmode: boolean = isDevMode();
  addTestPlayer: boolean = false;


  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private database: FireDatabaseService,
    private user: UserService,
    private addGameGroupService: AddGameGroupService
  ) {
  }

  ngOnInit() {
  }


  selectedCardsOnChange( value: SelectedCards ) {
    if ( this.isdevmode ) {
      value.KingdomCards10 = testKingdomCards;
      console.log('selected test KingdomCards', value.KingdomCards10 );
    }
    this.selectedCards$.emit( value );
  }

  BlackMarketPileShuffledOnChange( value: BlackMarketPileCard[] ) {
    this.BlackMarketPileShuffled$.emit( value );
  }

  increment( currentValue: number ) {
    this.user.setOnlineGameNumberOfPlayers( currentValue + 1 );
  }

  decrement( currentValue: number ) {
    this.user.setOnlineGameNumberOfPlayers( currentValue - 1 );
  }

  isSelectedExpansionsOnChange( value: { index: number, checked: boolean } ) {
    this.user.setOnlineGameIsSelectedExpansions( value.index, value.checked );
  }

  memoClicked() {
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = this.memo$.value;
    dialogRef.afterClosed().subscribe( value => {
      if ( value === undefined ) return;
      this.memo$.emit( value );
    });
  }


  async makeNewGameRoomClicked(
    numberOfPlayers:      number,
    isSelectedExpansions: boolean[]
  ) {
    this.preparingDialog$.emit( true );
    await this.makeNewGameRoom( numberOfPlayers, isSelectedExpansions );
    this.preparingDialog$.emit( false );
  }

  private async makeNewGameRoom(
    numberOfPlayers:      number,
    isSelectedExpansions: boolean[]
  ) {
    const newRoom = await this.addGameGroupService.init(
        numberOfPlayers,
        isSelectedExpansions,
        this.memo$.value,
        this.selectedCards$.value );

    // dialog
    const dialogRef = this.dialog.open( SignInToGameRoomDialogComponent );
    dialogRef.componentInstance.newRoom = newRoom;
    dialogRef.componentInstance.dialogRef = dialogRef;
    dialogRef.disableClose = true;

    if ( this.addTestPlayer ) {
      for ( let i = 1; i < numberOfPlayers; ++i ) {
        await utils.asyncOperation.sleep(1);
        await this.database.onlineGameRoom.addMember( newRoom.databaseKey, `testPlayer${i}` );
        console.log('added testPlayer');
      }
    }

    const result = await dialogRef.afterClosed().toPromise();
    if ( result === 'Cancel Clicked' ) {
      this.database.onlineGameRoom.remove( newRoom.databaseKey );
      this.database.onlineGameCommunication.remove( newRoom.gameRoomCommunicationId );
    } else {
      this.openSnackBar('Successfully signed in!');
    }
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

  addTestPlayerChecked( value: boolean ) {
    this.addTestPlayer = value;
  }
}
