import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyLibModule } from '../../mylib/mylib.module';
import { JsonPrettyPrintComponent } from './json-pretty-print/json-pretty-print.component';
import { Json2tsvComponent } from './json2tsv/json2tsv.component';
import { ToolsCollectionComponent } from './tools-collection.component';
import { Tsv2jsonComponent } from './tsv2json/tsv2json.component';

@NgModule({
  imports: [CommonModule, MyOwnCustomMaterialModule, MyLibModule],
  declarations: [
    Tsv2jsonComponent,
    ToolsCollectionComponent,
    JsonPrettyPrintComponent,
    Json2tsvComponent,
  ],
})
export class ToolsCollectionModule {}
