// @ts-check

'use strict';

const {
  webpackConfigSlidesCommonMaker,
} = require('./webpack_config_common_maker');
const { webpackConfigSlidesDevMaker } = require('./webpack_config_dev_maker');
const { webpackConfigSlidesProdMaker } = require('./webpack_config_prod_maker');

module.exports = {
  webpackConfigSlidesCommonMaker,
  webpackConfigSlidesDevMaker,
  webpackConfigSlidesProdMaker,
};
