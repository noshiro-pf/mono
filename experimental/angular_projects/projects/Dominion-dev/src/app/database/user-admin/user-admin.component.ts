import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-admin',
  template: `
    <div class="body loginFormWrapper">
      <mat-tab-group class="center-window">
        <mat-tab label="ログイン">
          <app-login></app-login>
        </mat-tab>
        <mat-tab label="新規登録">
          <app-sign-up></app-sign-up>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .loginFormWrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .body{
      width: 100vw;
      height: var(--main-height-without-toolbar);
    }
  `]
})
export class UserAdminComponent implements OnInit {


  constructor(
  ) { }

  ngOnInit() {
  }

}
