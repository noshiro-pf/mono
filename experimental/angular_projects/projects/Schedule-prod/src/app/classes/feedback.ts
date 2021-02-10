export class Feedback {
  databaseKey: string;
  name:        string = '';
  content:     string = '';
  date:        Date = new Date();
  closed:      boolean = false;
  category:    'bugReport'|'suggestion'|'' = '';

  constructor( databaseKey?: string, initObj?: {
    name:      string,
    content:   string,
    timeStamp: number,
    closed:    boolean,
    category:  'bugReport'|'suggestion'|'',
  }) {
    this.databaseKey = ( databaseKey || '' );

    if ( !initObj ) return;
    this.name     = ( initObj.name || '' );
    this.content  = ( initObj.content || '' );
    this.date     = new Date( initObj.timeStamp || 0 );
    this.closed   = !!initObj.closed;
    this.category = ( initObj.category || '' );
  }
}
