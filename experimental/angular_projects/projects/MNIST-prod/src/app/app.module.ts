import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MyOwnCustomMaterialModule } from './my-own-custom-material.module';

import { AppComponent } from './app.component';
import { MnistComponent } from './mnist/mnist.component';
import { WaitingSpinnerComponent } from './mylib/waiting-spinner.component';
import { MessageDialogComponent } from './mylib/message-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MnistComponent,
    WaitingSpinnerComponent,
    MessageDialogComponent,
  ],
  imports: [
    BrowserModule,
    MyOwnCustomMaterialModule,
  ],
  entryComponents: [
    MessageDialogComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
