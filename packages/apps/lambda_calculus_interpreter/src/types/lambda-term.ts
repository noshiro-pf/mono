import { Variable } from './variable';

// type TLambdaTerm = Variable | [TLambdaTerm, TLambdaTerm] | ['lambda', Variable, TLambdaTerm]
export type TLambdaTerm = Variable | LambdaApplication | LambdaAbstraction;

interface LambdaApplication {
  // type: 'appli';
  first: TLambdaTerm;
  second: TLambdaTerm;
}

interface LambdaAbstraction {
  // type: 'abstr';
  var: Variable;
  body: TLambdaTerm;
}

const l1: TLambdaTerm = 'x';
const l2: TLambdaTerm = { var: 'x', body: 'x' };
const l3: TLambdaTerm = { var: 'x', body: { var: 'y', body: 'y' } };
const l4: TLambdaTerm = {
  first: { var: 'x', body: { var: 'y', body: 'y' } },
  second: { var: 'x', body: { var: 'y', body: 'y' } },
};

console.log(l1, l2, l3, l4);
