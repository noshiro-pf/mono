/* eslint-disable tree-shakable/import-star */
import * as synstate from 'synstate';
// eslint-disable-next-line import-x/no-relative-packages
import { genSynstateReExport } from '../../../../tools/configs/gen-synstate-re-export.mjs';

await genSynstateReExport({
  outFile: 'src/synstate.mts',
  valueExports: Object.keys(synstate),
  excludes: ['createReducer', 'createBooleanState', 'createState'],
});
