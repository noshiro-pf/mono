import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import { utils } from '../mylib/utilities';
import { first } from 'rxjs/operators';


@Injectable()
export class AutoBackupOnFirebaseService {

  private autoBackupDir = '/autoBackup';
  private latestBackupDatePath = this.autoBackupDir + '/latestBackupDate';

  private fdPathList = [
    '/users',
    '/data',
    '/randomizerGroupList',
    '/onlineGameStateList',
    '/onlineGameRoomsList',
  ];

  constructor(
    private afdb: AngularFireDatabase
  ) { }

  async checkAndExecuteBackup() {
    const latestBackupDate = await this.getLatestBackupDate();
    if ( !utils.date.isToday( latestBackupDate ) ) {
      this.createBackup();
    }
  }

  private async getLatestBackupDate() {
    const timeStamp = await this.afdb.object<number>( this.latestBackupDatePath ).valueChanges().pipe( first() ).toPromise();
    return new Date( timeStamp || Date.now() );
  }

  private createBackup() {
    console.log('created backup');
    this.updateLatestBackupDate();

    const dateString = utils.date.toYMD( new Date(), '' );

    this.fdPathList.forEach( sourcePath => {
      const distPathPrefix = `${this.autoBackupDir}/index/${dateString}`;
      this.afdb.object( sourcePath ).valueChanges().pipe( first() )
      .subscribe( val => {
        if ( !val ) return;
        this.afdb.object(`${distPathPrefix}${sourcePath}`).set( val );
      });
    });
  }


  private updateLatestBackupDate() {
    return this.afdb.object( this.latestBackupDatePath ).set( Date.now() );
  }


}

