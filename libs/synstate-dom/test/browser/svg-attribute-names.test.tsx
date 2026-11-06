import { createMountable, render } from 'synstate-dom';
import { isNonNullObject, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-internal-modules -- the list under test is internal: the props are typed by it, and it is not exported
import { svgAttributeNames } from '../../src/internal/index.mjs';

// Every name in `svgAttributeNames`, bound on an element that has the
// attribute, changes what the element reads through its DOM interface (an
// `SVGAnimated*` property) or, for a presentation attribute, its computed style
// (#3447). `setAttribute` on an SVG element is case-sensitive and takes any
// name, so a misspelt name, or one in the wrong case (`viewbox`), is written
// and changes nothing: it fails here. A name added to the list needs a case
// below, which the type of `cases` asks for.
describe('every attribute svgAttributeNames lists', () => {
  test.each(svgAttributeNames)('%s', (name) => {
    const { tag, value, read } = cases[name];

    const unbound = readRendered(tag, {}, read);

    const bound = readRendered(tag, { [name]: value }, read);

    assert.deepStrictEqual(
      unknownToString(bound) === unknownToString(unbound)
        ? [
            `<${tag} ${name}="${value}"> reads ${unknownToString(bound)}, as it does with no ${name}`,
          ]
        : [],
      [],
    );
  });
});

/**
 * Renders `<svg><tag {...props} /></svg>` in the document, so that styles are
 * computed, and reads the `tag` element with `read`. An `svg` tag is rendered on
 * its own.
 */
const readRendered = (
  tag: string,
  props: ReadonlyRecord<string, string>,
  read: Reader,
): unknown => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmount = render(
    () =>
      tag === 'svg'
        ? createMountable('svg', props)
        : createMountable('svg', { children: createMountable(tag, props) }),
    container,
  );

  try {
    const element = container.querySelector(tag);

    if (!(element instanceof SVGElement)) {
      throw new TypeError(`<${tag}> was not rendered as an SVG element`);
    }

    return read(element);
  } finally {
    unmount();

    container.remove();
  }
};

/** A property of `getComputedStyle`, for a presentation attribute. */
const style =
  (name: string): Reader =>
  (element) =>
    element instanceof Element
      ? getComputedStyle(element).getPropertyValue(name)
      : undefined;

/** A property of the element, through its DOM interface. */
const domProperty =
  (...path: readonly string[]): Reader =>
  (element) =>
    path.reduce<unknown>(
      (object, key) =>
        isNonNullObject(object) ? Reflect.get(object, key) : undefined,
      element,
    );

/** Reads the rendered element, which is an `SVGElement`. */
type Reader = (element: unknown) => unknown;

type Case = Readonly<{
  /** An element the attribute applies to. */
  tag: string;
  /** A value that differs from the attribute's default. */
  value: string;
  /** Reads what the attribute changes, without reading the attribute. */
  read: Reader;
}>;

const presentation = (tag: string, value: string, cssName: string): Case =>
  ({
    tag,
    value,
    read: style(cssName),
  }) as const;

const cases: ReadonlyRecord<(typeof svgAttributeNames)[number], Case> = {
  'clip-path': presentation('rect', 'url(#c)', 'clip-path'),
  'clip-rule': presentation('rect', 'evenodd', 'clip-rule'),
  cx: {
    tag: 'circle',
    value: '5',
    read: domProperty('cx', 'baseVal', 'value'),
  },
  cy: {
    tag: 'circle',
    value: '5',
    read: domProperty('cy', 'baseVal', 'value'),
  },
  d: {
    tag: 'path',
    value: 'M0 0 L3 4',
    read: (element) =>
      element instanceof SVGPathElement ? element.getTotalLength() : undefined,
  },
  'dominant-baseline': presentation('text', 'middle', 'dominant-baseline'),
  dx: {
    tag: 'text',
    value: '3',
    read: domProperty('dx', 'baseVal', 'numberOfItems'),
  },
  dy: {
    tag: 'text',
    value: '3',
    read: domProperty('dy', 'baseVal', 'numberOfItems'),
  },
  fill: presentation('rect', 'red', 'fill'),
  'fill-opacity': presentation('rect', '0.5', 'fill-opacity'),
  'fill-rule': presentation('rect', 'evenodd', 'fill-rule'),
  filter: presentation('rect', 'blur(1px)', 'filter'),
  'font-family': presentation('text', 'monospace', 'font-family'),
  'font-size': presentation('text', '31', 'font-size'),
  'font-weight': presentation('text', 'bold', 'font-weight'),
  fx: {
    tag: 'radialGradient',
    value: '0.2',
    read: domProperty('fx', 'baseVal', 'valueAsString'),
  },
  fy: {
    tag: 'radialGradient',
    value: '0.2',
    read: domProperty('fy', 'baseVal', 'valueAsString'),
  },
  gradientTransform: {
    tag: 'linearGradient',
    value: 'rotate(10)',
    read: domProperty('gradientTransform', 'baseVal', 'numberOfItems'),
  },
  gradientUnits: {
    tag: 'linearGradient',
    value: 'userSpaceOnUse',
    read: domProperty('gradientUnits', 'baseVal'),
  },
  height: {
    tag: 'rect',
    value: '5',
    read: domProperty('height', 'baseVal', 'value'),
  },
  href: { tag: 'use', value: '#a', read: domProperty('href', 'baseVal') },
  id: { tag: 'rect', value: 'a', read: domProperty('id') },
  'marker-end': presentation('path', 'url(#m)', 'marker-end'),
  'marker-mid': presentation('path', 'url(#m)', 'marker-mid'),
  'marker-start': presentation('path', 'url(#m)', 'marker-start'),
  markerHeight: {
    tag: 'marker',
    value: '7',
    read: domProperty('markerHeight', 'baseVal', 'value'),
  },
  markerUnits: {
    tag: 'marker',
    value: 'userSpaceOnUse',
    read: domProperty('markerUnits', 'baseVal'),
  },
  markerWidth: {
    tag: 'marker',
    value: '7',
    read: domProperty('markerWidth', 'baseVal', 'value'),
  },
  mask: presentation('rect', 'url(#m)', 'mask'),
  offset: { tag: 'stop', value: '0.5', read: domProperty('offset', 'baseVal') },
  opacity: presentation('rect', '0.5', 'opacity'),
  orient: {
    tag: 'marker',
    value: 'auto',
    read: domProperty('orientType', 'baseVal'),
  },
  pathLength: {
    tag: 'path',
    value: '10',
    read: domProperty('pathLength', 'baseVal'),
  },
  patternUnits: {
    tag: 'pattern',
    value: 'userSpaceOnUse',
    read: domProperty('patternUnits', 'baseVal'),
  },
  points: {
    tag: 'polygon',
    value: '0,0 1,1 2,0',
    read: domProperty('points', 'numberOfItems'),
  },
  preserveAspectRatio: {
    tag: 'svg',
    value: 'none',
    read: domProperty('preserveAspectRatio', 'baseVal', 'align'),
  },
  r: { tag: 'circle', value: '5', read: domProperty('r', 'baseVal', 'value') },
  refX: {
    tag: 'marker',
    value: '3',
    read: domProperty('refX', 'baseVal', 'value'),
  },
  refY: {
    tag: 'marker',
    value: '3',
    read: domProperty('refY', 'baseVal', 'value'),
  },
  role: { tag: 'rect', value: 'img', read: domProperty('role') },
  rx: { tag: 'rect', value: '2', read: domProperty('rx', 'baseVal', 'value') },
  ry: { tag: 'rect', value: '2', read: domProperty('ry', 'baseVal', 'value') },
  'stop-color': presentation('stop', 'red', 'stop-color'),
  'stop-opacity': presentation('stop', '0.5', 'stop-opacity'),
  stroke: presentation('rect', 'red', 'stroke'),
  'stroke-dasharray': presentation('rect', '1 2', 'stroke-dasharray'),
  'stroke-dashoffset': presentation('rect', '3', 'stroke-dashoffset'),
  'stroke-linecap': presentation('rect', 'round', 'stroke-linecap'),
  'stroke-linejoin': presentation('rect', 'round', 'stroke-linejoin'),
  'stroke-opacity': presentation('rect', '0.5', 'stroke-opacity'),
  'stroke-width': presentation('rect', '3', 'stroke-width'),
  tabindex: { tag: 'rect', value: '0', read: domProperty('tabIndex') },
  'text-anchor': presentation('text', 'middle', 'text-anchor'),
  transform: {
    tag: 'rect',
    value: 'rotate(10)',
    read: domProperty('transform', 'baseVal', 'numberOfItems'),
  },
  viewBox: {
    tag: 'svg',
    value: '0 0 10 10',
    read: domProperty('viewBox', 'baseVal', 'width'),
  },
  visibility: presentation('rect', 'hidden', 'visibility'),
  width: {
    tag: 'rect',
    value: '5',
    read: domProperty('width', 'baseVal', 'value'),
  },
  x: { tag: 'rect', value: '5', read: domProperty('x', 'baseVal', 'value') },
  x1: { tag: 'line', value: '5', read: domProperty('x1', 'baseVal', 'value') },
  x2: { tag: 'line', value: '5', read: domProperty('x2', 'baseVal', 'value') },
  y: { tag: 'rect', value: '5', read: domProperty('y', 'baseVal', 'value') },
  y1: { tag: 'line', value: '5', read: domProperty('y1', 'baseVal', 'value') },
  y2: { tag: 'line', value: '5', read: domProperty('y2', 'baseVal', 'value') },
} as const;
