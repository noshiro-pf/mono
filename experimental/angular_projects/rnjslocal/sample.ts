import { RN,
    interval,
    combine,
    manual,
    merge,
    fromObservable,
  } from './RN';

import {
    map,
    debounce,
    filter,
    scan,
  } from './operators';


const a = interval( 1000, true ).take( 5 );
a.listen( true, console.log );
setTimeout( () => a.once().then( v => console.log('once', v ) ), 2500 );

/*
listen 0
subscribe 0
subscribe 1
listen 1
subscribe 2
listen 2
subscribe 3
listen 3
subscribe 4
listen 4
*/



// const a = interval( 100, false );
// const b = a.withInitialValue(999)
// b.listen( true, console.log );
// a.start();

/*
999
0
1
2
3
4
5
6
7
...
*/




// const a = fromObservable( 0, rxjsInterval( 1000 ) );
// a.listen( false, console.log );

/*
0
0
0
0
1
0
1
0
1
0
1
2
0
1
2
0
1
2
0
1
*/

/*
interval   : 0 |0---------1---------2---------...

(mapped-1) : 0 |0--0--0--0--0--0--0--0--0--0--...
(mapped-2) : 0           |1--1--1--1--1--1--1-...
(mapped-3) : 0                     |2--2--2--2...
...
    --- switchMap & mapTo ---
         [0,0] |0--0--0--01-01-01-012012012012012012012012012
*/

