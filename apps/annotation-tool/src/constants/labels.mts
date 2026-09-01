import { Arr } from 'ts-data-forge';
import { type FixedLengthTuple, type Percent } from 'ts-type-forge';
import { pickupHighContrastHues, type Hue } from 'ts-utils-additional';
import { type Label } from '../canvas/index.mjs';

export const [
  //
  saturationDarker,
  saturationLighter,
]: readonly [Percent, Percent] = [80, 100] as const;

export const [
  //
  lightnessDarker,
  lightnessLighter,
]: readonly [Percent, Percent] = [50, 90] as const;

// const highlightAlpha: Alpha = 0.4;

const labelNames = [
  'Ant',
  'Bat',
  'Cat',
  'Dog',
  'Eagle',
  'Falcon',
  'Giraffe',
  'Horse',
] as const;

type LabelLen = (typeof labelNames)['length'];

const hues: FixedLengthTuple<LabelLen, Hue> = pickupHighContrastHues(
  labelNames.length,
  saturationDarker,
  lightnessDarker,
);

// Mapped over `labelNames` rather than zipped: `Arr.zip`'s `const` type
// parameters reconstruct both tuples, and `tsc` gives up with TS2589/TS2590.
// `hues` is a `FixedLengthTuple` of the same length, so indexing it with this
// map's index is total.
// Not annotated `NonEmptyArray<Label>`: that type carries a brand only a guard
// can establish, and `Arr.map` over a fixed tuple already gives a type that is
// statically known to be non-empty (so `labels[0]` below is total).
export const labels = Arr.map(labelNames, (labelName, index): Label => ({
  id: index.toString(),
  hue: hues[index],
  name: labelName,
}));

export const labelInit: Label = labels[0];
