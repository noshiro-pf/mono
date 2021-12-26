export const answerIconPointConfig = {
  step: 1,
  min: 0,
  max: 10,
  fair: {
    min: 0.1,
    max: 9.9,
  },
  digit: 1,
} as const;

export const weightNumericInputConfig = {
  step: 1,
  min: 0.1,
  max: 10,
  digit: 1,
} as const;
