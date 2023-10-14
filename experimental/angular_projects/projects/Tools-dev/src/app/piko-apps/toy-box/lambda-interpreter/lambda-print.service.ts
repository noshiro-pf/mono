import { Injectable } from '@angular/core';
import { LambdaEvaluatorService } from './lambda-evaluator.service';
import { LambdaMacroService } from './lambda-macro.service';
import { LambdaParserService } from './lambda-parser.service';

@Injectable()
export class LambdaPrintService {
  constructor(
    private macro: LambdaMacroService,
    private parser: LambdaParserService,
    private evaluator: LambdaEvaluatorService,
  ) {}

  termToString(term: any): string {
    if (this.hasMacro(term)) return this.toMacroString(term);
    if (this.evaluator.isVariable(term)) return term;
    if (this.evaluator.isApplication(term)) {
      return `(${this.termToString(term[0])} ${this.termToString(term[1])})`;
    }
    if (this.evaluator.isAbstraction(term)) {
      return `(λ${term[1]}.${this.termToString(term[2])})`;
    }
    return '';
  }

  hasMacro(term: any): boolean {
    // ToDo
    if (this.evaluator.isAlphaEqual(term, this.parser.parse('PLUS')))
      return true;
    if (this.evaluator.isAlphaEqual(term, this.parser.parse('SUCC')))
      return true;
    if (this.macro.isNumber(term)) return true;
    return false;
  }

  toMacroString(term: any): string {
    if (this.evaluator.isAlphaEqual(term, this.parser.parse('PLUS')))
      return '+';
    if (this.evaluator.isAlphaEqual(term, this.parser.parse('SUCC')))
      return 'SUCC';
    if (this.macro.isNumber(term))
      return (this.macro.toNumber(term) || 0).toString();
    return '[ERROR]';
  }
}
