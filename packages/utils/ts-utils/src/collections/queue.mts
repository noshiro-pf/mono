import { Uint32, toUint32 } from '../num/index.mjs';

export type Queue<T> = Readonly<{
  isEmpty: boolean;
  size: NumberType.ArraySize;
  dequeue: () => T | undefined;
  enqueue: (value: T) => void;
}>;

class QueueClass<T> implements Queue<T> {
  readonly #data: T[] = [];
  #mut_size: NumberType.ArraySize = toUint32(0);

  get isEmpty(): boolean {
    return this.size === 0;
  }
  get size(): NumberType.ArraySize {
    return this.#mut_size;
  }
  dequeue(): T | undefined {
    this.#mut_size = Uint32.max(0, Uint32.sub(this.#mut_size, 1));

    return this.#data.pop();
  }
  enqueue(value: T): void {
    this.#mut_size = Uint32.add(this.#mut_size, 1);
    this.#data.unshift(value);
  }
}

export const createQueue = <T,>(): Queue<T> => new QueueClass<T>();
