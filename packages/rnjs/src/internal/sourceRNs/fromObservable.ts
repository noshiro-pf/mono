import { RN } from '../RN';
import { Subscribable } from '../types/Subscribable';

export const fromObservable = <T>(
  initialValue: T,
  obs: Subscribable<T>,
  name: string = ''
): FromObservableRN<T> => new FromObservableRN<T>(initialValue, obs, name);

class FromObservableRN<T> extends RN<T> {
  private obs: Subscribable<T>;
  private latestValue: T;

  constructor(initialValue: T, obs: Subscribable<T>, name: string = '') {
    super(initialValue, [], name);
    this.obs = obs;
    this.latestValue = initialValue;
    this.obs.subscribe(
      (value) => {
        this.latestValue = value;
        this.fireWith(this.latestValue);
      },
      (error) => {
        this.terminate();
        throw new Error(error);
      },
      () => {
        this.terminate();
      }
    );
  }
}
