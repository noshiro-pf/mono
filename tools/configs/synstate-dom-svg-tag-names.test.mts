// The source files, not the packages: each package exports only its `dist/`,
// and neither exports these modules, which are internal to it.
// eslint-disable-next-line import-x/no-relative-packages
import { svgTagNames as eslintConfigTypedSvgTagNames } from '../../libs/eslint-config-typed/src/constants/svg-tag-names.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { svgTagNames } from '../../libs/synstate-dom/src/internal/dom-tables.mjs';

const sorted = (names: Iterable<string>): readonly string[] =>
  Array.from(names).toSorted((a, b) => a.localeCompare(b));

// eslint-config-typed keeps a copy of synstate-dom's SVG tags for
// `synstate-dom-a11y/prefer-tag-over-role`, because synstate-dom lints with
// eslint-config-typed and the package cannot depend on it in turn.
test("eslint-config-typed's SVG tags are synstate-dom's", () => {
  assert.deepStrictEqual(
    sorted(eslintConfigTypedSvgTagNames),
    sorted(svgTagNames),
  );
});
