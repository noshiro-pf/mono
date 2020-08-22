'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var path = tslib_1.__importStar(require('path'));
var webpack_node_externals_1 = tslib_1.__importDefault(
  require('webpack-node-externals')
);
var rules = [
  {
    test: /\.ts$/,
    exclude: [/node_modules/],
    use: {
      loader: 'ts-loader',
      options: {
        configFile: __dirname + '/tsconfig.lib.json',
      },
    },
  },
];
var config = {
  mode: 'production',
  entry: __dirname + '/../src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd() + '/lib'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: { rules: rules },
  target: 'node',
  externals: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    webpack_node_externals_1.default({
      modulesFromFile: true,
    }),
  ],
};
exports.default = config;
