import { RuleTester } from '@typescript-eslint/rule-tester';
// eslint-disable-next-line import-x/no-relative-packages
import { installModuleParity } from '../../../tools/configs/eslint-rule-module-parity.mjs';
import {
  SHARED_EXPORTS,
  TS_DATA_FORGE_MODULE,
  TS_STD_FORGE_MODULE,
} from '../src/rules/constants.mjs';

// Every rule test also runs with the shared exports imported from the other
// package, and has to give the same verdict and fix.
installModuleParity(RuleTester, {
  from: TS_STD_FORGE_MODULE,
  to: TS_DATA_FORGE_MODULE,
  sharedExports: SHARED_EXPORTS,
});
