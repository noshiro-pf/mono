import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { LambdaEvaluatorService } from './lambda-evaluator.service';
import { LambdaMacroService } from './lambda-macro.service';
import { LambdaParserService } from './lambda-parser.service';
import { LambdaPrintService } from './lambda-print.service';

@Component({
  providers: [
    LambdaMacroService,
    LambdaParserService,
    LambdaEvaluatorService,
    LambdaPrintService,
  ],
  selector: 'app-lambda-interpreter',
  templateUrl: './lambda-interpreter.component.html',
  styleUrls: ['./lambda-interpreter.component.css'],
})
export class LambdaInterpreterComponent implements OnInit {
  private inputSource = new BehaviorSubject<string>('((+ 2) 3)');
  private input$: Observable<string> = this.inputSource
    .asObservable()
    .pipe(debounceTime(200 /* ms */));

  private parseTree$: Observable<undefined | string | any[]> = this.input$.pipe(
    map((input) => this.parser.parse(input))
  );
  parseTreeToStr$: Observable<string> = this.parseTree$.pipe(
    map((tree) => this.print.termToString(tree))
  );
  private evalSequence$: Observable<any[]> = this.parseTree$.pipe(
    map((t) => this.evaluator.evalSequence(t))
  );

  private evalSeqToStr$: Observable<string[]> = this.evalSequence$.pipe(
    map((seq) => seq.map((tree) => this.print.termToString(tree)))
  );
  output$: Observable<string> = this.evalSeqToStr$.pipe(
    map((seq) => seq.map((s, i) => `${i}.\t${s}`).join('\n'))
  );

  isLambdaTerm$: Observable<boolean> = this.input$.pipe(
    map((input) => this.parser.splitToTokens(input)),
    map((tokens) => this.parser.isLambdaTerm(tokens))
  );

  constructor(
    private parser: LambdaParserService,
    private evaluator: LambdaEvaluatorService,
    private print: LambdaPrintService
  ) {}

  ngOnInit() {}

  inputTextOnChange(value: string) {
    this.inputSource.next(value);
  }
}
