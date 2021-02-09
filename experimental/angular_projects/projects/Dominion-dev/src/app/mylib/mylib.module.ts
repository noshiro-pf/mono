import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { MyOwnCustomMaterialModule } from '../my-own-custom-material.module';

import { MessageDialogComponent  } from './message-dialog.component';
import { AlertDialogComponent    } from './alert-dialog.component';
import { ConfirmDialogComponent  } from './confirm-dialog.component';
import { WaitingSpinnerComponent } from './waiting-spinner.component';
import { AppListComponent        } from './app-list/app-list.component';

// data table
import { DataTableDemoComponent } from './data-table/data-table-demo.component';
import { ItemsPerPageComponent } from './data-table/items-per-page.component';
import { PaginationComponent } from './data-table/pagination/pagination.component';
import { DataTableComponent } from './data-table/data-table.component';
import { HeaderCellComponent } from './data-table/header-cell/header-cell.component';
import { ObjectDataTableComponent } from './data-table/object-data-table.component';

import { MultipleDatePickerComponent } from './multiple-date-picker/multiple-date-picker.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MyOwnCustomMaterialModule,
  ],
  exports: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    WaitingSpinnerComponent,
    AppListComponent,
    DataTableComponent,
    ObjectDataTableComponent,
    DataTableDemoComponent,
    ItemsPerPageComponent,
    PaginationComponent,
    HeaderCellComponent,
    MultipleDatePickerComponent,
  ],
  declarations: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    WaitingSpinnerComponent,
    AppListComponent,
    DataTableComponent,
    ObjectDataTableComponent,
    DataTableDemoComponent,
    ItemsPerPageComponent,
    PaginationComponent,
    HeaderCellComponent,
    MultipleDatePickerComponent,
  ],
  entryComponents: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
  ]
})
export class MyLibModule { }
