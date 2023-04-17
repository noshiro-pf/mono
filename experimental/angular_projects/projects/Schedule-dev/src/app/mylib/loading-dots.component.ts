import { Component, OnInit } from '@angular/core';
import { RN, interval } from 'rnjs';
import { utils } from './utilities';

const dotsLength = 5;
const timeInterval = 400;

@Component({
  selector: 'app-loading-dots',
  template: ` <div>Loading{{ dots$ | async }}</div> `,
  styles: [],
})
export class LoadingDotsComponent implements OnInit {
  readonly dots$: RN<string> = interval(timeInterval, true).map((i) =>
    utils.array.new((i % dotsLength) + 1, '.').join('')
  );

  constructor() {}

  ngOnInit() {}
}
