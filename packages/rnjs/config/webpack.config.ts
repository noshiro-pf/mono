import * as webpack from 'webpack';

const rules: webpack.RuleSetRule[] = [
  {
    test: /\.ts$/,
    exclude: [/node_modules/],
    use: {
      loader: 'ts-loader',
      options: {
        configFile: `${__dirname}/tsconfig.lib.json`,
      },
    },
  },
];

const config: webpack.Configuration = {
  mode: 'production',
  entry: `${__dirname}/../src/index.ts`,
  output: {
    filename: 'bundle.js',
    path: `${__dirname}/../lib`,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: { rules },
};

export default config;
