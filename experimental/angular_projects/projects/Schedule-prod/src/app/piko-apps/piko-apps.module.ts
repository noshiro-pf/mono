import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';
import { SchedulingModule } from './scheduling/scheduling.module';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    SchedulingModule,
  ],
  exports: [SchedulingModule],
  declarations: [],
})
export class PikoAppsModule {}
