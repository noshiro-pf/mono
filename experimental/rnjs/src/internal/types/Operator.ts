import { RN } from '../RN';

export type Operator<S, T> = (src: RN<S>) => RN<T>;
