import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';
import { MyLibModule } from '../mylib/mylib.module';
import { ToolsCollectionModule } from './tools-collection/tools-collection.module';
import { ToyBoxModule } from './toy-box/toy-box.module';

@NgModule({
  imports: [
    CommonModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    ToyBoxModule,
    ToolsCollectionModule,
  ],
  exports: [ToyBoxModule, ToolsCollectionModule],
  declarations: [],
})
export class PikoAppsModule {}
