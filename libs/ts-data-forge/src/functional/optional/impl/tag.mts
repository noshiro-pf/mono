/** @internal String literal tag to identify the 'Some' variant of Optional. */
export const SomeTypeTagName: Some<unknown>['$$tag'] =
  'ts-data-forge::Optional.some';

/** @internal String literal tag to identify the 'None' variant of Optional. */
export const NoneTypeTagName: None['$$tag'] = 'ts-data-forge::Optional.none';
