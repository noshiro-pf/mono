import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
/* Feature Modules */
import { ClipboardModule } from 'ngx-clipboard';
/* ngx-pipes */
import { NgPipesModule } from 'ngx-pipes';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
/* angularfire2 */
import { MyOwnAngularFireModule } from './database/my-own-angular-fire.module';
import { FeedbackAdminComponent } from './feedback/feedback-admin.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HomeComponent } from './home.component';
/* angular material */
import { MyOwnCustomMaterialModule } from './my-own-custom-material.module';
/* my modules & components */
import { MyLibModule } from './mylib/mylib.module';
import { NotFoundPageComponent } from './not-found-page.component';
import { ScheduleModule } from './schedule/schedule.module';
import { UserAdminModule } from './user-admin/user-admin.module';

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
    UserAdminModule,
    ScheduleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
