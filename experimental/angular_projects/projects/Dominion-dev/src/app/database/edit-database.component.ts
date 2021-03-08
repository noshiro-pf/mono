import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-edit-database',
  template: ` <p>app-edit-database</p> `,
  styles: [],
})
export class EditDatabaseComponent implements OnInit {
  constructor(afs: AngularFirestore, afdb: AngularFireDatabase) {
    // afdb.list('/data/cardPropertyList').valueChanges().first().subscribe( cardPropertyList => {
    // afdb.object('/data/cardPropertyList_bk').set(cardPropertyList);
    // cardPropertyList.forEach( (cardProperty: any, i) => {
    //   afdb.object(`/data/cardPropertyList/${i}/cardType`).remove();
    //   afdb.object(`/data/cardPropertyList/${i}/cardTypes`)
    //     .set( Object.keys( cardProperty.cardTypes ).filter( key => cardProperty.cardTypes[key] ).join(',') );
    //   afdb.object(`/data/cardPropertyList/${i}/expansionName`)
    //     .set( cardProperty.expansionName.join(',') );
    // });
    // });
    // afdb.list('/data/gameResultList').snapshotChanges().first().subscribe( actions => {
    //   actions.forEach( (action, index) => {
    //     const databaseKey = action.key;
    //     const gameResult = action.payload.val();
    // afdb.object(`/data/gameResultList/${databaseKey}/dateString`).remove();
    // afdb.object(`/data/gameResultList/${databaseKey}/timeStamp`).set( (new Date( gameResult.dateString )).valueOf() );
    // const players = gameResult.players;
    // players.forEach( (e, i) =>
    //   afdb.object(`/data/gameResultList/${databaseKey}/players/${i}/winByTurn`).remove() );
    // // if ( players.map( e => e.winByTurn ).filter( e => !!e ).length >= 2 ) {
    // //   console.log( index, action.payload.val() );
    // // }
    // players.forEach( (e, i) =>
    //   afdb.object(`/data/gameResultList/${databaseKey}/players/${i}/turnOrder`)
    //     .set( ( e.winByTurn ? 20 : 10 ) )
    // );
    //   });
    //   console.log('done');
    // });
  }

  ngOnInit() {}
}
