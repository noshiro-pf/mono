import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordComponent implements OnInit {
  password: string = '';
  enabled = false;
  @Input() set passwordInit(value: string) {
    this.password = value || '';
    this.enabled = !!value;
  }
  @Output() passwordChange = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  passwordOnChange(value: string) {
    this.password = value;
    this.passwordChange.emit(this.password);
  }

  check(value: boolean) {
    this.enabled = value;
    if (!this.enabled) this.passwordOnChange('');
  }
}
