"use strict";
exports.__esModule = true;
var rules = [
    {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: {
            loader: 'ts-loader',
            options: {
                configFile: __dirname + "/tsconfig.lib.json"
            }
        }
    },
];
var config = {
    mode: 'production',
    entry: __dirname + "/../src/index.ts",
    output: {
        filename: 'bundle.js',
        path: __dirname + "/../lib"
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: { rules: rules }
};
exports["default"] = config;
