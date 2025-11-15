// Example: src/guard/key-is-in.mts (keyIsIn)
import { keyIsIn } from 'ts-data-forge';

// embed-sample-code-ignore-above
const user = { id: 1, name: 'Ada' } as const;

const maybeKey: string = 'name';

if (keyIsIn(maybeKey, user)) {
  assert(user[maybeKey] === 'Ada');
} else {
  assert.fail('Expected a known key.');
}
