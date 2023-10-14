import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeedbackAdminComponent } from './feedback/feedback-admin.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HomeComponent } from './home.component';
import { NotFoundPageComponent } from './not-found-page.component';
import { AnswerPageComponent } from './schedule/answer-page/answer-page.component';
import { EditEventComponent } from './schedule/edit-event/edit-event.component';
/* scheduling */
import { ScheduleComponent } from './schedule/schedule.component';
// import { EditDatabaseComponent  } from './database/edit-database.component';
import { UserAdminComponent } from './user-admin/user-admin.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(
      [
        { component: HomeComponent, path: '' },
        { component: UserAdminComponent, path: 'user-admin' },
        { component: FeedbackComponent, path: 'feedback' },
        { component: FeedbackAdminComponent, path: 'feedback-admin' },
        { component: ScheduleComponent, path: 'scheduling' },
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
