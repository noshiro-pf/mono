export type Queue<T> = Readonly<{
  isEmpty: boolean;
  size: number;
  dequeue: () => T | undefined;
  enqueue: (value: T) => void;
}>;

class QueueClass<T> implements Queue<T> {
  readonly #data: T[] = [];
  #size: number = 0;

  get isEmpty(): boolean {
    return this.size === 0;
  }
  get size(): number {
    return this.#size;
  }
  dequeue(): T | undefined {
    this.#size -= 1;

    return this.#data.pop();
  }
  enqueue(value: T): void {
    this.#size += 1;
    this.#data.unshift(value);
  }
}

export const createQueue = <T>(): Queue<T> => new QueueClass<T>();
