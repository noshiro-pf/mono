export const createFormError = <T>(
  value: T,
  valueIsInvalid: (v: T) => boolean,
  onValueChange: (v: T) => void,
): [InitializedObservable<boolean>, (v: T) => void, () => void] => {
  const {
    state: errorShown$,
    setTrue: show,
    setFalse: hide,
  } = createBooleanState(false);

  const onBlur = (): void => {
    if (valueIsInvalid(value)) {
      show();
    }
  };

  // TODO
  // useEffect(() => {
  //   if (!valueIsInvalid(value)) {
  //     hide();
  //   }
  // }, [value, valueIsInvalid, hide]);

  const onChangeLocal = (v: T): void => {
    onValueChange(v);
    if (valueIsInvalid(v)) {
      show();
    } else {
      hide();
    }
  };

  return [errorShown$, onChangeLocal, onBlur];
};
