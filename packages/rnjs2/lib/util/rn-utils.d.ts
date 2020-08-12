import { RN } from '../abstract_class';
import { Subscriber } from '../types';
import { Some } from './utils';
export declare const monoParentTryUpdate: <A>(parent: RN<A>) => Some<A> | "skipped";
export declare const unifySubscriberType: <A>(nextOrSubscriber: Subscriber<A> | ((v: A) => void), error?: ((e?: any) => void) | undefined, complete?: (() => void) | undefined) => Subscriber<A>;
//# sourceMappingURL=rn-utils.d.ts.map