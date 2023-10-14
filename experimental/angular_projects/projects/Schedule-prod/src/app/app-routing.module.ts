import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { EditDatabaseComponent  } from './database/edit-database.component';
import { UserAdminComponent } from './database/user-admin/user-admin.component';
import { FeedbackAdminComponent } from './feedback/feedback-admin.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HomeComponent } from './home.component';
import { NotFoundPageComponent } from './not-found-page.component';
import { AnswerPageComponent } from './piko-apps/scheduling/answer-page/answer-page.component';
import { EditEventComponent } from './piko-apps/scheduling/edit-event/edit-event.component';
/* scheduling */
import { SchedulingComponent } from './piko-apps/scheduling/scheduling.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(
      [
        { component: HomeComponent, path: '' },
        // { component: EditDatabaseComponent,      path: 'edit-database' },
        { component: UserAdminComponent, path: 'user-admin' },
        { component: FeedbackComponent, path: 'feedback' },
        { component: FeedbackAdminComponent, path: 'feedback-admin' },
        { component: SchedulingComponent, path: 'scheduling' },
        { component: AnswerPageComponent, path: 'answer/:eventId' },
        { component: AnswerPageComponent, path: 'scheduling/answer/:eventId' },
        { component: EditEventComponent, path: 'edit-event/:eventId' },
        {
          component: EditEventComponent,
          path: 'scheduling/edit-event/:eventId',
        },
        { component: NotFoundPageComponent, path: '**' },
      ],
      { useHash: true },
    ),
  ],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule {}
