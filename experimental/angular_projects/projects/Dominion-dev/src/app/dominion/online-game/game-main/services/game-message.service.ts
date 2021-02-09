import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { concatMap, delayWhen, map, skip, delay, scan } from 'rxjs/operators';

import { UserService } from '../../../../database/user.service';


@Injectable()
export class GameMessageService {

  private gameMessageSource = new BehaviorSubject<string>('');
  private gameMessage$ = this.gameMessageSource.asObservable().pipe( skip(1) );

  gameMessageList$
    = this.gameMessage$
        .pipe( scan( (acc: string[], val: string, idx: number) => ([] as string[]).concat( acc, [`${idx + 1}. ${val}`] ), [] ) );

  gameMessageIndex$ = this.gameMessage$.pipe( map( (value, index) => index ) );
  gameMessageIndexDelayed$ = this.gameMessageIndex$.pipe( delay( 2000 ) );

  gameMessageListSliced$
    = combineLatest(
        this.gameMessageList$,
        this.gameMessageIndexDelayed$,
        this.gameMessageIndex$,
        (list, begin, end) => list.slice( begin + 1, end + 1 ) );



  constructor( private user: UserService ) {
  }


  pushMessage( message: string ) {
    this.gameMessageSource.next( message );
  }
}
