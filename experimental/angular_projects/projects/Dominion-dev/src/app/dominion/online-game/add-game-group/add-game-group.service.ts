import { Injectable } from '@angular/core';

import { utils } from '../../../mylib/utilities';
import { UserService } from '../../../database/user.service';
import { FireDatabaseService } from '../../../database/database.service';

import { CardProperty } from '../../types/card-property';
import { SelectedCards       } from '../../types/selected-cards';
import { GameRoom            } from '../types/game-room';
import { GameCommunication   } from '../types/game-room-communication';
import { UserInput           } from '../types/user-input';
import { TurnInfo            } from '../types/turn-info';



@Injectable()
export class AddGameGroupService {

  private cardPropertyList: CardProperty[] = [];
  private myName: string = '';

  constructor(
    private database: FireDatabaseService,
    private user: UserService,
  ) {
    this.database.cardPropertyList$
      .subscribe( val => this.cardPropertyList = val );

    this.user.name$
      .subscribe( val => this.myName = val );
  }

  async init(
    numberOfPlayers: number,
    isSelectedExpansions: boolean[],
    memo: string,
    selectedCards: SelectedCards
  ) {
    const newRoom = new GameRoom();
    {
      newRoom.numberOfPlayers      = numberOfPlayers;
      newRoom.isSelectedExpansions = isSelectedExpansions;
      newRoom.memo                 = memo;
      newRoom.selectedCards        = selectedCards;
      newRoom.playerShuffler       = utils.number.random.permutation( numberOfPlayers );
      newRoom.initCards( this.cardPropertyList );
      newRoom.initDecks();
      newRoom.initialState.setNumberOfPlayers( numberOfPlayers );
      newRoom.initialState.usePotion = selectedCards.usePotion( this.cardPropertyList );
      newRoom.initialState.turnInfo = new TurnInfo({
            action: 1,
            buy:    1,
            coin:   0,
            potion: 0,
            phase:  '',
            runningCards: [],
        });
      if ( selectedCards.concatAllCards()
            .map( i => this.cardPropertyList[i].cardId )
            .includes('Baker')
      ) {
        newRoom.initialState.allPlayersData.forEach( p => p.vcoin++ );
      }
    }

    {
      const newComm = new GameCommunication();
      newComm.thinkingState = utils.number.seq0( numberOfPlayers ).map( _ => false );
      // 最初のプレイヤーの自動でgoToNextPhaseを1回発動
      newComm.userInputList.push( new UserInput( {
                                    command: 'clicked goToNextPhase',
                                    data: {
                                      playerId: 0,
                                      autoSort: true,
                                      shuffleBy: utils.number.random.permutation(10),
                                      clickedCardId: 0,
                                    }
                                  }, undefined ) );
      const result = await this.database.onlineGameCommunication.add( newComm );
      newRoom.gameRoomCommunicationId = result.key;
    }

    // make new GameRoom object
    {
      const result = await this.database.onlineGameRoom.add( newRoom );
      newRoom.databaseKey = result.key;
    }

    // add me to GameRoom object
    await this.database.onlineGameRoom.addMember( newRoom.databaseKey, this.myName );

    return newRoom;
  }

}
