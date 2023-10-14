import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Feedback } from '../classes/feedback';
import { User } from '../classes/user';
import { utils } from '../mylib/utilities';
import { Answer, Schedule } from '../piko-apps/scheduling/scheduling-event';

@Injectable()
export class DatabaseService {
  fdPath = {
    users: '/users',
    schedulingEvents: '/schedulingEvents',
    feedbacks: '/feedbacks',
  };

  users$: Observable<User[]>;
  schedulingEvents$: Observable<Schedule[]>;
  feedbacks$: Observable<Feedback[]>;

  /* methods */
  user: {
    setUser: (uid: string, newUser: User) => Promise<void>;
    set: {
      name: (uid: string, value: string) => Promise<void>;
      name_yomi: (uid: string, value: string) => Promise<void>;
    };
  };

  scheduling: {
    addEvent: (value: Schedule) => firebase.database.ThenableReference;
    setEvent: (eventID: string, value: Schedule) => Promise<void>;
    addAnswer: (
      eventID: string,
      value: Answer,
    ) => firebase.database.ThenableReference;
    setAnswer: (
      eventID: string,
      answerID: string,
      value: Answer,
    ) => Promise<void>;
    removeAnswer: (eventID: string, answerID: string) => Promise<void>;
  };

  feedbacks: {
    add: (value: Feedback) => firebase.database.ThenableReference;
    closeIssue: (feedbackID: string, value: boolean) => Promise<void>;
  };

  constructor(private afdb: AngularFireDatabase) {
    this.users$ = this.afdb
      .list(this.fdPath.users, (ref) => ref.orderByChild('name_yomi'))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map(
            (action) => new User(<any>action.key, <any>action.payload.val()),
          ),
        ),
      );

    this.schedulingEvents$ = this.afdb
      .list(this.fdPath.schedulingEvents)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map(
            (action) =>
              new Schedule(<any>action.key, <any>action.payload.val()),
          ),
        ),
      );

    this.feedbacks$ = this.afdb
      .list(this.fdPath.feedbacks)
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map(
            (action) =>
              new Feedback(<any>action.key, <any>action.payload.val()),
          ),
        ),
      );

    /*** methods ***/

    const userSetProperty = (uid: string, pathPrefix: string, value: any) => {
      if (!uid) throw new Error('uid is empty');
      return this.afdb
        .object(`${this.fdPath.users}/${uid}/${pathPrefix}`)
        .set(value);
    };
    this.user = {
      setUser: (uid: string, newUser: User) => {
        const newUserObj = utils.object.copy(newUser);
        delete newUserObj.databaseKey;
        return this.afdb.object(`${this.fdPath.users}/${uid}`).set(newUserObj);
      },

      set: {
        name: (uid: string, value: string) =>
          userSetProperty(uid, 'name', value),

        name_yomi: (uid: string, value: string) =>
          userSetProperty(uid, 'name_yomi', value),
      },
    };

    this.scheduling = {
      addEvent: (value: Schedule) => {
        const copy = utils.object.copy(value);
        delete copy.databaseKey;
        return this.afdb.list(this.fdPath.schedulingEvents).push(copy);
      },

      setEvent: (eventID: string, value: Schedule) => {
        const copy = utils.object.copy(value);
        delete copy.databaseKey;
        copy.answers = {};
        value.answers.forEach((answer) => {
          copy.answers[answer.databaseKey] = answer;
        });
        return this.afdb
          .object(`${this.fdPath.schedulingEvents}/${eventID}`)
          .set(copy);
      },

      addAnswer: (eventID: string, value: Answer) => {
        const copy = utils.object.copy(value);
        delete copy.databaseKey;
        return this.afdb
          .list(`${this.fdPath.schedulingEvents}/${eventID}/answers`)
          .push(copy);
      },

      setAnswer: (eventID: string, answerID: string, value: Answer) => {
        const copy = utils.object.copy(value);
        delete copy.databaseKey;
        return this.afdb
          .object(
            `${this.fdPath.schedulingEvents}/${eventID}/answers/${answerID}`,
          )
          .set(copy);
      },

      removeAnswer: (eventID: string, answerID: string) =>
        this.afdb
          .object(
            `${this.fdPath.schedulingEvents}/${eventID}/answers/${answerID}`,
          )
          .remove(),
    };

    this.feedbacks = {
      add: (value: Feedback) => {
        const copy = utils.object.copy(value);
        delete copy.databaseKey;
        delete copy.date;
        copy.timeStamp = value.date;
        return this.afdb.list(this.fdPath.feedbacks).push(copy);
      },

      closeIssue: (feedbackID: string, value: boolean) =>
        this.afdb
          .object(`${this.fdPath.feedbacks}/${feedbackID}/closed`)
          .set(value),
    };
  }
}
