import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Feature Modules */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';

import { UserAdminComponent } from './user-admin.component';
import { LoginComponent     } from './login/login.component';
import { SignUpComponent    } from './sign-up/sign-up.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
  ],
  exports: [
    UserAdminComponent,
    LoginComponent,
    SignUpComponent,
  ],
  declarations: [
    UserAdminComponent,
    LoginComponent,
    SignUpComponent,
  ],
})
export class UserAdminModule { }
