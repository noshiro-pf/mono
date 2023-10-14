import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './database/user.service';

@Component({
  selector: 'app-home',
  template: `
    <ng-container *ngIf="apps$ | async as apps">
      <div class="body-with-padding">
        <app-list appName="Piko Apps" [apps]="apps"> </app-list>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class HomeComponent implements OnInit {
  apps$: Observable<
    {
      routerLink: string;
      inService: boolean;
      title: string;
      subtitle: string;
      description?: string;
    }[]
  >;

  constructor(private myUserInfo: UserService) {
    this.apps$ = this.myUserInfo.signedIn$.pipe(
      map((signedIn) => [
        // { routerLink: '/scheduling',       inService: true, title: 'Scheduling',       subtitle: '日程調整' },
        {
          routerLink: '/toybox',
          inService: true,
          title: 'Toy Box',
          subtitle: 'おもちゃ',
        },
        {
          routerLink: '/tools-collection',
          inService: true,
          title: 'Tools Collection',
          subtitle: 'ツール集',
        },
      ]),
    );
  }

  ngOnInit() {}
}
