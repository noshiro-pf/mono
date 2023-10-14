import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { DatabaseService } from '../../database/database.service';
import { User } from '../../types/user';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  waitingForResponse = false;

  email: string = '';
  password: string = '';
  name: string = '';
  nameYomi: string = '';

  errorMessageForEmail!: string;
  errorMessageForPassword!: string;

  constructor(
    public snackBar: MatSnackBar,
    public afAuth: AngularFireAuth,
    private location: Location,
    private database: DatabaseService,
  ) {}

  ngOnInit() {}

  emailOnChange(value: string) {
    this.email = value;
  }

  passwordOnChange(value: string) {
    this.password = value;
  }

  nameOnChange(value: string) {
    this.name = value;
  }

  nameYomiOnChange(value: string) {
    this.nameYomi = value;
  }

  signUp() {
    this.errorMessageForEmail = '';
    this.errorMessageForPassword = '';

    this.waitingForResponse = true;
    this.afAuth.auth
      .createUserWithEmailAndPassword(this.email, this.password)
      .then((afUser) => {
        this.waitingForResponse = false;
        const uid: string = (afUser.user || { uid: '' }).uid;

        this.database.user.setUser(
          uid,
          new User(uid, {
            name: this.name,
            nameYomi: this.nameYomi,
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
