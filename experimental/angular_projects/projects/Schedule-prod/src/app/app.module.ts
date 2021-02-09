import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

/* angular material */
import { MyOwnCustomMaterialModule } from './my-own-custom-material.module';

/* ngx-pipes */
import { NgPipesModule } from 'ngx-pipes';

/* Feature Modules */
import { ClipboardModule } from 'ngx-clipboard';

/* my modules & components */
import { MyLibModule } from './mylib/mylib.module';

/* angularfire2 */
import { MyOwnAngularFireModule } from './database/my-own-angular-fire.module';

import { HomeComponent } from './home.component';
import { NotFoundPageComponent } from './not-found-page.component';
import { FeedbackAdminComponent } from './feedback/feedback-admin.component';
import { FeedbackComponent } from './feedback/feedback.component';

import { PikoAppsModule } from './piko-apps/piko-apps.module';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundPageComponent,
    FeedbackComponent,
    FeedbackAdminComponent,
  ],
  imports: [
    BrowserModule,
    ClipboardModule,
    NgPipesModule,
    AppRoutingModule,
    MyOwnCustomMaterialModule,
    MyLibModule,
    MyOwnAngularFireModule,
    PikoAppsModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
