import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { FireDatabaseService } from '../../database.service';
import { User } from '../../user';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  waitingForResponse = false;

  email!: string;
  password!: string;
  name!: string;
  nameYomi!: string;

  errorMessageForEmail!: string;
  errorMessageForPassword!: string;

  expansionNameList$ = this.database.expansionNameList$;

  constructor(
    public snackBar: MatSnackBar,
    public afAuth: AngularFireAuth,
    private location: Location,
    private database: FireDatabaseService,
  ) {}

  ngOnInit() {}

  emailOnChange(email: string) {
    this.email = email;
  }

  passwordOnChange(password: string) {
    this.password = password;
  }

  nameOnChange(name: string) {
    this.name = name;
  }

  nameYomiOnChange(nameYomi: string) {
    this.nameYomi = nameYomi;
  }

  async signUp(expansionNameList: string[]) {
    const isSelectedExpansionsInit = expansionNameList.map(() => true);

    this.errorMessageForEmail = '';
    this.errorMessageForPassword = '';

    this.waitingForResponse = true;
    this.afAuth.auth
      .createUserWithEmailAndPassword(this.email, this.password)
      .then((afUser) => {
        this.waitingForResponse = false;
        const uid = (afUser.user || { uid: '' }).uid;
        this.database.user.setUser(
          uid,
          new User(uid, {
            name: this.name,
            nameYomi: this.nameYomi,
            randomizerGroupId: '',
            onlineGame: {
              isSelectedExpansions: isSelectedExpansionsInit,
              numberOfPlayers: 2,
              roomId: '',
              communicationId: '',
              chatOpened: true,
              cardSizeAutoChange: true,
              cardSizeRatio: 1,
              messageSec: 1,
              autoSort: true,
            },
          }),
        );

        this.location.back();
        this.openSnackBar('Successfully logged in!');
      })
      .catch((error: any) => {
        this.waitingForResponse = false;

        switch (error.code) {
          case 'auth/email-already-in-use':
            this.errorMessageForEmail = error.message;
            break;
          case 'auth/invalid-email':
            this.errorMessageForEmail = error.message;
            break;
          case 'auth/operation-not-allowed':
            this.errorMessageForEmail = error.message;
            break;
          case 'auth/weak-password':
            this.errorMessageForPassword = error.message;
            break;
          default:
            this.errorMessageForEmail = error.message;
            break;
        }
      });
  }

  // private setDisplayName() {
  //   this.afAuth.auth.currentUser.updateProfile( { displayName: this.name, photoURL: '' } );
  // }

  private openSnackBar(message: string) {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
