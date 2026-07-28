import { type MutableJsonValue } from 'ts-type-forge';

// embed-sample-code-ignore-above

const apiPayload: MutableJsonValue = {
  user: {
    name: 'John Doe',
    age: 30,
    preferences: ['dark-mode', 'notifications'],
  },
};

// Can modify the structure
const updateAge = (payload: MutableJsonValue): void => {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return;
  }
  const user = payload['user'];
  if (typeof user === 'object' && user !== null && !Array.isArray(user)) {
    user['age'] = 31; // Update age
  }
};

updateAge(apiPayload);

// embed-sample-code-ignore-below
export { apiPayload, updateAge };
