import { useBoolState } from '@noshiro/react-utils';
import { useCallback, useEffect } from 'react';

export const useFormError = <T>(
  value: T,
  valueIsInvalid: (v: T) => boolean,
  onValueChange: (v: T) => void
): [boolean, (v: T) => void, () => void] => {
  const {
    state: showError,
    setTrue: show,
    setFalse: hide,
  } = useBoolState(false);

  const onBlur = useCallback(() => {
    if (valueIsInvalid(value)) {
      show();
    }
  }, [value, valueIsInvalid, show]);

  useEffect(() => {
    if (!valueIsInvalid(value)) {
      hide();
    }
  }, [value, valueIsInvalid, hide]);

  const onChangeLocal = useCallback(
    (v: T) => {
      onValueChange(v);
      if (valueIsInvalid(v)) {
        show();
      } else {
        hide();
      }
    },
    [onValueChange, valueIsInvalid, hide, show]
  );

  return [showError, onChangeLocal, onBlur];
};
