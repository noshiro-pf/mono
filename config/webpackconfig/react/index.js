// @ts-check

'use strict';

const {
  pluginsCommon,
  webpackConfigReactCommonMaker,
} = require('./webpack_config_common_maker');
const { webpackConfigReactDevMaker } = require('./webpack_config_dev_maker');
const { webpackConfigReactProdMaker } = require('./webpack_config_prod_maker');

module.exports = {
  pluginsCommon,
  webpackConfigReactCommonMaker,
  webpackConfigReactDevMaker,
  webpackConfigReactProdMaker,
};
