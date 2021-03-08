import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ValuesForViewService {
  private gainCardStateSource = new BehaviorSubject<boolean>(false);
  gainCardState$: Observable<boolean> = this.gainCardStateSource.asObservable();

  constructor() {}

  setGainCardState(value: boolean) {
    this.gainCardStateSource.next(value);
  }
}
