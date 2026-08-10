import { type MutableJsonObject } from 'ts-type-forge';

// embed-sample-code-ignore-above

const builder: MutableJsonObject = {} as const;
builder['timestamp'] = Date.now();
builder['data'] = { message: 'Hello' };
builder['tags'] = ['info', 'user-action'];

// All modifications are allowed
builder['data'] = { message: 'Updated' }; // ✓ valid

// embed-sample-code-ignore-below
export { builder };
