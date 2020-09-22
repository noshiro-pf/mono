export const useState = <T>(
  init: T
): [T, (next: T) => void, (updater: (from: T) => T) => void] => {
  let value = init;
  const setValue = (next: T) => {
    value = next;
  };
  const updateValue = (updater: (from: T) => T) => {
    value = updater(value);
  };
  return [value, setValue, updateValue];
};
