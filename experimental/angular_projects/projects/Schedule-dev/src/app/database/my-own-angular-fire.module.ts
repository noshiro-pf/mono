import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../../environments/environment';
/* angular material */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';
import { AutoBackupOnFirebaseService } from './auto-backup-on-firebase.service';
import { DatabaseService } from './database.service';
import { MyPageComponent } from './my-page.component';
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    AngularFireModule.initializeApp(environment.firebase, 'ScheduleApps'), // imports firebase/app needed for everything
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireDatabaseModule, // imports firebase/firestore, only needed for database features
    MyLibModule,
  ],
  declarations: [MyPageComponent],
  providers: [UserService, DatabaseService, AutoBackupOnFirebaseService],
})
export class MyOwnAngularFireModule {}
