import { Mappable } from './mappable';

const m1 = new Mappable([1, 2, 3]);
const m2 = m1.map((x) => x * x);
console.log(m2);
