import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';

import { AngularFireAuth } from 'angularfire2/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  waitingForResponse: boolean = false;

  email!: string;
  password!: string;

  errorMessageForEmail!: string;
  errorMessageForPassword!: string;


  constructor(
    public snackBar: MatSnackBar,
    public afAuth: AngularFireAuth,
    private location: Location
  ) { }

  ngOnInit() {
  }


  emailOnChange( value: string ) {
    this.email = value;
  }

  passwordOnChange( value: string ) {
    this.password = value;
  }

  login() {
    this.errorMessageForEmail = '';
    this.errorMessageForPassword = '';

    this.waitingForResponse = true;
    this.afAuth.auth.signInWithEmailAndPassword( this.email, this.password )
    .then( () => {
      this.waitingForResponse = false;
      this.location.back();
      this.openSnackBar('Successfully logged in!');
    } )
    .catch( (error: any ) => {
      this.waitingForResponse = false;

      switch ( error.code ) {
        case 'auth/invalid-email' :
          this.errorMessageForEmail = error.message;
          break;
        case 'auth/user-disabled' :
          this.errorMessageForEmail = error.message;
          break;
        case 'auth/user-not-found' :
          this.errorMessageForEmail = error.message;
          break;
        case 'auth/wrong-password' :
          this.errorMessageForPassword = error.message;
          break;
        default :
          this.errorMessageForEmail = error.message;
          break;
      }
    } );
  }


  private openSnackBar( message: string ) {
    this.snackBar.open( message, undefined, { duration: 3000 } );
  }
}
