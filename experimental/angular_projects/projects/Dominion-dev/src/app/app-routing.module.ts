import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent             } from './home.component';
import { NotFoundPageComponent     } from './not-found-page.component';

import { DataTableDemoComponent    } from './mylib/data-table/data-table-demo.component';

import { EditDatabaseComponent     } from './database/edit-database.component';
import { UserAdminComponent        } from './database/user-admin/user-admin.component';
import { MyPageComponent           } from './database/my-page.component';

import { OnlineRandomizerComponent } from './dominion/online-randomizer/online-randomizer.component';
import { GameResultComponent       } from './dominion/game-result/game-result.component';
import { CardPropertyListComponent } from './dominion/card-property-list.component';
import { RuleBooksComponent        } from './dominion/rule-books.component';

import { OnlineGameComponent       } from './dominion/online-game/online-game.component';
import { GameMainComponent         } from './dominion/online-game/game-main/game-main.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
      { component: HomeComponent,             path: ''                  },
      { component: EditDatabaseComponent,     path: 'edit-database'     },
      { component: UserAdminComponent,        path: 'user-admin'        },
      { component: MyPageComponent,           path: 'my-page'           },
      { component: OnlineGameComponent,       path: 'online-game'       },
      { component: GameMainComponent,         path: 'online-game-main'  },
      { component: OnlineRandomizerComponent, path: 'online-randomizer' },
      { component: GameResultComponent,       path: 'game-result'       },
      { component: CardPropertyListComponent, path: 'cardlist'          },
      { component: RuleBooksComponent,        path: 'rulebooks'         },
      { component: DataTableDemoComponent,    path: 'data-table-demo'   },
      { component: NotFoundPageComponent,     path: '**'                },
    ], { useHash: true } ),
  ],
  exports: [
    RouterModule,
  ],
  declarations: [
  ]
})
export class AppRoutingModule { }
