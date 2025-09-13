import { $, Result } from 'ts-repo-utils';

// or
// import "ts-repo-utils"; // $ and Result are globally defined in ts-repo-utils

const result = await $('npm test');

if (Result.isOk(result)) {
  console.log('Tests passed:', result.value.stdout);
} else {
  console.error('Tests failed:', result.value.message);
}
