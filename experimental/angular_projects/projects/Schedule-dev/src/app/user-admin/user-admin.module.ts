import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
/* Feature Modules */
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { UserAdminComponent } from './user-admin.component';

@NgModule({
  imports: [CommonModule, FormsModule, MyOwnCustomMaterialModule, MyLibModule],
  exports: [UserAdminComponent, LoginComponent, SignUpComponent],
  declarations: [UserAdminComponent, LoginComponent, SignUpComponent],
})
export class UserAdminModule {}
