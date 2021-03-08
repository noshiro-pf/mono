import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MnistComponent } from './mnist/mnist.component';
import { MyOwnCustomMaterialModule } from './my-own-custom-material.module';
import { MessageDialogComponent } from './mylib/message-dialog.component';
import { WaitingSpinnerComponent } from './mylib/waiting-spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    MnistComponent,
    WaitingSpinnerComponent,
    MessageDialogComponent,
  ],
  imports: [BrowserModule, MyOwnCustomMaterialModule],
  entryComponents: [MessageDialogComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
