import { render } from 'synstate-dom-next';
import { jsx as createElement } from 'synstate-dom-next/jsx-runtime';
import { isNonNullObject, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-internal-modules -- the list under test is internal: the props are typed by it, and it is not exported
import { svgAttributeNames } from '../../../src/bind/index.mjs';

// Ported from synstate-dom's `svg-attribute-names` (#3643), for this package's
// longer list. Every name in `svgAttributeNames`, bound on an element that has
// the attribute, changes what the element reads through its DOM interface (an
// `SVGAnimated*` property), its computed style for a presentation attribute,
// or, for an animation attribute, the value the animation gives its target.
// `setAttribute` on an SVG element is case-sensitive and takes any name, so a
// misspelt name, or one in the wrong case (`viewbox`), is written and changes
// nothing: it fails here. A name added to the list needs a case below, which
// the type of `cases` asks for.
describe('every attribute svgAttributeNames lists', () => {
  test.each(svgAttributeNames)('%s', (name) => {
    const theCase = cases[name];

    const { tag, value, chromium, base = {} } = theCase;

    if (chromium === 'unsupported') {
      // Fails once Chromium implements it: then it gets a case.
      assert.isUndefined(readRendered(theCase, { [name]: value }));

      return;
    }

    const unbound = readRendered(theCase, base);

    const bound = readRendered(theCase, { ...base, [name]: value });

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
 * Renders `<svg><parent><tag {...props} /></parent></svg>` in the document (no
 * `parent` when the case names none), so that styles are computed, and reads
 * the `tag` element with the case's `read`. An `svg` tag is rendered on its
 * own.
 */
const readRendered = (
  { tag, parent, read }: Case,
  props: ReadonlyRecord<string, string>,
): unknown => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmount = render(() => {
    if (tag === 'svg') {
      return createElement('svg', props);
    }

    const element = createElement(tag, props);

    return createElement('svg', {
      children:
        parent === undefined
          ? element
          : createElement(parent, { children: element }),
    });
  }, container);

  try {
    const rendered = container.querySelector(tag);

    if (!(rendered instanceof SVGElement)) {
      throw new TypeError(`<${tag}> was not rendered as an SVG element`);
    }

    return read(rendered);
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

/**
 * The value an `<animate>` gives the `x` of the `<svg>` it is in, at `seconds`
 * into the document's timeline, with the timeline paused there. `before` is
 * applied first: an `x` given to the `<svg>`, or a restart of the `<animate>` at
 * a time.
 */
const animatedX =
  (seconds: number, before?: Before): Reader =>
  (element) => {
    const svg = element instanceof SVGElement ? element.ownerSVGElement : null;

    if (svg === null) {
      return undefined;
    }

    svg.pauseAnimations();

    if (before?.svgX !== undefined) {
      svg.setAttribute('x', before.svgX);
    }

    if (before?.restartAt !== undefined) {
      svg.setCurrentTime(before.restartAt);

      if (element instanceof SVGAnimationElement) {
        element.beginElement();
      }
    }

    svg.setCurrentTime(seconds);

    return svg.x.animVal.value;
  };

/**
 * Where an `<animateMotion>` has moved the `<rect>` it is in, at `seconds` into
 * the paused timeline: the horizontal translation of the rect's matrix.
 */
const motionX =
  (seconds: number): Reader =>
  (element) => {
    if (!(element instanceof SVGElement)) {
      return undefined;
    }

    const svg = element.ownerSVGElement;

    const target = element.parentElement;

    if (svg === null || !(target instanceof SVGGraphicsElement)) {
      return undefined;
    }

    svg.pauseAnimations();

    svg.setCurrentTime(seconds);

    return target.getCTM()?.e;
  };

/** Reads the rendered element. */
type Reader = (element: unknown) => unknown;

/** What `animatedX` does before it reads. */
type Before = Readonly<{ svgX?: string; restartAt?: number }>;

type Case = Readonly<{
  /** An element the attribute applies to. */
  tag: string;
  /** The element `tag` is rendered in, inside the `<svg>`. */
  parent?: string;
  /** The other attributes the case needs, set with and without the name. */
  base?: ReadonlyRecord<string, string>;
  /** A value that differs from the attribute's default. */
  value: string;
  /** Reads what the attribute changes, without reading the attribute. */
  read: Reader;
  /**
   * An attribute Chromium does not implement, which the tests run in: SVG 2's
   * `side`, which Firefox draws. The case checks that it is still missing, so
   * that it is tested once Chromium has it.
   */
  chromium?: 'unsupported';
}>;

const presentation = (tag: string, value: string, cssName: string): Case =>
  ({
    tag,
    value,
    read: style(cssName),
  }) as const;

/** A property of an element, as `domProperty` reads it. */
const property = (
  tag: string,
  value: string,
  ...path: readonly string[]
): Case => ({ tag, value, read: domProperty(...path) }) as const;

/** An `<animate>` of the `<svg>`'s `x`, read at `seconds`. */
const animate = (
  base: ReadonlyRecord<string, string>,
  value: string,
  seconds: number,
  before?: Before,
): Case =>
  ({
    tag: 'animate',
    base,
    value,
    read: animatedX(seconds, before),
  }) as const;

/** An `<animateMotion>` of a `<rect>`, read at `seconds`. */
const motion = (
  base: ReadonlyRecord<string, string>,
  value: string,
  seconds: number,
): Case =>
  ({
    tag: 'animateMotion',
    parent: 'rect',
    base,
    value,
    read: motionX(seconds),
  }) as const;

/** `x` from 0 to 10 over 10 s: 5 at 5 s. */
const xOverTenSeconds = {
  attributeName: 'x',
  from: '0',
  to: '10',
  dur: '10s',
} as const;

const cases: ReadonlyRecord<(typeof svgAttributeNames)[number], Case> = {
  accumulate: animate(
    { attributeName: 'x', from: '0', to: '10', dur: '2s', repeatCount: '3' },
    'sum',
    5,
  ),
  'alignment-baseline': presentation('text', 'middle', 'alignment-baseline'),
  additive: animate(xOverTenSeconds, 'sum', 5, { svgX: '100' }),
  amplitude: property('feFuncR', '2', 'amplitude', 'baseVal'),
  attributeName: animate({ from: '0', to: '10', dur: '10s' }, 'x', 5),
  azimuth: property('feDistantLight', '30', 'azimuth', 'baseVal'),
  'baseline-shift': presentation('text', 'super', 'baseline-shift'),
  baseFrequency: property('feTurbulence', '0.5', 'baseFrequencyX', 'baseVal'),
  begin: animate(xOverTenSeconds, '4s', 5),
  bias: property('feConvolveMatrix', '1', 'bias', 'baseVal'),
  by: animate({ attributeName: 'x', from: '0', dur: '10s' }, '10', 5),
  calcMode: animate(
    { attributeName: 'x', values: '0;10', dur: '10s' },
    'discrete',
    4,
  ),
  'clip-path': presentation('rect', 'url(#c)', 'clip-path'),
  'clip-rule': presentation('rect', 'evenodd', 'clip-rule'),
  clipPathUnits: property(
    'clipPath',
    'objectBoundingBox',
    'clipPathUnits',
    'baseVal',
  ),
  color: presentation('rect', 'red', 'color'),
  'color-interpolation-filters': presentation(
    'rect',
    'sRGB',
    'color-interpolation-filters',
  ),
  cursor: presentation('rect', 'pointer', 'cursor'),
  cx: property('circle', '5', 'cx', 'baseVal', 'value'),
  cy: property('circle', '5', 'cy', 'baseVal', 'value'),
  d: {
    tag: 'path',
    value: 'M0 0 L3 4',
    read: (element) =>
      element instanceof SVGPathElement ? element.getTotalLength() : undefined,
  },
  diffuseConstant: property(
    'feDiffuseLighting',
    '2',
    'diffuseConstant',
    'baseVal',
  ),
  display: presentation('rect', 'none', 'display'),
  divisor: property('feConvolveMatrix', '3', 'divisor', 'baseVal'),
  'dominant-baseline': presentation('text', 'middle', 'dominant-baseline'),
  dur: animate({ attributeName: 'x', from: '0', to: '10' }, '10s', 5),
  dx: property('text', '3', 'dx', 'baseVal', 'numberOfItems'),
  dy: property('text', '3', 'dy', 'baseVal', 'numberOfItems'),
  edgeMode: property('feConvolveMatrix', 'wrap', 'edgeMode', 'baseVal'),
  elevation: property('feDistantLight', '30', 'elevation', 'baseVal'),
  end: animate(xOverTenSeconds, '2s', 5),
  exponent: property('feFuncR', '2', 'exponent', 'baseVal'),
  fill: presentation('rect', 'red', 'fill'),
  'fill-opacity': presentation('rect', '0.5', 'fill-opacity'),
  'fill-rule': presentation('rect', 'evenodd', 'fill-rule'),
  filter: presentation('rect', 'blur(1px)', 'filter'),
  filterUnits: property('filter', 'userSpaceOnUse', 'filterUnits', 'baseVal'),
  'flood-color': presentation('feFlood', 'red', 'flood-color'),
  'flood-opacity': presentation('feFlood', '0.5', 'flood-opacity'),
  'font-family': presentation('text', 'monospace', 'font-family'),
  'font-size': presentation('text', '31', 'font-size'),
  'font-style': presentation('text', 'italic', 'font-style'),
  'font-weight': presentation('text', 'bold', 'font-weight'),
  fr: property('radialGradient', '0.2', 'fr', 'baseVal', 'valueAsString'),
  from: animate({ attributeName: 'x', to: '10', dur: '10s' }, '10', 5),
  fx: property('radialGradient', '0.2', 'fx', 'baseVal', 'valueAsString'),
  fy: property('radialGradient', '0.2', 'fy', 'baseVal', 'valueAsString'),
  gradientTransform: property(
    'linearGradient',
    'rotate(10)',
    'gradientTransform',
    'baseVal',
    'numberOfItems',
  ),
  gradientUnits: property(
    'linearGradient',
    'userSpaceOnUse',
    'gradientUnits',
    'baseVal',
  ),
  height: property('rect', '5', 'height', 'baseVal', 'value'),
  href: property('use', '#a', 'href', 'baseVal'),
  id: property('rect', 'a', 'id'),
  in: property('feBlend', 'SourceAlpha', 'in1', 'baseVal'),
  in2: property('feBlend', 'SourceAlpha', 'in2', 'baseVal'),
  intercept: property('feFuncR', '1', 'intercept', 'baseVal'),
  k1: property('feComposite', '1', 'k1', 'baseVal'),
  k2: property('feComposite', '1', 'k2', 'baseVal'),
  k3: property('feComposite', '1', 'k3', 'baseVal'),
  k4: property('feComposite', '1', 'k4', 'baseVal'),
  kernelMatrix: property(
    'feConvolveMatrix',
    '1 0 0 0 1 0 0 0 1',
    'kernelMatrix',
    'baseVal',
    'numberOfItems',
  ),
  kernelUnitLength: property(
    'feConvolveMatrix',
    '2',
    'kernelUnitLengthX',
    'baseVal',
  ),
  keyPoints: motion(
    { path: 'M0 0 L10 0', dur: '10s', keyTimes: '0;1', calcMode: 'linear' },
    '0;0.2',
    5,
  ),
  keySplines: animate(
    {
      attributeName: 'x',
      values: '0;10',
      keyTimes: '0;1',
      calcMode: 'spline',
      dur: '10s',
    },
    '1 0 1 0',
    5,
  ),
  keyTimes: animate(
    { attributeName: 'x', values: '0;5;10', dur: '10s' },
    '0;0.9;1',
    5,
  ),
  lengthAdjust: property('text', 'spacingAndGlyphs', 'lengthAdjust', 'baseVal'),
  'letter-spacing': presentation('text', '3px', 'letter-spacing'),
  'lighting-color': presentation('feDiffuseLighting', 'red', 'lighting-color'),
  limitingConeAngle: property(
    'feSpotLight',
    '30',
    'limitingConeAngle',
    'baseVal',
  ),
  'marker-end': presentation('path', 'url(#m)', 'marker-end'),
  'marker-mid': presentation('path', 'url(#m)', 'marker-mid'),
  'marker-start': presentation('path', 'url(#m)', 'marker-start'),
  markerHeight: property('marker', '7', 'markerHeight', 'baseVal', 'value'),
  markerUnits: property('marker', 'userSpaceOnUse', 'markerUnits', 'baseVal'),
  markerWidth: property('marker', '7', 'markerWidth', 'baseVal', 'value'),
  mask: presentation('rect', 'url(#m)', 'mask'),
  maskContentUnits: property(
    'mask',
    'objectBoundingBox',
    'maskContentUnits',
    'baseVal',
  ),
  maskUnits: property('mask', 'userSpaceOnUse', 'maskUnits', 'baseVal'),
  max: animate(xOverTenSeconds, '2s', 5),
  method: property('textPath', 'stretch', 'method', 'baseVal'),
  min: animate(
    {
      attributeName: 'x',
      from: '0',
      to: '10',
      dur: '2s',
      repeatCount: 'indefinite',
      end: '1s',
    },
    '6s',
    5,
  ),
  mode: property('feBlend', 'multiply', 'mode', 'baseVal'),
  numOctaves: property('feTurbulence', '3', 'numOctaves', 'baseVal'),
  offset: property('stop', '0.5', 'offset', 'baseVal'),
  opacity: presentation('rect', '0.5', 'opacity'),
  operator: property('feComposite', 'xor', 'operator', 'baseVal'),
  order: property('feConvolveMatrix', '5', 'orderX', 'baseVal'),
  orient: property('marker', 'auto', 'orientType', 'baseVal'),
  overflow: presentation('rect', 'hidden', 'overflow'),
  'paint-order': presentation('rect', 'stroke', 'paint-order'),
  path: motion({ dur: '10s' }, 'M0 0 L10 0', 5),
  pathLength: property('path', '10', 'pathLength', 'baseVal'),
  patternContentUnits: property(
    'pattern',
    'objectBoundingBox',
    'patternContentUnits',
    'baseVal',
  ),
  patternTransform: property(
    'pattern',
    'rotate(10)',
    'patternTransform',
    'baseVal',
    'numberOfItems',
  ),
  patternUnits: property(
    'pattern',
    'userSpaceOnUse',
    'patternUnits',
    'baseVal',
  ),
  'pointer-events': presentation('rect', 'none', 'pointer-events'),
  points: property('polygon', '0,0 1,1 2,0', 'points', 'numberOfItems'),
  pointsAtX: property('feSpotLight', '3', 'pointsAtX', 'baseVal'),
  pointsAtY: property('feSpotLight', '3', 'pointsAtY', 'baseVal'),
  pointsAtZ: property('feSpotLight', '3', 'pointsAtZ', 'baseVal'),
  preserveAlpha: property(
    'feConvolveMatrix',
    'true',
    'preserveAlpha',
    'baseVal',
  ),
  preserveAspectRatio: property(
    'svg',
    'none',
    'preserveAspectRatio',
    'baseVal',
    'align',
  ),
  primitiveUnits: property(
    'filter',
    'objectBoundingBox',
    'primitiveUnits',
    'baseVal',
  ),
  r: property('circle', '5', 'r', 'baseVal', 'value'),
  radius: property('feMorphology', '2', 'radiusX', 'baseVal'),
  refX: property('marker', '3', 'refX', 'baseVal', 'value'),
  refY: property('marker', '3', 'refY', 'baseVal', 'value'),
  repeatCount: animate(
    { attributeName: 'x', from: '0', to: '10', dur: '2s' },
    '3',
    5,
  ),
  repeatDur: animate(
    { attributeName: 'x', from: '0', to: '10', dur: '2s' },
    '6s',
    5,
  ),
  // Restarted at 5 s, unless `restart` forbids it.
  restart: animate(xOverTenSeconds, 'never', 5, { restartAt: 5 }),
  result: property('feBlend', 'r', 'result', 'baseVal'),
  role: property('rect', 'img', 'role'),
  rotate: property('text', '30', 'rotate', 'baseVal', 'numberOfItems'),
  rx: property('rect', '2', 'rx', 'baseVal', 'value'),
  ry: property('rect', '2', 'ry', 'baseVal', 'value'),
  scale: property('feDisplacementMap', '2', 'scale', 'baseVal'),
  seed: property('feTurbulence', '3', 'seed', 'baseVal'),
  'shape-rendering': presentation('rect', 'crispEdges', 'shape-rendering'),
  side: {
    ...property('textPath', 'right', 'side', 'baseVal'),
    chromium: 'unsupported',
  },
  slope: property('feFuncR', '2', 'slope', 'baseVal'),
  spacing: property('textPath', 'auto', 'spacing', 'baseVal'),
  specularConstant: property(
    'feSpecularLighting',
    '2',
    'specularConstant',
    'baseVal',
  ),
  specularExponent: property(
    'feSpecularLighting',
    '2',
    'specularExponent',
    'baseVal',
  ),
  spreadMethod: property(
    'linearGradient',
    'reflect',
    'spreadMethod',
    'baseVal',
  ),
  startOffset: property('textPath', '5', 'startOffset', 'baseVal', 'value'),
  stdDeviation: property('feGaussianBlur', '2', 'stdDeviationX', 'baseVal'),
  stitchTiles: property('feTurbulence', 'stitch', 'stitchTiles', 'baseVal'),
  'stop-color': presentation('stop', 'red', 'stop-color'),
  'stop-opacity': presentation('stop', '0.5', 'stop-opacity'),
  stroke: presentation('rect', 'red', 'stroke'),
  'stroke-dasharray': presentation('rect', '1 2', 'stroke-dasharray'),
  'stroke-dashoffset': presentation('rect', '3', 'stroke-dashoffset'),
  'stroke-linecap': presentation('rect', 'round', 'stroke-linecap'),
  'stroke-linejoin': presentation('rect', 'round', 'stroke-linejoin'),
  'stroke-miterlimit': presentation('rect', '10', 'stroke-miterlimit'),
  'stroke-opacity': presentation('rect', '0.5', 'stroke-opacity'),
  'stroke-width': presentation('rect', '3', 'stroke-width'),
  surfaceScale: property('feDiffuseLighting', '2', 'surfaceScale', 'baseVal'),
  tabindex: property('rect', '0', 'tabIndex'),
  tableValues: property(
    'feFuncR',
    '0 1 0',
    'tableValues',
    'baseVal',
    'numberOfItems',
  ),
  targetX: property('feConvolveMatrix', '2', 'targetX', 'baseVal'),
  targetY: property('feConvolveMatrix', '2', 'targetY', 'baseVal'),
  'text-anchor': presentation('text', 'middle', 'text-anchor'),
  'text-decoration': presentation('text', 'underline', 'text-decoration'),
  textLength: property('text', '50', 'textLength', 'baseVal', 'value'),
  to: animate({ attributeName: 'x', from: '0', dur: '10s' }, '10', 5),
  transform: property(
    'rect',
    'rotate(10)',
    'transform',
    'baseVal',
    'numberOfItems',
  ),
  'transform-origin': presentation('rect', '10px 10px', 'transform-origin'),
  type: property('feTurbulence', 'fractalNoise', 'type', 'baseVal'),
  values: property(
    'feColorMatrix',
    '0.5',
    'values',
    'baseVal',
    'numberOfItems',
  ),
  'vector-effect': presentation('rect', 'non-scaling-stroke', 'vector-effect'),
  viewBox: property('svg', '0 0 10 10', 'viewBox', 'baseVal', 'width'),
  visibility: presentation('rect', 'hidden', 'visibility'),
  width: property('rect', '5', 'width', 'baseVal', 'value'),
  'word-spacing': presentation('text', '3px', 'word-spacing'),
  'writing-mode': presentation('text', 'vertical-rl', 'writing-mode'),
  x: property('rect', '5', 'x', 'baseVal', 'value'),
  x1: property('line', '5', 'x1', 'baseVal', 'value'),
  x2: property('line', '5', 'x2', 'baseVal', 'value'),
  xChannelSelector: property(
    'feDisplacementMap',
    'R',
    'xChannelSelector',
    'baseVal',
  ),
  y: property('rect', '5', 'y', 'baseVal', 'value'),
  y1: property('line', '5', 'y1', 'baseVal', 'value'),
  y2: property('line', '5', 'y2', 'baseVal', 'value'),
  yChannelSelector: property(
    'feDisplacementMap',
    'R',
    'yChannelSelector',
    'baseVal',
  ),
  z: property('fePointLight', '3', 'z', 'baseVal'),
} as const;
