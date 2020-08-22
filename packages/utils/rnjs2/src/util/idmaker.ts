// type IdType = symbol;
export type IdType = number;
// const genId = () => Symbol('RNId');
function* idMaker(): Generator<number, number, number> {
  let i = 0;
  while (true) {
    yield i;
    i += 1;
  }
}

const idmaker = idMaker();
export const genId = (): IdType => idmaker.next().value;
