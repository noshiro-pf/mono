import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';

// import { MyUserInfoService } from './database/my-user-info.service';
// import { AutoBackupOnFirebaseService } from './database/auto-backup-on-firebase.service';

@Component({
  providers: [AngularFireAuth],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  signedIn$!: Observable<boolean>;
  myName$!: Observable<string>;

  constructor(
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth, // private myUserInfo: MyUserInfoService, // private autoBackup: AutoBackupOnFirebaseService,
  ) {
    // this.myName$ = myUserInfo.name$;
    // this.signedIn$ = this.myUserInfo.signedIn$;
    // this.autoBackup.checkAndExecuteBackup();
  }

  logout() {
    if (!this.afAuth.auth.currentUser) return;
    this.afAuth.auth
      .signOut()
      .then(() => this.openSnackBar('Successfully signed out!'));
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
