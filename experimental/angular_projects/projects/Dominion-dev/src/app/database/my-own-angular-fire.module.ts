import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { environment } from '../../environments/environment';
/* angular material */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';
import { AutoBackupOnFirebaseService } from './auto-backup-on-firebase.service';
import { FireDatabaseService } from './database.service';
import { EditDatabaseComponent } from './edit-database.component';
import { MyPageComponent } from './my-page.component';
import { LoginComponent } from './user-admin/login/login.component';
import { SignUpComponent } from './user-admin/sign-up/sign-up.component';
import { UserAdminComponent } from './user-admin/user-admin.component';
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    AngularFireModule.initializeApp(environment.firebase, 'DominionApp'), // imports firebase/app needed for everything
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireDatabaseModule, // imports firebase/firestore, only needed for database features
    AngularFireStorageModule,
    MyLibModule,
  ],
  declarations: [
    EditDatabaseComponent,
    UserAdminComponent,
    LoginComponent,
    SignUpComponent,
    MyPageComponent,
  ],
  providers: [UserService, FireDatabaseService, AutoBackupOnFirebaseService],
})
export class MyOwnAngularFireModule {}
