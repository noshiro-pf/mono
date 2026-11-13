/**
 * Whether what is mounted now goes under an SVG element other than
 * `foreignObject`. `a`, `script`, `style` and `title` are both HTML and SVG
 * tags, and the tag alone does not say which is meant: under SVG content they
 * are SVG's, anywhere else HTML's, as an HTML parser and React decide it
 * (SPEC.md 5.2).
 *
 * Every mount goes through one of the places that know the parent (an element
 * mounting its children, `render`, `Portal`, and the updates of `For` and of a
 * switch), and each runs it with {@link mountUnder}. A description mounted by
 * hand, outside all of them, is HTML.
 */
export const isMountingInSvg = (): boolean => mut_state.inSvg;

/** Runs `mount` as the children of an SVG parent, or of any other, are mounted. */
export const mountUnder = <R,>(inSvg: boolean, mount: () => R): R => {
  const before = mut_state.inSvg;

  mut_state.inSvg = inSvg;

  try {
    return mount();
  } finally {
    mut_state.inSvg = before;
  }
};

/** Whether the children of `parent` are SVG content. */
export const holdsSvgContent = (parent: Node | null): boolean =>
  parent instanceof SVGElement && parent.localName !== 'foreignObject';

const mut_state: { inSvg: boolean } = { inSvg: false };
