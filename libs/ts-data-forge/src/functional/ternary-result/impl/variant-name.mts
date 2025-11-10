import { ErrTypeTagName, OkTypeTagName, WarnTypeTagName } from './tag.mjs';

/** @internal Returns the human readable variant label for the given tag. */
export const variantName = (
  tag: UnknownTernaryResult['$$tag'],
): 'Ok' | 'Warn' | 'Err' => {
  switch (tag) {
    case OkTypeTagName:
      return 'Ok';

    case WarnTypeTagName:
      return 'Warn';

    case ErrTypeTagName:
      return 'Err';
  }
};
