import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
/* angularfire2 */
import { MyOwnAngularFireModule } from './database/my-own-angular-fire.module';
import { DominionAppsModule } from './dominion/dominion-apps.module';
import { HomeComponent } from './home.component';
/* angular material */
import { MyOwnCustomMaterialModule } from './my-own-custom-material.module';
/* my modules & components */
import { MyLibModule } from './mylib/mylib.module';
import { NotFoundPageComponent } from './not-found-page.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, NotFoundPageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MyOwnCustomMaterialModule,
    MyOwnAngularFireModule,
    MyLibModule,
    DominionAppsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
