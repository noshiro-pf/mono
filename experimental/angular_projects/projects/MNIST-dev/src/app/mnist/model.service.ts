import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as np from '../mylib/numts/num';
import { SimpleConvNet } from './class/simple-conv-net';
import { softmax } from './functions/softmax';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private network!: SimpleConvNet;

  predict$!: Observable<(input: np.TNdNum) => Promise<number[]>>;

  constructor() {
    const params$ = (() => {
      const url =
        'https://dl.dropboxusercontent.com/s/llnrkkz54jjg3yh/params.json';
      const req = new XMLHttpRequest();
      req.open('get', url); // リクエストを初期化
      req.send(); // リクエストの送信
      return fromEvent(req, 'load') // 'load'イベントからObservableを作成
        .pipe(map((event: any) => JSON.parse(event.target.responseText || '')));
    })();

    this.network = new SimpleConvNet(
      [1, 28, 28],
      {
        filterNum: 30,
        filterSize: 5,
        padding: 0,
        stride: 1,
      },
      100,
      10,
      0.01,
    );

    this.predict$ = params$.pipe(
      map((params) => {
        this.network.loadParams(params);
        return async (input: np.TNdNum) => {
          let resolve: any;
          const p = new Promise<number[]>((r) => (resolve = r));
          setTimeout(() => {
            const result = (this.network.predict(input) as number[][])[0];
            const resultNormalized = np.round(softmax(result), 5) as number[];
            resolve(resultNormalized);
          }, 300);
          return p;
        };
      }),
    );
  }
}
