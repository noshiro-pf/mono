import { pickupHighContrastHues, type Hue } from '@noshiro/ts-utils-additional';
import { type Label } from '../canvas';

export const [
  //
  saturationDarker,
  saturationLighter,
]: [Percent, Percent] = [80, 100];

export const [
  //
  lightnessDarker,
  lightnessLighter,
]: [Percent, Percent] = [50, 90];

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

// eslint-disable-next-line no-restricted-syntax
const hues = pickupHighContrastHues(
  labelNames.length,
  saturationDarker,
  lightnessDarker
) as ArrayOfLength<LabelLen, Hue>;

export const labels: NonEmptyArray<Label> = pipe(
  Arr.zip(hues, labelNames)
).chain((list) =>
  Tpl.map(
    list,
    ([hue, labelName], index): Label => ({
      id: index.toString(),
      hue,
      name: labelName,
    })
  )
).value;

export const labelInit: Label = labels[0];
