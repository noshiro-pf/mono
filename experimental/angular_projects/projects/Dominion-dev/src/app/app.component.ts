import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { RN } from 'rnjs';
import { AutoBackupOnFirebaseService } from './database/auto-backup-on-firebase.service';
import { UserService } from './database/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  signedIn$: RN<boolean> = this.user.signedIn$;
  myName$: RN<string> = this.user.name$;

  constructor(
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private user: UserService,
    private autoBackup: AutoBackupOnFirebaseService,
    private router: Router,
  ) {
    this.autoBackup.checkAndExecuteBackup();
  }

  async logout() {
    if (!this.afAuth.auth.currentUser) return;
    await this.afAuth.auth.signOut();
    this.router.navigate(['/']);
    this.openSnackBar('Successfully signed out!');
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
