import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { combine, fromObservable, manual, merge, RN } from 'rnjs';
import { fbPaths } from '../../../database/paths';
import { isWideCard } from '../../functions/is-wide-card';
import { CardProperty } from '../../types/card-property';

@Component({
  selector: 'app-dominion-card-image',
  templateUrl: './dominion-card-image.component.html',
  styleUrls: ['./dominion-card-image.component.css'],
})
export class DominionCardImageComponent implements OnInit {
  @Output() private cardClicked = new EventEmitter<void>();

  @Input() description: string = '';

  card$ = manual<CardProperty>(new CardProperty());

  @Input() set card(value: CardProperty) {
    console.log('set card', value);
    if (!value) return;
    this.card$.emit(value);
  }

  private widthSource = manual<number>(0);
  widthInput$ = this.widthSource.skipUnchanged();

  @Input() set width(value: number) {
    if (value === undefined) return;
    this.widthSource.emit(value || 0);
  }

  private heightSource = manual<number>(0);
  heightInput$ = this.heightSource.skipUnchanged();

  @Input() set height(value: number) {
    if (value === undefined) return;
    this.heightSource.emit(value || 0);
  }

  private faceUpSource = manual<boolean>(true);
  faceUp$ = this.faceUpSource.skipUnchanged();

  @Input() set faceUp(value: boolean) {
    if (value === undefined) return;
    this.faceUpSource.emit(!!value);
  }

  private isButtonSource = manual<boolean>(false);
  isButton$ = this.isButtonSource.skipUnchanged();

  @Input() set isButton(value: boolean) {
    if (value === undefined) return;
    this.isButtonSource.emit(!!value);
  }

  private emptySource = manual<boolean>(false);
  empty$ = this.emptySource.skipUnchanged();

  @Input() set empty(value: boolean) {
    if (value === undefined) return;
    this.emptySource.emit(!!value);
  }

  width$: RN<number>;
  height$: RN<number>;
  borderWidth$: RN<number>;
  borderRadius$: RN<number>;
  sourceUrl$: RN<string>;

  constructor(private storage: AngularFireStorage) {
    const isWideCard$: RN<boolean> = this.card$.map((e) =>
      isWideCard(e.cardTypes)
    );

    this.width$ = merge(
      // widthから計算
      this.widthInput$,
      combine(isWideCard$, this.heightInput$).map(([wide, heightInput]) =>
        Math.floor(heightInput * (!wide ? 15 / 23 : 23 / 15))
      )
    ).skipUnchanged();

    this.height$ = merge(
      // widthから計算
      this.heightInput$,
      combine(isWideCard$, this.widthInput$).map(([wide, widthInput]) =>
        Math.floor(widthInput * (wide ? 15 / 23 : 23 / 15))
      )
    ).skipUnchanged();

    this.borderWidth$ = combine(this.widthInput$, this.height$).map(
      ([width, height]) => (18 / 250) * Math.floor(Math.min(width, height))
    );

    this.borderRadius$ = this.borderWidth$;

    const CARD_IMAGE_DIR = fbPaths.storage.cardImages;

    this.sourceUrl$ = combine(this.empty$, this.faceUp$, this.card$)
      .map(([empty, faceUp, card]) => {
        if (empty || !card) return 'blank.png';
        if (!faceUp) {
          if (card.cardTypes.includes('Boon')) return 'Boon-back.jpg';
          if (card.cardTypes.includes('Hex')) return 'Hex-back.jpg';
          if (card.cardId === 'Stash') return 'Stash-back.jpg';
          return 'Card_back.jpg';
        }
        return `${card.nameEng.replace(/ /g, '_')}.jpg`;
      })
      .switchMap((pathSuffix: string) =>
        fromObservable(
          '',
          this.storage.ref(`${CARD_IMAGE_DIR}/${pathSuffix}`).getDownloadURL()
        )
      );
  }

  ngOnInit() {}

  onClicked() {
    if (this.isButton) {
      this.cardClicked.emit();
    }
  }
}
