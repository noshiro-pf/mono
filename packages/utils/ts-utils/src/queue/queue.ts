export class Queue<T> {
  private readonly _data: T[] = [];
  private _size: number = 0;

  get isEmpty(): boolean {
    return this.size === 0;
  }
  get size(): number {
    return this._size;
  }
  dequeue(): T | undefined {
    this._size -= 1;

    return this._data.pop();
  }
  enqueue(value: T): void {
    this._size += 1;
    this._data.unshift(value);
  }
}

export const createQueue = <T>(): Queue<T> => new Queue<T>();
