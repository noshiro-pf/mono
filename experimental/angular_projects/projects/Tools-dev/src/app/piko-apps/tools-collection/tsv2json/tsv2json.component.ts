import { Component, OnInit } from '@angular/core';

import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-tsv2json',
  templateUrl: './tsv2json.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './tsv2json.component.css'
  ]
})
export class Tsv2jsonComponent implements OnInit {

  separators = [
      { value: '\t', viewValue: 'タブ (\\t)' },
      { value: ',',  viewValue: 'カンマ (,)' },
    ];
  separatorSource = new BehaviorSubject<string>('\t');
  separator$ = this.separatorSource.asObservable();

  tsvHeaderTextSource = new BehaviorSubject<string>('');
  tsvTextSource       = new BehaviorSubject<string>('');

  tableHeader$: Observable<string[]>;
  table$: Observable<any[][]>;

  jsonText$: Observable<string>;



  constructor() {
    this.tableHeader$
      = combineLatest(
          this.tsvHeaderTextSource.asObservable(),
          this.separator$,
          (tsvHeaderText, separator) =>
            tsvHeaderText.replace(/\n+$/g, '').split( separator ) ); // 末尾の改行は削除

    this.table$
      = combineLatest(
          this.tsvTextSource.asObservable(),
          this.separator$,
          (tsvText, separator) => {
              const lines = tsvText.replace(/\n+$/g, '').split('\n');
              return lines.map( line => line.split( separator ).map( this.replacer ) );
          } );

    this.jsonText$
      = combineLatest(
          this.tableHeader$.pipe( debounceTime(300) ),
          this.table$.pipe( debounceTime(300) ),
          (tableHeader, table) => this.tsv2json( tableHeader, table ) );
  }

  ngOnInit() {
  }


  replacer( e: string ) {
    if ( e.match(/^-?[0-9]+$/) ) return Number(e);
    if ( e === 'true'  ) return true;
    if ( e === 'false' ) return false;
    return e;
  }


  changeSeparator( sep: string ) {
    console.log(sep);
    this.separatorSource.next( sep );
  }

  tsvHeaderOnInput( value: string ) {
    this.tsvHeaderTextSource.next( value );
  }

  tsvOnInput( value: string ) {
    this.tsvTextSource.next( value );
  }

  tsv2json( tableHeader: string[], table: any[][] ) {
    const data = table.map( line => {
      const obj: any = {};
      tableHeader.forEach( (e, i) => obj[e] = line[i] );
      return obj;
    });
    return JSON.stringify( data, null, ' ' );
  }



}
