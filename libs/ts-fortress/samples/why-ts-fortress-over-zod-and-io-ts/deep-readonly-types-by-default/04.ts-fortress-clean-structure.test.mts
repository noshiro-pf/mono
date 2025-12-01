/* eslint-disable import-x/first */

const invalidData = {
  user: {
    profile: {
      age: 'not-a-number', // should be number
    },
  },
};

// embed-sample-code-ignore-above

import * as tf from 'ts-fortress';

// ts-fortress equivalent clean structure
const TsFortressNestedType = tf.record({
  user: tf.record({
    profile: tf.record({
      age: tf.number(),
    }),
  }),
});

// Get ts-fortress error messages
const tsFortressResult = TsFortressNestedType.validate(invalidData);

const tsFortressErrorMessages = tf.Result.isErr(tsFortressResult)
  ? tf.validationErrorsToMessages(tsFortressResult.value)
  : [];

assert.strictEqual(
  tsFortressErrorMessages[0],
  `Error at user.profile.age: expected <number> value but <string> type value "not-a-number" was passed.`,
);
