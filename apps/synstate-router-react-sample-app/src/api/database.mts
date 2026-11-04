import { asSafeInt } from 'ts-data-forge';
import type { SafeInt } from 'ts-type-forge';

/** A row of the fake server's table. Only the server reads it. */
export type ProductRow = Readonly<{
  id: SafeInt;
  name: string;
  price: number;
  description: string;
}>;

export const productTable: readonly ProductRow[] = [
  {
    id: asSafeInt(1),
    name: 'Apple',
    price: 120,
    description: 'A crisp red apple.',
  },
  {
    id: asSafeInt(2),
    name: 'Banana',
    price: 80,
    description: 'Ripe and sweet.',
  },
  {
    id: asSafeInt(3),
    name: 'Cherry',
    price: 450,
    description: 'A box of dark cherries.',
  },
  {
    id: asSafeInt(4),
    name: 'Durian',
    price: 2800,
    description: 'Strong in every sense.',
  },
  {
    id: asSafeInt(5),
    name: 'Elderberry',
    price: 600,
    description: 'For syrup and jam.',
  },
  {
    id: asSafeInt(6),
    name: 'Fig',
    price: 300,
    description: 'Fresh figs, two to a pack.',
  },
  {
    id: asSafeInt(7),
    name: 'Grape',
    price: 520,
    description: 'Seedless green grapes.',
  },
] as const;
