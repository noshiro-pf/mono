import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';

import { User } from '../classes/user';
import { DatabaseService } from './database.service';


@Injectable()
export class UserService {
  private uid: string = '';
  uid$:      Observable<string>;
  signedIn$: Observable<boolean>;

  private myUserInfo$: Observable<User>;
  name$:      Observable<string>;
  name_yomi$: Observable<string>;



  constructor(
    private afAuth: AngularFireAuth,
    private database: DatabaseService,
  ) {
    this.signedIn$ = this.afAuth.authState.pipe( map( user => !!user ) );
    this.uid$ = this.afAuth.authState.pipe( map( user => ( !user ? '' : user.uid ) ) );

    this.myUserInfo$ = combineLatest(
        this.uid$,
        this.database.users$,
        ( uid: string, users: User[] ) =>
          (!uid || users.length === 0) ? new User() : users.find( e => e.databaseKey === uid ) || new User() );

    this.name$
      = this.myUserInfo$.pipe(
          map( e => e.name ),
          distinctUntilChanged() );
    this.name_yomi$
      = this.myUserInfo$.pipe(
          map( e => e.name_yomi ),
          distinctUntilChanged() );

    this.uid$.subscribe( val => this.uid = val );
  }


  setMyName( value: string ) {
    if ( !this.uid ) return Promise.resolve();
    return this.database.user.set.name( this.uid, value );
  }
}
