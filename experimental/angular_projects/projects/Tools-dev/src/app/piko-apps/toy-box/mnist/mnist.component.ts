import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, ReplaySubject, combineLatest, from, merge } from 'rxjs';
import { filter, map, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { MessageDialogComponent } from '../../../mylib/message-dialog.component';
import { shareWithCache } from '../../../mylib/my-rxjs-operators/share-with-cache';
import * as np from '../../../mylib/numts/num';
import { ModelService } from './model.service';

@Component({
  selector: 'app-mnist',
  templateUrl: './mnist.component.html',
  styleUrls: ['./mnist.component.css'],
  providers: [ModelService],
})
export class MnistComponent implements OnInit, AfterViewInit, OnDestroy {
  private alive = true;

  // canvas
  private $canvas!: HTMLCanvasElement;
  private $canvasOffset!: { left: number; top: number };
  private context!: CanvasRenderingContext2D;
  private moveflg = 0;
  private Xpoint!: number;
  private Ypoint!: number;

  // 初期値（サイズ、色、アルファ値）の決定
  private defSize = 7;
  private defColor = 'white'; // '#555';

  private predictionClickSource = new ReplaySubject<void>(1);
  private predictionClick$ = this.predictionClickSource.asObservable();

  private resetClickSource = new ReplaySubject<void>(1);
  private resetClick$ = this.resetClickSource.asObservable();

  accuracyScores$!: Observable<(number | undefined)[]>;
  maxAccuracyIndex$!: Observable<number | undefined>;

  calculating$!: Observable<boolean>;
  modelIsReady$!: Observable<boolean>;

  private dialogRef!: any;

  constructor(
    private model: ModelService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    const imageData$: Observable<np.TNdNum> = this.predictionClick$.pipe(
      map(() => this.getImageTable()),
      shareWithCache(),
    );

    const latestScores$ = combineLatest(
      imageData$,
      this.model.predict$,
      (imageData, predict) => this.getAccuracyScores(imageData, predict),
    ).pipe(
      switchMap((promise) => from(promise)),
      shareWithCache(),
    );

    this.modelIsReady$ = this.model.predict$.pipe(
      map((_) => true),
      startWith(false),
      shareWithCache(),
    );

    this.calculating$ = merge(
      this.predictionClick$.pipe(map((_) => true)),
      latestScores$.pipe(map((_) => false)),
    ).pipe(startWith(false), shareWithCache());

    this.accuracyScores$ = merge(
      this.resetClick$.pipe(map((_) => np.newArray(10, undefined))),
      latestScores$,
    ).pipe(startWith(np.newArray(10, undefined)), shareWithCache());

    this.maxAccuracyIndex$ = merge(
      this.modelIsReady$.pipe(
        filter((e) => e === false),
        map((_) => undefined),
      ),
      this.accuracyScores$.pipe(
        map((scores) => {
          if (scores.includes(undefined)) return undefined;
          return scores.indexOf(Math.max.apply(null, scores));
        }),
      ),
    ).pipe(startWith(undefined), shareWithCache());

    this.resetClick$.pipe(takeWhile(() => this.alive)).subscribe(() => {
      this.context.clearRect(
        0,
        0,
        this.context.canvas.clientWidth,
        this.context.canvas.clientHeight,
      );
    });

    // loading modal
    setTimeout(() => {
      this.showLoadingModal();
    }, 0);

    this.modelIsReady$
      .pipe(
        filter((e) => e === true),
        takeWhile(() => this.alive),
      )
      .subscribe(() => {
        this.closeLoadingModal();
      });
  }

  ngAfterViewInit() {
    this.$canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.context = this.$canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.fillStyle = 'rgb(255,255,255)';
  }

  ngOnDestroy() {
    this.alive = false;
  }

  private showLoadingModal = () => {
    this.dialogRef = this.dialog.open(MessageDialogComponent, {
      autoFocus: false,
    });
    this.dialogRef.componentInstance.message = 'Loading...';
  };

  private closeLoadingModal = () => {
    this.dialogRef.close();
  };

  prediction() {
    this.predictionClickSource.next();
  }

  clearCanvas() {
    this.resetClickSource.next();
  }

  onTouchStart(event: any) {
    event.preventDefault();
    const t = event.changedTouches[0];
    this.$canvasOffset = {
      left: this.$canvas.offsetLeft,
      top: this.$canvas.offsetTop,
    };
    this.startPoint(
      t.pageX - this.$canvasOffset.left,
      t.pageY - this.$canvasOffset.top,
    );
  }
  onMouseDown(event: any) {
    event.preventDefault();
    this.startPoint(event.layerX, event.layerY);
  }

  onTouchMove(event: any) {
    const t = event.changedTouches[0];
    this.movePoint(
      t.pageX - this.$canvasOffset.left,
      t.pageY - this.$canvasOffset.top,
    );
  }
  onMouseMove(event: any) {
    if (
      event.buttons === 1 ||
      event.witch === 1 ||
      event.type === 'touchmove'
    ) {
      this.movePoint(event.layerX, event.layerY);
    }
  }

  onTouchEnd() {
    this.endPoint();
  }
  onMouseUp() {
    this.endPoint();
  }

  private startPoint(Xpoint: number, Ypoint: number) {
    this.context.beginPath();

    this.Xpoint = Xpoint;
    this.Ypoint = Ypoint;

    this.context.moveTo(this.Xpoint, this.Ypoint);
  }

  private movePoint(Xpoint: number, Ypoint: number) {
    this.Xpoint = Xpoint;
    this.Ypoint = Ypoint;
    this.moveflg = 1;

    this.context.lineTo(this.Xpoint, this.Ypoint);
    this.context.lineCap = 'round';
    this.context.lineWidth = this.defSize * 2;
    this.context.strokeStyle = this.defColor;
    this.context.stroke();
  }

  private endPoint() {
    if (this.moveflg === 0) {
      this.context.lineTo(this.Xpoint - 1, this.Ypoint - 1);
      this.context.lineCap = 'round';
      this.context.lineWidth = this.defSize * 2;
      this.context.strokeStyle = this.defColor;
      this.context.stroke();
    }
    this.moveflg = 0;
  }

  private getImageTable(): np.TNdNum {
    const [input_w, input_h] = [28, 28];

    // resize
    const $tmpCanvas = document.createElement('canvas').getContext('2d');
    if (!$tmpCanvas) return np.createNdArray([input_w, input_h], 0.0);
    // if ( !$tmpCanvas ) return new ImageData( input_w, input_h );
    $tmpCanvas.drawImage(this.$canvas, 0, 0, input_w, input_h);

    // convert grayscale
    const imageData = $tmpCanvas.getImageData(0, 0, input_w, input_h);
    // imageData.data : RGBA の順で 0 から 255 の間の整数

    const tmp = np.newArray(input_w * input_h, 0);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg =
        (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      // imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
      tmp[i / 4] = avg / 255;
    }

    return np.reshape(tmp, [input_w, input_h]);
  }

  private getAccuracyScores = (
    imageData: np.TNdNum,
    predict: (input: np.TNdNum) => Promise<number[]>,
  ): Promise<number[]> => {
    return predict([[imageData]]);
  };
}
