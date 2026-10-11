// Stage 3, lint: the oxlint preset and the Sumi checker.
export const describe = (value: number | undefined): string => {
  var label = 'none';

  if (value == 0) {
    label = 'zero';
  }

  return label;
};

export const nothing = null;

export const sizes = [1, 2];
