import type { ReadonlyRecord, RelaxedExclude } from 'ts-type-forge';

/**
 * The keys written as DOM properties (`element[key] = value`) rather than as
 * attributes. These are the ones a user's input moves away from the attribute
 * (`value`, `checked`, …), and the enumerated attributes whose `false` is a
 * value rather than an absence (`draggable`, `spellcheck`, `translate`).
 *
 * The props types and the binding both read this table (SPEC.md 5.2).
 */
export const propertyNames = [
  'checked',
  'defaultChecked',
  'defaultValue',
  'draggable',
  'indeterminate',
  'muted',
  'selected',
  'spellcheck',
  'translate',
  'value',
] as const;

/**
 * DOM property names whose attribute is spelt differently. Every other name is
 * passed to `setAttribute`, which lower-cases it for an HTML element
 * (`tabIndex` becomes `tabindex`).
 */
export const attributeNameOf: ReadonlyRecord<string, string> = {
  acceptCharset: 'accept-charset',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
} as const;

/**
 * The tags created in the SVG namespace: those of `SVGElementTagNameMap` that
 * HTML does not also have. `a`, `script`, `style` and `title` are created as
 * HTML elements wherever they appear.
 */
export const svgTagNames = [
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'g',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'set',
  'stop',
  'svg',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tspan',
  'use',
  'view',
] as const satisfies readonly RelaxedExclude<
  keyof SVGElementTagNameMap,
  keyof HTMLElementTagNameMap
>[];

export type SvgTagName = (typeof svgTagNames)[number];

/**
 * The attributes an SVG element takes. SVG properties are animated values
 * (`SVGAnimatedLength`), so unlike HTML they cannot be read off the element
 * types; these are listed by hand and written with `setAttribute` as named.
 */
export const svgAttributeNames = [
  'clip-path',
  'clip-rule',
  'cx',
  'cy',
  'd',
  'dominant-baseline',
  'dx',
  'dy',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'font-family',
  'font-size',
  'font-weight',
  'fx',
  'fy',
  'gradientTransform',
  'gradientUnits',
  'height',
  'href',
  'id',
  'marker-end',
  'marker-mid',
  'marker-start',
  'mask',
  'offset',
  'opacity',
  'pathLength',
  'patternUnits',
  'points',
  'preserveAspectRatio',
  'r',
  'rx',
  'ry',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-opacity',
  'stroke-width',
  'tabindex',
  'text-anchor',
  'transform',
  'viewBox',
  'visibility',
  'width',
  'x',
  'x1',
  'x2',
  'y',
  'y1',
  'y2',
] as const;
