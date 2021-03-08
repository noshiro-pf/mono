import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { utils } from '../../../../mylib/utilities';

@Component({
  selector: 'app-answer-deadline',
  templateUrl: './answer-deadline.component.html',
  styleUrls: ['./answer-deadline.component.css'],
})
export class AnswerDeadlineComponent implements OnInit {
  answerDeadline!: Date;
  @Input() set answerDeadlineInit(value: number) {
    this.answerDeadline = new Date(value);
  }
  @Output() answerDeadlineChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {}

  sinceToday(date: Date): boolean {
    if (!date) return false;
    return (
      utils.date.toMidnightTimestamp(date) >=
      utils.date.toMidnightTimestamp(Date.now())
    );
  }

  answerDeadlineOnInput(value: Date) {
    this.answerDeadline = value;
    this.answerDeadlineChange.emit(this.answerDeadline.getTime());
  }

  answerDeadlineOnChange(value: Date) {
    this.answerDeadline = value;
    this.answerDeadlineChange.emit(this.answerDeadline.getTime());
  }
}
