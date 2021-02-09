import { Component, OnInit } from '@angular/core';
import { RN } from 'rnjs';

import { UserService } from './database/user.service';


@Component({
  selector: 'app-home',
  template: `
    <div class="body-with-padding">
      <app-list appName="Dominion Apps" [apps]="apps$ | async" > </app-list>
    </div>
  `,
  styles: [],
})
export class HomeComponent implements OnInit {

  apps$: RN<{
      routerLink:  string,
      inService:   boolean,
      title:       string,
      subtitle:    string,
      description?: string
    }[]>;

  constructor(
    private user: UserService
  ) {
    this.apps$ = this.user.signedIn$.map( signedIn => [
        {
          routerLink: '/online-game',
          inService:  signedIn,
          title:      'Online Game',
          subtitle:   'Dominion オンライン対戦',
          description: `※Chrome推奨${( signedIn ? '' : '、要ログイン')}`,
        },
        {
          routerLink: '/online-randomizer',
          inService:  signedIn,
          title:      'Randomizer Online',
          subtitle:   'サプライ生成＆ゲーム結果追加（グループ同期機能付き）',
          description: `※Chrome推奨${( signedIn ? '' : '、要ログイン')}`,
        },
        {
          routerLink: '/game-result',
          inService: signedIn,
          title: 'Game Result List',
          subtitle: '成績表',
          description: ( signedIn ? '' : '※要ログイン'),
        },
        { routerLink: '/cardlist' , inService: true, title: 'Card List', subtitle: 'カード一覧表', },
        { routerLink: '/rulebooks', inService: true, title: 'RuleBooks', subtitle: 'Dominionのルールブック(PDF)', },
      ] );
  }

  ngOnInit() {
  }
}
