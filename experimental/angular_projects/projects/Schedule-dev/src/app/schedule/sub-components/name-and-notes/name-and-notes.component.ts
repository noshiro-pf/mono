import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { manual, RN } from 'rnjs';

@Component({
  selector: 'app-name-and-notes',
  templateUrl: './name-and-notes.component.html',
  styleUrls: ['./name-and-notes.component.css']
})
export class NameAndNotesComponent implements OnInit, OnDestroy {
  private alive = true;

  readonly title$ = manual<string>('');
  @Input() set titleInit( value: string ) {
    this.title$.emit( value || '' );
  }

  @Output() titleChange = new EventEmitter<string>();


  readonly notes$ = manual<string>('');
  @Input() set notesInit( value: string ) {
    this.notes$.emit( value || '' );
  }

  @Output() notesChange = new EventEmitter<string>();


  constructor() {
    this.title$.debounce(200)
      .takeWhile( () => this.alive )
      .listen( false, v => {
        this.titleChange.emit( v );
      });

    this.notes$.debounce(200)
      .takeWhile( () => this.alive )
      .listen( false, tt => {
        this.notesChange.emit( tt );
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.alive = false;
  }


  titleOnInput( value: string ) {
    this.title$.emit( value );
  }

  notesOnInput( value: string ) {
    this.notes$.emit( value );
  }
}
