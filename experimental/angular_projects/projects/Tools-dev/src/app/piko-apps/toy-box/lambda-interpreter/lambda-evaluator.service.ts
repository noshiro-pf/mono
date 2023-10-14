import { Injectable } from '@angular/core';
import { utils } from '../../../mylib/utilities';

type Variable =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

@Injectable()
export class LambdaEvaluatorService {
  MAX_STEPS = 100; // reduction再帰の回数上限
  ALPHABETS = <Variable[]>utils.string.getAlphabets('lower');

  constructor() {}

  evalSequence(term: any) {
    if (!term || !this.isLambdaTerm(term)) return [];
    let curr = term;
    let prev = undefined;

    const seq = [];
    seq.push(term);

    for (let counter = this.MAX_STEPS; counter-- > 0; ) {
      const next = this.evaluate1step(curr);
      if (this.isEqual(next, curr)) break;
      seq.push(next);
      prev = curr;
      curr = next;
    }
    return seq;
  }

  evaluate1step(term: any) {
    return this.betaReduction1step(term);
  }

  isEqual(term1: any, term2: any): boolean {
    if (this.isVariable(term1) && this.isVariable(term2)) {
      return term1 === term2;
    }
    if (this.isAbstraction(term1) && this.isAbstraction(term2)) {
      return term1[1] === term2[1] && this.isEqual(term1[2], term2[2]);
    }
    if (this.isApplication(term1) && this.isApplication(term2)) {
      return (
        this.isEqual(term1[0], term2[0]) && this.isEqual(term1[1], term2[1])
      );
    }
    return false;
  }

  isAlphaEqual(term1: any, term2: any): boolean {
    if (this.isVariable(term1) && this.isVariable(term2)) {
      return term1 === term2;
    }
    if (this.isAbstraction(term1) && this.isAbstraction(term2)) {
      if (term1[1] === term2[1]) return this.isAlphaEqual(term1[2], term2[2]);
      else {
        const term2converted = this.alphaConversion(term1[1], term2);
        return this.isAlphaEqual(term1[2], term2converted[2]);
      }
    }
    if (this.isApplication(term1) && this.isApplication(term2)) {
      return (
        this.isAlphaEqual(term1[0], term2[0]) &&
        this.isAlphaEqual(term1[1], term2[1])
      );
    }
    return false;
  }

  isVariable(term: any) {
    /* "x" -> true, ["lambda", "x", "x"] -> false */
    if (!term || typeof term !== 'string' || term.length !== 1) return false;
    return !!term.match(/[a-z]/);
  }

  isAbstraction(term: any): boolean {
    if (!term || !Array.isArray(term) || term.length !== 3) return false;
    return (
      term[0] === 'lambda' &&
      this.isVariable(term[1]) &&
      this.isLambdaTerm(term[2])
    );
  }

  isApplication(term: any): boolean {
    if (!term || !Array.isArray(term) || term.length !== 2) return false;
    return this.isLambdaTerm(term[0]) && this.isLambdaTerm(term[1]);
  }

  isLambdaTerm(term: any): boolean {
    return (
      this.isVariable(term) ||
      this.isAbstraction(term) ||
      this.isApplication(term)
    );
  }

  getFreeVariables(term: any): Variable[] {
    if (this.isVariable(term)) return [term];
    if (this.isAbstraction(term)) {
      return this.getFreeVariables(term[2]).filter((ch) => ch !== term[1]);
    }
    if (this.isApplication(term)) {
      return [
        ...this.getFreeVariables(term[0]),
        ...this.getFreeVariables(term[1]),
      ];
    }
    return [];
  }

  /**
   * @description
   * If {@param term} != (M N) then {@param term}.
   * Otherwise:
   *   if {@param term} = (λx. M)N then M[x := N].
   *   else proceed beta-reduction for M or N of (M N).
   */
  betaReduction1step(term: any): any {
    // console.log( 'betaReduction1step', term );
    if (this.isVariable(term)) return term;
    if (this.isAbstraction(term)) {
      return ['lambda', term[1], this.betaReduction1step(term[2])];
    }
    if (this.isApplication(term)) {
      const left = term[0];
      const right = term[1];
      if (this.isAbstraction(left)) {
        const arg = left[1];
        const body = left[2];
        return this.substitute(right, arg, body);
      } else {
        const leftAfter1step: any = this.betaReduction1step(left);
        if (!this.isEqual(leftAfter1step, left)) {
          return [leftAfter1step, right];
        } else {
          return [left, this.betaReduction1step(right)];
        }
      }
    }
    console.error(`Syntax error: "${term}" is not lambda term.`);
    return term;
  }

  pickUpAvailableVariable(freeVariables: Variable[]): Variable {
    const availableVariables = this.ALPHABETS.filter(
      (e) => !freeVariables.includes(e),
    );
    if (availableVariables.length < 1) console.error('alphabets exhausted');
    return availableVariables[0]; // pick up one available
  }

  /**
   * @desc (λx.M[x]) → (λy.M[y])
   * @param to   "y" of "(λx.M[x]) → (λy.M[y])"
   * @param term "(λx.M[x])" of "(λx.M[x]) → (λy.M[y])"
   */
  alphaConversion(to: Variable, term: any) {
    // console.log( 'alphaConversion', to, term );
    if (!this.isAbstraction(term)) return term;
    const from = term[1]; // "x" of "(λx.M[x])"
    const sub = (t: any): any => {
      if (this.isVariable(t)) return t === from ? to : t;
      if (this.isApplication(t)) return [sub(t[0]), sub(t[1])];
      if (this.isAbstraction(t))
        return t[1] === from ? t : ['lambda', t[1], sub(t[2])];
      return t; // dummy
    };
    return ['lambda', to, sub(term[2])];
  }

  /**
   * @desc substitute term2 for x in formula term1 in capture-avoiding manner.
   * formally:
   * x[x := N]       = N
   * y[x := N]       = y, if x ≠ y
   * (M1 M2)[x := N] = (M1[x := N]) (M2[x := N])
   * (λx.M)[x := N]  = λx.M
   * (λy.M)[x := N]  = λy.(M[x := N]), if x ≠ y, provided y ∉ FV(N)
   * if y ∈ FV(N) then proceed α-conversion
   */
  substitute(to: any, from: any, term: any): any {
    // console.log( 'substitute', to, from, term );
    if (this.isVariable(term)) {
      return term === from ? to : term;
    }
    if (this.isApplication(term)) {
      return [
        this.substitute(to, from, term[0]),
        this.substitute(to, from, term[1]),
      ];
    }
    if (this.isAbstraction(term)) {
      const arg = term[1];
      const body = term[2];

      if (arg === from) return term;

      const freeVariables = this.getFreeVariables(to);
      if (!freeVariables.includes(arg)) {
        return ['lambda', arg, this.substitute(to, from, body)];
      } else {
        const v = this.pickUpAvailableVariable(freeVariables);
        const converted = this.alphaConversion(v, term);
        return this.substitute(to, from, converted);
      }
    }
    console.error(`Syntax error: "${term}" is not lambda term.`);
    return term;
  }
}
