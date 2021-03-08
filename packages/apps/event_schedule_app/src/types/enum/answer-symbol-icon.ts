import { IconName } from '@blueprintjs/core';
import { assertType, TypeExtends } from '@noshiro/ts-utils';

type AnswerSymbolIconIdFromBp = IconName &
  (
    | 'circle'
    | 'full-circle'
    | 'square'
    | 'star'
    | 'star-empty'
    | 'symbol-circle'
    | 'symbol-triangle-up'
    | 'symbol-triangle-down'
    | 'symbol-diamond'
    | 'asterisk'
    | 'heart'
    | 'add'
    | 'train'
    | 'unknown-vehicle'
    | 'taxi'
    | 'airplane'
    | 'walk'
    | 'cloud'
    | 'snowflake'
    | 'moon'
    | 'error'
    | 'confirm'
    | 'home'
    | 'crown'
    | 'hand'
    | 'people'
    | 'time'
    | 'disable'
    | 'cross'
    | 'person'
    | 'thumbs-up'
    | 'thumbs-down'
    | 'flash'
    | 'tint'
    | 'music'
    | 'tree'
    | 'clean'
    | 'tick'
    | 'tick-circle'
  );

type AnswerSymbolIconHandmade =
  | 'handmade-circle'
  | 'handmade-triangle'
  | 'handmade-cross';

export type AnswerSymbolIconId =
  | AnswerSymbolIconHandmade
  | AnswerSymbolIconIdFromBp;

export const answerSymbolIconIdsFromBp: AnswerSymbolIconIdFromBp[] = [
  'circle',
  'full-circle',
  'square',
  'star',
  'star-empty',
  'symbol-circle',
  'symbol-triangle-up',
  'symbol-triangle-down',
  'symbol-diamond',
  'asterisk',
  'heart',
  'add',
  'train',
  'unknown-vehicle',
  'taxi',
  'airplane',
  'walk',
  'cloud',
  'snowflake',
  'moon',
  'error',
  'confirm',
  'home',
  'crown',
  'hand',
  'people',
  'time',
  'disable',
  'cross',
  'person',
  'thumbs-up',
  'thumbs-down',
  'flash',
  'tint',
  'music',
  'tree',
  'clean',
  'tick',
  'tick-circle',
];

const answerSymbolIconIdsHandmade: AnswerSymbolIconHandmade[] = [
  'handmade-circle',
  'handmade-triangle',
  'handmade-cross',
];

export const answerSymbolIconIdsAll: AnswerSymbolIconId[] = [
  ...answerSymbolIconIdsHandmade,
  ...answerSymbolIconIdsFromBp,
];

// symbol
assertType<TypeExtends<'circle', IconName>>();
assertType<TypeExtends<'full-circle', IconName>>();
assertType<TypeExtends<'square', IconName>>();
assertType<TypeExtends<'star', IconName>>();
assertType<TypeExtends<'star-empty', IconName>>();
assertType<TypeExtends<'symbol-circle', IconName>>();
assertType<TypeExtends<'symbol-triangle-up', IconName>>();
assertType<TypeExtends<'symbol-triangle-down', IconName>>();
assertType<TypeExtends<'symbol-diamond', IconName>>();
assertType<TypeExtends<'asterisk', IconName>>();
assertType<TypeExtends<'heart', IconName>>();
assertType<TypeExtends<'add', IconName>>();

// vehicle
assertType<TypeExtends<'train', IconName>>();
assertType<TypeExtends<'unknown-vehicle', IconName>>();
assertType<TypeExtends<'taxi', IconName>>();
assertType<TypeExtends<'airplane', IconName>>();
assertType<TypeExtends<'walk', IconName>>();

// weather
assertType<TypeExtends<'cloud', IconName>>();
assertType<TypeExtends<'snowflake', IconName>>();
assertType<TypeExtends<'moon', IconName>>();

assertType<TypeExtends<'error', IconName>>();
assertType<TypeExtends<'confirm', IconName>>();
assertType<TypeExtends<'home', IconName>>();
assertType<TypeExtends<'crown', IconName>>();
assertType<TypeExtends<'hand', IconName>>();
assertType<TypeExtends<'people', IconName>>();
assertType<TypeExtends<'person', IconName>>();
assertType<TypeExtends<'time', IconName>>();
assertType<TypeExtends<'disable', IconName>>();
assertType<TypeExtends<'cross', IconName>>();
assertType<TypeExtends<'person', IconName>>();
assertType<TypeExtends<'thumbs-up', IconName>>();
assertType<TypeExtends<'thumbs-down', IconName>>();
assertType<TypeExtends<'flash', IconName>>();
assertType<TypeExtends<'tint', IconName>>();
assertType<TypeExtends<'music', IconName>>();
assertType<TypeExtends<'tree', IconName>>();
assertType<TypeExtends<'clean', IconName>>();
assertType<TypeExtends<'tick', IconName>>();
assertType<TypeExtends<'tick-circle', IconName>>();
