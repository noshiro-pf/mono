const { state, setState } = createState<UIEvent | undefined>(undefined);

window.addEventListener('resize', (ev: UIEvent) => {
  setState(ev);
});

export const windowResizeObservable = state;
