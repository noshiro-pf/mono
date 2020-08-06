import { Operator, RNType, Subscriber, Subscription } from '../types';
import { IdType, Option } from '../util';
import { RN } from './rn-interface';
export declare abstract class RNClass<A> implements RN<A> {
    /** @internal */
    readonly type: RNType;
    /** @internal */
    readonly id: IdType;
    /** @internal */
    readonly isUpdateManager: boolean;
    /** @internal */
    readonly depth: number;
    /** @internal */
    readonly parents: RN<any>[];
    /** @internal */
    isUpdated: boolean;
    private _currentValue;
    private _subscribers;
    protected _children: RN<any>[];
    protected _descendantsIdSet: Set<IdType>;
    private _isCompleted;
    constructor(type: RNType, isSourceRN: boolean, depth: number, parents: RN<any>[], currentValueInit: Option<A>, isUpdatedInit: boolean);
    get currentValue(): Option<A>;
    get children(): readonly RN<any>[];
    get descendantsIds(): readonly IdType[];
    get isCompleted(): boolean;
    /** @internal */
    addChild(child: RN<any>): void;
    protected registerThis(): void;
    /** @internal */
    addDescendant(rn: Readonly<RN<any>>): void;
    protected complete(): void;
    tryComplete(): void;
    /** @internal */
    subscribe(nextOrSubscriber: ((v: A) => void) | Subscriber<A>, error?: (e?: any) => void, complete?: () => void): Subscription;
    protected update(nextValue: A): void;
    protected tryUpdateAndSetFlag(tryUpdateBodyFn: () => boolean): void;
    /** @internal */
    tryUpdate(nextValue?: A): void;
    pipe(...operators: readonly [Operator<any, any>, ...Operator<any, any>[]]): RN<any>;
    private addSubscriber;
    private removeSubscriber;
}
//# sourceMappingURL=rn.d.ts.map