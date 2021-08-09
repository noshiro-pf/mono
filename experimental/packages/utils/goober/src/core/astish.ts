const newRule = /(?:([A-Z0-9-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(})/giu;
const ruleClean = /\/\*[\s\S]*?\*\/|\s{2,}|\n/gmu;

/**
 * Convert a css style string into a object
 */
export const astish = (val: string): object => {
  const tree = [{}];
  let block: object;

  while ((block = newRule.exec(val.replace(ruleClean, '')))) {
    // Remove the current entry
    if (block[4]) tree.shift();

    if (block[3]) {
      tree.unshift((tree[0][block[3]] = tree[0][block[3]] ?? {}));
    } else if (!block[4]) {
      tree[0][block[1]] = block[2];
    }
  }

  return tree[0];
};
