import { initialInputs, type LoanApp, type LoanInputs } from './model.mjs';

/**
 * The inputs as one immutable value, for the virtual-DOM libraries: each change
 * computes the next inputs from the last and hands them to `commit`, which
 * re-renders. React and Preact share it, so that they differ only in how they
 * render.
 */
export const createLoanOperations = (
  commit: (inputs: LoanInputs) => void,
  dispose: () => void,
): LoanApp => {
  const mut_current: { inputs: LoanInputs } = { inputs: initialInputs };

  const set = (inputs: LoanInputs): void => {
    mut_current.inputs = inputs;

    commit(inputs);
  };

  return {
    setAnnualRate: (percent) => {
      set({ ...mut_current.inputs, annualRate: percent });
    },
    setPrepayment: (month, amount) => {
      set({
        ...mut_current.inputs,
        prepayments: mut_current.inputs.prepayments.with(month, amount),
      });
    },
    dispose,
  };
};
