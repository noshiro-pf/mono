import { type MutableSet } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TagSet = MutableSet<string>;
const tags: TagSet = new Set(['typescript', 'javascript', 'react']);
tags.add('vue'); // ✓ allowed - set is mutable
tags.delete('react'); // ✓ allowed

// embed-sample-code-ignore-below
export { tags };
export type { TagSet };
