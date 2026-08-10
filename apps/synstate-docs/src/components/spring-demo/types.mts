import { type SafeUint } from 'ts-type-forge';

export type Point = Readonly<{ x: number; y: number }>;

export type SpringAdapterCallbacks = Readonly<{
  onEmit: (points: readonly Point[]) => void;
}>;

export type SpringAdapter = Readonly<{
  name: string;
  setup: (chainDepth: SafeUint, callbacks: SpringAdapterCallbacks) => void;
  onMouseMove: (pos: Point) => void;
  cleanup: () => void;
}>;

export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;
