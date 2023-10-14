import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../database/user.service';
import { MyRandomizerGroupService } from './my-randomizer-group.service';

@Component({
  providers: [MyRandomizerGroupService],
  selector: 'app-online-randomizer',
  templateUrl: './online-randomizer.component.html',
  styleUrls: ['./online-randomizer.component.css'],
})
export class OnlineRandomizerComponent implements OnInit {
  signedIn$: Observable<boolean>;
  signedInToRandomizerGroup$: Observable<boolean>;
  myRandomizerGroupName$: Observable<string>;
  BlackMarketIsUsed$: Observable<boolean>;

  constructor(
    private user: UserService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
    // TODO: RxJS -> RN
    // this.signedIn$ = this.user.signedIn$;
    // this.signedInToRandomizerGroup$ = this.user.signedInToRandomizerGroup$;
    // this.myRandomizerGroupName$ = this.myRandomizerGroup.name$;
    // this.BlackMarketIsUsed$
    //   = this.myRandomizerGroup.selectedCards$.pipe(
    //       map( e => e.BlackMarketPile.length > 0 ),
    //       distinctUntilChanged() );
  }

  ngOnInit() {}
}
