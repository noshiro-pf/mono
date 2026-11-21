// The source files, not the packages: each package exports only its `dist/`,
// and neither exports these modules, which are internal to it.
// eslint-disable-next-line import-x/no-relative-packages
import { svgTagNames as eslintPluginSvgTagNames } from '../../libs/eslint-plugin-synstate-dom-a11y/src/svg-tag-names.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { svgTagNames } from '../../libs/synstate-dom/src/bind/dom-tables.mjs';

const sorted = (names: Iterable<string>): readonly string[] =>
  Array.from(names).toSorted((a, b) => a.localeCompare(b));

// eslint-plugin-synstate-dom-a11y keeps a copy of synstate-dom's SVG tags for
// `synstate-dom-a11y/prefer-tag-over-role`, because synstate-dom lints with
// eslint-config-typed, which depends on the plugin, and the plugin cannot depend
// on synstate-dom in turn.
test("eslint-plugin-synstate-dom-a11y's SVG tags are synstate-dom's", () => {
  assert.deepStrictEqual(sorted(eslintPluginSvgTagNames), sorted(svgTagNames));
});
