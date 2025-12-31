export const getElementById = (id: string): Element | undefined =>
  // eslint-disable-next-line unicorn/prefer-query-selector
  document.getElementById(id) ?? undefined;

export const createElementWithId = (id: string): Element => {
  const mut_el = document.createElement('div');

  mut_el.id = id;

  document.body.append(mut_el);

  return mut_el;
};
