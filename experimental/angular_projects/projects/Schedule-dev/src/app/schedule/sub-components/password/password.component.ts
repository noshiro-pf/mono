import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { manual, merge, RN } from 'rnjs';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordComponent implements OnInit, OnDestroy {
  private alive = true;

  private readonly passwordFromInput$ = manual<string>('');
  @Input() set passwordInit(value: string) {
    this.passwordFromInput$.emit(value || '');
  }

  private readonly passwordFromUI$ = manual<string>('');
  private readonly enabledFromUI$ = manual<boolean>(false);

  readonly password$: RN<string> = merge(
    this.passwordFromInput$,
    this.passwordFromUI$.debounce(200),
    this.enabledFromUI$
      .debounce(100)
      .filter(true, (e) => e === false)
      .mapTo('')
  );

  readonly enabled$: RN<boolean> = merge(
    this.passwordFromInput$.map((v) => v !== ''),
    this.enabledFromUI$.debounce(100)
  );

  @Output() passwordChange = new EventEmitter<string>();
  @Output() enabledChange = new EventEmitter<boolean>();

  constructor() {
    this.password$
      .takeWhile(() => this.alive)
      .listen(false, (pw) => {
        this.passwordChange.emit(pw);
      });

    this.enabled$
      .takeWhile(() => this.alive)
      .listen(false, (b) => {
        this.enabledChange.emit(b);
      });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.alive = false;
  }

  passwordOnInput(value: string) {
    this.passwordFromUI$.emit(value);
  }

  check(value: boolean) {
    this.enabledFromUI$.emit(value);
  }
}
