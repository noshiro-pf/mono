import * as webpack from 'webpack';
import * as path from 'path';

const rules: webpack.RuleSetRule[] = [
  {
    test: /\.ts$/,
    exclude: [/node_modules/],
    use: {
      loader: 'ts-loader',
      options: {
        configFile: 'tsconfig.lib.json',
      },
    },
  },
];

const config: webpack.Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd() + '/lib'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: { rules },
};

export default config;
