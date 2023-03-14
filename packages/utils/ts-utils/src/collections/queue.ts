export type Queue<T> = Readonly<{
  isEmpty: boolean;
  size: number;
  dequeue: () => T | undefined;
  enqueue: (value: T) => void;
}>;

class QueueClass<T> implements Queue<T> {
  readonly #data: T[] = [];
  #mut_size: number = 0;

  get isEmpty(): boolean {
    return this.size === 0;
  }
  get size(): number {
    return this.#mut_size;
  }
  dequeue(): T | undefined {
    this.#mut_size -= 1;

    return this.#data.pop();
  }
  enqueue(value: T): void {
    this.#mut_size += 1;
    this.#data.unshift(value);
  }
}

export const createQueue = <T>(): Queue<T> => new QueueClass<T>();
