import { createState } from 'synstate';

// The state creators return tuples now, not objects.
export const [myName$, setMyName] = createState<string | undefined>(undefined);
