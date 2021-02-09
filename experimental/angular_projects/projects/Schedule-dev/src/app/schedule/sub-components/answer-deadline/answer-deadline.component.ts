import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { utils } from '../../../mylib/utilities';

const to0000 = utils.date.toMidnightTimestamp;


@Component({
  selector: 'app-answer-deadline',
  templateUrl: './answer-deadline.component.html',
  styleUrls: ['./answer-deadline.component.css']
})
export class AnswerDeadlineComponent implements OnInit {

  answerDeadline!: Date;
  @Input() set answerDeadlineInit( value: number ) {
    this.answerDeadline = new Date( value );
  }
  @Output() answerDeadlineChange = new EventEmitter<number>();



  constructor() { }

  ngOnInit() {
  }



  sinceToday( date: Date ): boolean {
    if ( !date ) return false;
    return to0000(date) >= to0000( Date.now() );
  }


  answerDeadlineOnInput( value: Date ) {
    this.answerDeadline = value;
    this.answerDeadlineChange.emit( value.getTime() );
  }

  answerDeadlineOnChange( value: Date ) {
    this.answerDeadline = value;
    this.answerDeadlineChange.emit( value.getTime() );
  }
}
