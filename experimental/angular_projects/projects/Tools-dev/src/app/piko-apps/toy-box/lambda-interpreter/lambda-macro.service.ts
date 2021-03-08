import { Injectable } from '@angular/core';
import { LambdaEvaluatorService } from './lambda-evaluator.service';

@Injectable()
export class LambdaMacroService {
  constructor(private evaluator: LambdaEvaluatorService) {}

  succ(): string {
    return '(lambda n.(lambda s.(lambda z.(s((n s)z)))))';
  }

  plus(): string {
    return '(lambda m.(lambda n.(lambda s.(lambda z.((m s) ((n s)z))))))';
  }

  number(n: number): string {
    return `(lambda s.(lambda z. ${'(s'.repeat(n)} z${')'.repeat(n)}))`;
  }

  isNumber(term: any): boolean {
    // 2 = ['lambda', 's', ['lambda', 'z', ['s', ['s', 'z'] ] ] ]
    if (!this.evaluator.isAbstraction(term)) return false;
    if (!this.evaluator.isAbstraction(term[2])) return false;
    const s = term[1];
    const z = term[2][1];
    const body = term[2][2];
    const sub = (t: any): boolean => {
      if (this.evaluator.isVariable(t)) return t === z;
      if (this.evaluator.isApplication(t)) {
        return t[0] === s && sub(t[1]);
      }
      return false;
    };
    // ToDo
    return sub(body);
  }

  toNumber(term: any): number | undefined {
    if (!this.isNumber(term)) return undefined;
    const s = term[1];
    const z = term[2][1];
    const body = term[2][2];
    const counter = (t: any): number => (t === z ? 0 : 1 + counter(t[1]));
    return counter(body);
  }
}
