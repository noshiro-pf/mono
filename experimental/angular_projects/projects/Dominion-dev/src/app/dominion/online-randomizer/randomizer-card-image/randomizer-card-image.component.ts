import { Component, OnInit, Input } from '@angular/core';

import { Observable, of } from 'rxjs';

import { MatDialog } from '@angular/material';

import { FireDatabaseService } from '../../../database/database.service';
import { MyRandomizerGroupService       } from '../my-randomizer-group.service';

import { CardProperty  } from '../../types/card-property';
import { SelectedCards } from '../../types/selected-cards';

import { CardPropertyDialogComponent } from '../../sub-components/card-property-dialog/card-property-dialog.component';


@Component({
  selector: 'app-randomizer-card-image',
  templateUrl: './randomizer-card-image.component.html',
  styleUrls: ['./randomizer-card-image.component.css']
})
export class RandomizerCardImageComponent implements OnInit {

  @Input() longSideLength = 180;
  selectedCards$ = this.myRandomizerGroup.selectedCards$;
  cardPropertyList$ = this.database.cardPropertyList$;


  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {
  }

  ngOnInit() {
  }

  cardInfoButtonClicked( cardIndex: number ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent, { autoFocus: false } );
    // TODO: RxJS -> RN
    // dialogRef.componentInstance.indiceInCardList$ = of([cardIndex]);
  }
}
