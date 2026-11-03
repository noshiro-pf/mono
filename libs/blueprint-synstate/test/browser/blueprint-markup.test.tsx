// Compares each component's markup with Blueprint React's for the same props,
// since the library promises Blueprint's markup so that Blueprint's style
// sheets draw it, and a test written from what its author expected can drift
// from Blueprint unnoticed. `visual-parity.test.tsx` compares how the same
// cases are drawn.
import type { ReactElement } from 'react';
import { render, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { cases, mountBlueprint } from './blueprint-cases.js';

describe('markup', () => {
  test.each(cases)('%s matches Blueprint React', (_name, theirs, ours) => {
    const blueprint = renderBlueprint(theirs.element);

    const synstate = renderSynstate(ours);

    assert.deepStrictEqual(
      synstate,
      theirs.deliberate.reduce<readonly string[]>(
        (lines, adjust) =>
          Arr.generate(function* () {
            for (const line of lines) {
              const adjusted = adjust(line);

              if (adjusted !== undefined) {
                yield adjusted;
              }
            }
          }),
        blueprint,
      ),
    );
  });
});

const indent = (depth: number): string => '  '.repeat(depth);

/** The icon name of `span.bp6-icon.bp6-icon-<name>`, if `element` is one. */
const iconNameOf = (element: Element): string | undefined =>
  element.classList.contains('bp6-icon')
    ? Array.from(element.classList)
        .find(
          (c) =>
            c.startsWith('bp6-icon-') &&
            c !== 'bp6-icon-standard' &&
            c !== 'bp6-icon-large',
        )
        ?.slice('bp6-icon-'.length)
    : undefined;

/**
 * A line per element, indented by depth: the tag, the sorted classes, and the
 * attributes Blueprint's style sheets or assistive technology read.
 * Text, ids and React's own attributes are left out. An attribute that names an
 * id says only whether the element it names is in the tree.
 */
const linesOf = (container: Element): readonly string[] => {
  const lines = (element: Element, depth: number): readonly string[] => {
    const tag = element.tagName.toLowerCase();

    const icon = iconNameOf(element);

    if (icon !== undefined) {
      // Blueprint draws an icon's SVG once its paths have loaded, gives it
      // `bp6-icon-standard` meanwhile, and may leave it to assistive
      // technology. Icons here are drawn at once and always hidden, since each
      // sits on a control whose own label says what it does.
      return [`${indent(depth)}span.bp6-icon.bp6-icon-${icon}`];
    }

    const classes = Array.from(element.classList)
      .toSorted()
      .map((c) => `.${c}`)
      .join('');

    const attributes = Array.from(element.attributes)
      .filter(
        ({ name }) => readAttributes.has(name) || name.startsWith('aria-'),
      )
      .map(({ name, value }) =>
        idReferences.has(name)
          ? `[${name}=${value.split(/\s+/u).every((id) => container.querySelector(`#${CSS.escape(id)}`) !== null) ? '#found' : '#missing'}]`
          : `[${name}=${value}]`,
      )
      .toSorted()
      .join('');

    const line = `${indent(depth)}${tag}${classes}${attributes}` as const;

    return tag === 'svg'
      ? [line]
      : Arr.toUnshifted(line)(
          Array.from(element.children).flatMap((child) =>
            lines(child, depth + 1),
          ),
        );
  };

  return Array.from(container.children).flatMap((child) => lines(child, 0));
};

const readAttributes: ReadonlySet<string> = new Set<string>([
  'disabled',
  'role',
  'tabindex',
  'type',
]);

const idReferences: ReadonlySet<string> = new Set<string>([
  'aria-activedescendant',
  'aria-controls',
  'aria-describedby',
  'aria-labelledby',
  'aria-owns',
]);

/**
 * A container in the document, removed when the test finishes, failed or not,
 * so that a failing case leaves nothing behind for the cases after it.
 */
const attached = (): HTMLDivElement => {
  const container = document.createElement('div');

  document.body.append(container);

  onTestFinished(() => {
    container.remove();
  });

  return container;
};

const renderBlueprint = (element: () => ReactElement): readonly string[] => {
  const container = attached();

  onTestFinished(mountBlueprint(element, container));

  return linesOf(container);
};

const renderSynstate = (app: () => JSX.Element): readonly string[] => {
  const container = attached();

  onTestFinished(render(app, container));

  return linesOf(container);
};
