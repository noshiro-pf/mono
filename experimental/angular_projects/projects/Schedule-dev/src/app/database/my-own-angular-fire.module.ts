import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


/* angular material */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';


import { environment } from '../../environments/environment';

import { AngularFireModule         } from 'angularfire2';
import { AngularFireAuthModule     } from 'angularfire2/auth';
import { AngularFirestoreModule    } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { MyLibModule } from '../mylib/mylib.module';

import { AutoBackupOnFirebaseService   } from './auto-backup-on-firebase.service';
import { UserService             } from './user.service';
import { DatabaseService } from './database.service';

import { MyPageComponent               } from './my-page.component';


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
  declarations: [
    MyPageComponent,
  ],
  providers: [
    UserService,
    DatabaseService,
    AutoBackupOnFirebaseService,
  ]
})
export class MyOwnAngularFireModule { }
