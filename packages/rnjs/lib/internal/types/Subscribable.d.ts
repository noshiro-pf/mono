import { Subscription } from './Subscription';
export declare type Subscribable<A> = {
    subscribe(next: (v: A) => void, error?: (e?: any) => void, complete?: () => void): Subscription;
};
//# sourceMappingURL=Subscribable.d.ts.map