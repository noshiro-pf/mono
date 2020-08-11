"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackConfigProdMaker = void 0;
var tslib_1 = require("tslib");
var compression_webpack_plugin_1 = tslib_1.__importDefault(require("compression-webpack-plugin"));
var terser_webpack_plugin_1 = tslib_1.__importDefault(require("terser-webpack-plugin"));
var webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
require("webpack-dev-server");
var webpack_merge_1 = require("webpack-merge");
var webpack_config_common_maker_1 = require("./webpack_config_common_maker");
var plugins = tslib_1.__spread(webpack_config_common_maker_1.pluginsCommon, [
    new compression_webpack_plugin_1.default({
        test: /\.(css)|(js)$/,
        compressionOptions: {
            level: 9,
        },
    }),
]);
exports.webpackConfigProdMaker = function (paths, bundlejsName, use_bundle_analyzer) {
    if (use_bundle_analyzer === void 0) { use_bundle_analyzer = false; }
    return webpack_merge_1.merge(webpack_config_common_maker_1.webpackConfigCommonMaker(paths.tsconfigJson), {
        mode: 'production',
        entry: [paths.appIndexJs],
        output: {
            path: paths.appBuild,
            publicPath: paths.publicUrlOrPath,
            filename: bundlejsName,
        },
        optimization: {
            minimize: true,
            minimizer: [
                new terser_webpack_plugin_1.default({
                    extractComments: 'all',
                    terserOptions: {
                        compress: {
                            drop_console: true,
                        },
                    },
                }),
            ],
        },
        devtool: 'source-map',
        plugins: use_bundle_analyzer
            ? tslib_1.__spread(plugins, [new webpack_bundle_analyzer_1.BundleAnalyzerPlugin()]) : plugins,
    });
};
