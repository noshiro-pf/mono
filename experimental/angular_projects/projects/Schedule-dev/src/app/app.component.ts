import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatSnackBar } from '@angular/material';


@Component({
  providers: [AngularFireAuth],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // signedIn$!: RN<boolean>;
  // myName$!: RN<string>;


  constructor(
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    // private myUserInfo: MyUserInfoService,
    // private autoBackup: AutoBackupOnFirebaseService,
  ) {
    // this.myName$ = myUserInfo.name$;
    // this.signedIn$ = this.myUserInfo.signedIn$;
    // this.autoBackup.checkAndExecuteBackup();
  }


  logout() {
    if ( !this.afAuth.auth.currentUser ) return;
    this.afAuth.auth.signOut()
    .then( () => this.openSnackBar('Successfully signed out!') );
  }

  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }

}
