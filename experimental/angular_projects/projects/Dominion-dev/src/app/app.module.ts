import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

/* angular material */
import { MyOwnCustomMaterialModule } from './my-own-custom-material.module';

/* angularfire2 */
import { MyOwnAngularFireModule } from './database/my-own-angular-fire.module';

/* ngx-pipes */
import { NgPipesModule } from 'ngx-pipes';

/* my modules & components */
import { MyLibModule } from './mylib/mylib.module';

import { HomeComponent } from './home.component';

import { DominionAppsModule } from './dominion/dominion-apps.module';
import { NotFoundPageComponent } from './not-found-page.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MyOwnCustomMaterialModule,
    MyOwnAngularFireModule,
    MyLibModule,
    DominionAppsModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
