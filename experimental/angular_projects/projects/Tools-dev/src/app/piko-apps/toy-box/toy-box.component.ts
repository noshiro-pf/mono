import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../database/user.service';

@Component({
  selector: 'app-toy-box',
  template: `
    <ng-container *ngIf="apps$ | async as apps">
      <div class="body-with-padding">
        <app-list appName="Toy Box" [apps]="apps"> </app-list>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class ToyBoxComponent implements OnInit {
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
        {
          routerLink: '/toybox/mnist',
          inService: true,
          title: 'Handwritten Numeral Recognition',
          subtitle: '手書き数字認識',
        },
        {
          routerLink: '/toybox/lambda-interpreter',
          inService: true,
          title: 'Lambda Calculus Interpreter',
          subtitle: 'λ計算インタプリタ',
        },
      ])
    );
  }

  ngOnInit() {}
}
