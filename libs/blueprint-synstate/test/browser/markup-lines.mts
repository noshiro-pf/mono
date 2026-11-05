// cspell:ignore describedby labelledby
// The markup a test compares with Blueprint React's: one line per element.
import { Arr } from 'ts-data-forge';

/**
 * A line per element, indented by depth: the tag, the sorted classes, and the
 * attributes Blueprint's style sheets or assistive technology read.
 * Text, ids and React's own attributes are left out. An attribute that names an
 * id says only whether the element it names is in the tree.
 */
export const linesOf = (container: Element): readonly string[] => {
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
