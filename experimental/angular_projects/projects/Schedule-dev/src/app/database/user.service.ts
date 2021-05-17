import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User as fbUser } from 'firebase/app';
import { combine, fromObservable, RN } from 'rnjs';
import { User } from '../types/user';
import { DatabaseService } from './database.service';

@Injectable()
export class UserService {
  uid$: RN<string> = fromObservable<fbUser>(
    {} as fbUser,
    this.afAuth.authState
  ).map((user) => (user || { uid: '' }).uid || '');

  signedIn$: RN<boolean> = fromObservable<fbUser>(
    {} as fbUser,
    this.afAuth.authState
  ).map((user) => !!user);

  private user$: RN<User> = combine(this.uid$, this.database.users$).map(
    ([uid, users]) =>
      !uid || users.length === 0
        ? new User()
        : users.find((e) => e.databaseKey === uid) || new User()
  );

  name$: RN<string> = this.user$.pluck('name').skipUnchanged();

  nameYomi$: RN<string> = this.user$.pluck('nameYomi').skipUnchanged();

  constructor(
    private afAuth: AngularFireAuth,
    private database: DatabaseService
  ) {}

  async setMyName(value: string) {
    const uid = await this.uid$.once();
    await this.database.user.set.name(uid, value);
  }
}
