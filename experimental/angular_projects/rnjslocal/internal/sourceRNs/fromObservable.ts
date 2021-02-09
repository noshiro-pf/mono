import { RN } from '../RN';
import { Observable } from 'rxjs';


export const fromObservable = <T>(
    initialValue: T,
    obs: Observable<T>
  ) => new FromObservableRN<T>( initialValue, obs );



class FromObservableRN<T> extends RN<T> {
  private obs: Observable<T>;
  private latestValue: T;

  constructor( initialValue: T, obs: Observable<T> ) {
    super( initialValue, [] );
    this.obs = obs;
    this.latestValue = initialValue;
    this.obs.subscribe(
      value => {
        this.latestValue = value;
        this.fireWith( this.latestValue );
      },
      error => { this.terminate(); throw new Error(error);  },
      () => { this.terminate(); }
    );
  }
}
