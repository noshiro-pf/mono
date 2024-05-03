import { match } from 'ts-pattern';

type Cat = Readonly<{ type: 'Cat'; x: 'Meow' }>;
type Dog = Readonly<{ type: 'Dog'; y: 'Bow' }>;

type Animal = Cat | Dog;

const isCat = (v: Animal): v is Cat => v.type === 'Cat';
const isDog = (v: Animal): v is Dog => v.type === 'Dog';

export const say = (animal: Animal) =>
  match(animal)
    .when(isCat, (v) => v.x)
    .when(isDog, (v) => v.y)
    .exhaustive();
