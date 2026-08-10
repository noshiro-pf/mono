import { type SmallUint } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Index = SmallUint; // 0 | 1 | 2 | ... | 39
const getItem = <T,>(arr: readonly T[], i: Index) => arr[i];

// embed-sample-code-ignore-below
export { getItem };
export type { Index };
