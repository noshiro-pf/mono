import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';

import { ToyBoxModule          } from './toy-box/toy-box.module';
import { ToolsCollectionModule } from './tools-collection/tools-collection.module';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    ToyBoxModule,
    ToolsCollectionModule,
  ],
  exports: [
    ToyBoxModule,
    ToolsCollectionModule,
  ],
  declarations: []
})
export class PikoAppsModule { }
