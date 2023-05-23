import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { RN, fromObservable } from 'rnjs';

@Component({
  selector: 'app-rule-books',
  template: `
    <div class="wrapper">
      <div *ngFor="let rulebook of RuleBooks" class="rulebook-box">
        <ng-container
          *ngIf="{
            pdfurl: rulebook.pdfurl$ | async,
            imgurl: rulebook.imgurl$ | async
          } as data"
        >
          <a
            *ngIf="data.pdfurl && data.imgurl"
            [href]="data.pdfurl"
            target="_blank"
          >
            <mat-card>
              <img mat-card-image [src]="data.imgurl" />
              <mat-card-content>{{ rulebook.title }}</mat-card-content>
            </mat-card>
          </a>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .wrapper {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-end;
        align-content: flex-start;
      }
      .rulebook-box {
        margin: 30px;
        width: 250px;
      }
      .rulebook-box:hover {
        cursor: pointer;
      }
    `,
  ],
})
export class RuleBooksComponent implements OnInit {
  private COVER_IMAGE_DIR = 'images/cover';
  private PDF_DIR = 'pdf';

  RuleBooks!: {
    imgurl$: RN<string>;
    pdfurl$: RN<string>;
    title: string;
  }[];

  constructor(private storage: AngularFireStorage) {}

  ngOnInit() {
    this.RuleBooks = [
      {
        imgurl$: this.toImgUrl('01_Dominion_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_01_Original.pdf'),
        title: '01 - ドミニオン「基本」',
      },
      {
        imgurl$: this.toImgUrl('02_Intrigue_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_02_Intrigue.pdf'),
        title: '02 - ドミニオン「陰謀」',
      },
      {
        imgurl$: this.toImgUrl('03_Seaside_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_03_Seaside.pdf'),
        title: '03 - ドミニオン「海辺」',
      },
      {
        imgurl$: this.toImgUrl('04_Alchemy_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_04_Alchemy.pdf'),
        title: '04 - ドミニオン「錬金術」',
      },
      {
        imgurl$: this.toImgUrl('05_Prosperity_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_05_Prosperity.pdf'),
        title: '05 - ドミニオン「繁栄」',
      },
      {
        imgurl$: this.toImgUrl('06_Cornucopia_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_06_Cornucopia.pdf'),
        title: '06 - ドミニオン「収穫祭」',
      },
      {
        imgurl$: this.toImgUrl('07_Hinterlands_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_07_Hinterlands.pdf'),
        title: '07 - ドミニオン「異郷」',
      },
      {
        imgurl$: this.toImgUrl('08_Dark_Ages_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_08_Dark_Ages.pdf'),
        title: '08 - ドミニオン「暗黒時代」',
      },
      {
        imgurl$: this.toImgUrl('09_Guilds_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_09_Guilds.pdf'),
        title: '09 - ドミニオン「ギルド」',
      },
      {
        imgurl$: this.toImgUrl('10_Adventures_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_10_Adventures.pdf'),
        title: '10 - ドミニオン「冒険」',
      },
      {
        imgurl$: this.toImgUrl('11_Empires_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_11_Empires.pdf'),
        title: '11 - ドミニオン「帝国」',
      },
      {
        imgurl$: this.toImgUrl('12_Dominion2nd_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_12_Dominion2nd.pdf'),
        title: '12 - ドミニオン 第2版',
      },
      {
        imgurl$: this.toImgUrl('13_Intrigue2nd_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_13_Intrigue2nd.pdf'),
        title: '13 - ドミニオン「陰謀」 第2版',
      },
      {
        imgurl$: this.toImgUrl('14_Nocturne_Cover.png'),
        pdfurl$: this.toPdfUrl('Dominion_gameRules_14_Nocturne.pdf'),
        title: '14 - ドミニオン「夜想曲」',
      },
    ];
  }

  private toImgUrl = (filename: string) =>
    fromObservable(
      '',
      this.storage.ref(`${this.COVER_IMAGE_DIR}/${filename}`).getDownloadURL()
    );

  private toPdfUrl = (filename: string) =>
    fromObservable(
      '',
      this.storage.ref(`${this.PDF_DIR}/${filename}`).getDownloadURL()
    );
}
