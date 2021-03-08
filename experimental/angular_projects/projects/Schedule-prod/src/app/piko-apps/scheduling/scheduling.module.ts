import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/* Feature Modules */
import { ClipboardModule } from 'ngx-clipboard';
import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyLibModule } from '../../mylib/mylib.module';
import { AnswerFormComponent } from './answer-page/answer-form/answer-form.component';
import { AnswerPageComponent } from './answer-page/answer-page.component';
import { EditPasswordDialogComponent } from './answer-page/edit-password-dialog.component';
import { SpreadsheetComponent } from './answer-page/spreadsheet/spreadsheet.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { SchedulingComponent } from './scheduling.component';
import { AnswerDeadlineComponent } from './sub-components/answer-deadline/answer-deadline.component';
import { NameAndNotesComponent } from './sub-components/name-and-notes/name-and-notes.component';
import { PasswordComponent } from './sub-components/password/password.component';
import { SelectDatesComponent } from './sub-components/select-dates/select-dates.component';
import { SetTimeDialogComponent } from './sub-components/select-dates/set-time-dialog.component';
import { SymbolSettingsComponent } from './sub-components/symbol-settings/symbol-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
  ],
  exports: [SchedulingComponent, SetTimeDialogComponent, AnswerPageComponent],
  declarations: [
    SchedulingComponent,
    SetTimeDialogComponent,
    AnswerPageComponent,
    NameAndNotesComponent,
    SelectDatesComponent,
    AnswerDeadlineComponent,
    SymbolSettingsComponent,
    EditEventComponent,
    SpreadsheetComponent,
    AnswerFormComponent,
    PasswordComponent,
    EditPasswordDialogComponent,
  ],
  entryComponents: [SetTimeDialogComponent, EditPasswordDialogComponent],
})
export class SchedulingModule {}
