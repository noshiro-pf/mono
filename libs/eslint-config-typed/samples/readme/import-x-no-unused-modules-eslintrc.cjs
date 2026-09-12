/* eslint-disable import-x/unambiguous -- a CommonJS config file is a script by design */
/* eslint-disable functional/immutable-data -- `module.exports =` is how a CommonJS config exports */
// embed-sample-code-ignore-above
// .eslintrc.cjs
module.exports = {
  ignorePatterns: ['**/node_modules/**', 'dist', '.eslintrc.cjs'],
};
