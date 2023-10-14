import { Subscriber } from './subscriber';
import { RNodeDepth } from './types/RNodeDepth';
import { RNodeState } from './types/RNodeState';

export class RNode<T> {
  private _value: T | undefined;
  private index: number | undefined;
  private state: RNodeState;

  // dependency graph
  private parents: RNode<any>[];
  private syncChildren: RNode<any>[];
  private asyncChildren: RNode<any>[];

  private subscribers: Subscriber<T>[];

  protected depth: RNodeDepth = { major: 0, minor: 0 };

  constructor() {
    this.state = 'running';
    this.parents = [];
    this.syncChildren = [];
    this.asyncChildren = [];
    this.subscribers = [];

    console.log(
      this.index,
      this.state,
      this.parents,
      this.syncChildren,
      this.asyncChildren,
      this.subscribers,
    );
  }

  protected increment(): void {
    this.index = this.index === undefined ? 0 : this.index + 1;
  }

  protected get isCompleted() {
    return this.state === 'success' || this.state === 'error';
  }

  protected terminate(): void {}

  protected update(): void {
    // 値の更新
    // subscriberへの通知
  }

  protected fire(): void {
    this.update();
    // asyncChildrenの発火
  }

  get value(): T | undefined {
    return this._value;
  }
}
