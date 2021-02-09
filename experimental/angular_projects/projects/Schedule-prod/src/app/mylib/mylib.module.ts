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
import { ItemsPerPageComponent } from './data-table/items-per-page.component';
import { PagenationComponent   } from './data-table/pagenation/pagenation.component';
import { DataTableComponent   } from './data-table/data-table.component';
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
    ItemsPerPageComponent,
    PagenationComponent,
    MultipleDatePickerComponent,
  ],
  declarations: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    WaitingSpinnerComponent,
    AppListComponent,
    DataTableComponent,
    ItemsPerPageComponent,
    PagenationComponent,
    MultipleDatePickerComponent,
  ],
  providers: [],
  entryComponents: [
    MessageDialogComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
  ]
})
export class MyLibModule { }
