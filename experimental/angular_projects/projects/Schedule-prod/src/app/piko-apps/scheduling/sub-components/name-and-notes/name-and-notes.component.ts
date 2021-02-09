import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-name-and-notes',
  templateUrl: './name-and-notes.component.html',
  styleUrls: ['./name-and-notes.component.css']
})
export class NameAndNotesComponent implements OnInit {

  title: string = '';
  @Input() set titleInit( value: string ) {
    this.title = value || '';
  }
  @Output() titleChange = new EventEmitter<string>();

  notes: string = '';
  @Input() set notesInit( value: string ) {
    this.notes = value || '';
  }
  @Output() notesChange = new EventEmitter<string>();


  constructor() {}

  ngOnInit() {
  }


  titleOnChange( value: string ) {
    this.title = value;
    this.titleChange.emit( this.title );
  }

  notesOnChange( value: string ) {
    this.notes = value;
    this.notesChange.emit( this.notes );
  }
}
