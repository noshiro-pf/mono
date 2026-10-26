import {
  SegmentedControl,
  type SegmentedControlOption,
} from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { themeStore, type ThemeSetting } from '../../store/index.mjs';

/** ライト・ダーク・システム設定に合わせる、の切り替え。この端末にだけ保存する。 */
export const ThemeControl = (): JSX.Element => (
  <SegmentedControl
    aria-label={constant('テーマ')}
    data-e2e={constant('theme')}
    size={'small'}
    options={options}
    value={themeStore.setting}
    onValueChange={themeStore.setSetting}
  />
);

const options = [
  { value: 'light', label: 'ライト', icon: 'flash', 'data-e2e': 'theme-light' },
  { value: 'dark', label: 'ダーク', icon: 'moon', 'data-e2e': 'theme-dark' },
  {
    value: 'system',
    label: 'システム設定に合わせる',
    icon: 'desktop',
    'data-e2e': 'theme-system',
  },
] as const satisfies readonly SegmentedControlOption<ThemeSetting>[];
