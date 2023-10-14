# RN

Reactive Programming Library for TypeScript

glitch-less & hot Observable only RxJS

## Usage

-   installation

```
npm install --save rnjs
```

-   import

```ts
import { RN, interval } from 'rnjs';

const a: RN<number> = interval(1000, true); // generate RN

a.subscribe(console.log);

// 0
// 1
// 2
// ...
```

## features

-   glitch-less

    -   in RxJS

    ```ts
    const a = interval(1000);
    const b = a.pipe(map((x) => 100 * x));
    const c = combineLatest(a, b).pipe(map(([x, y]) => x + y));
    c.subscribe(console.log);
    // 0
    // 1  <-- glitch
    // 101
    // 102  <-- glitch
    // 202
    // 203  <-- glitch
    // 303
    // 304  <-- glitch
    // 404
    // 405  <-- glitch
    // 505
    // ...
    ```

    -   in RN

    ```ts
    // RN
    const a = interval(1000, true);
    const b = a.map((x) => 100 * x);
    const c = combine(a, b).map(([x, y]) => x + y);
    c.listen(true, console.log);

    // 0
    // 101
    // 202
    // 303
    // 404
    // 505
    // ...
    ```

    -   about "glitch"
        -   [RX GLITCHES AREN'T ACTUALLY A PROBLEM](https://staltz.com/rx-glitches-arent-actually-a-problem.html)
        -   Bainomugisha, Engineer, et al. "A survey on reactive programming." ACM Computing Surveys (CSUR) 45.4 (2013): 52.
    -   all tasks are processed by the priority-queue

*   initial value

    -   all RNs have initial values
    -   you can get the current value with `value` property
        (like `BehaviorSubject` in RxJS)

    ```ts
    import { RN, interval } from 'rnjs';

    const a: RN<number> = interval(1000, true).take(8);

    a.subscribe(console.log);

    // |0---1---2---3---4---5---6---7---|
    //                ^
    setTimeout(() => console.log(a.value), 3500); // 3

    // |0---1---2---3---4---5---6---7---|
    //                        ^
    setTimeout(() => console.log(a.value), 5500); // 5
    ```

*   hot-RN(Observable) only

    -   no cold/hot conversion is necessary
    -   all subscribers of the RN receive the same value at the same time

*   compatiblity with RxJS
    -   mutual conversion methods (toObservable, fromObservable)
    -   the same `subscribe` API as RxJS
        -   RN can be passed to Angular async pipe
            without conversion to RxJS Observable

## Coresspondence tables to RxJS

-   Source RNs

| RN             | RxJS v6         |
| -------------- | --------------- |
| interval       | interval        |
| fromPromise    | from            |
| fromObservable | -               |
| manual         | BehaviorSubject |
| -              | ...             |

-   Combination methods

| RN      | RxJS v6       |
| ------- | ------------- |
| combine | combineLatest |
| merge   | merge         |
| -       | concat        |
| -       | zip           |
| -       | ...           |

-   Operators

| RN                  | RxJS v6              |
| ------------------- | -------------------- |
| auditTime           | auditTime            |
| delay               | delay                |
| debounce            | debounceTime         |
| filter              | filter               |
| flatMap             | flatMap              |
| map                 | map                  |
| mapTo               | mapTo                |
| pairwise            | pairwise             |
| pluck               | pluck                |
| scan                | scan                 |
| skip                | skip                 |
| skipAlreadyAppeared | distinct             |
| skipUnchanged       | distinctUntilChanged |
| skipWhile           | skipWhile            |
| startWith           | startWith            |
| switchMap           | switchMap            |
| take                | take                 |
| takeWhile           | takeWhile            |
| throttle            | throttle             |
| withLatest          | withLatestFrom       |
| withTimestamp       | timestamp            |
| withInitialValue    | -                    |
| -                   | ...                  |

## Examples

-   interval, combine, map

```ts
import { combine, interval, map } from 'rnjs';

const a = interval(100, true);
// ^
// +--- true --> start immediately
const b = a.pipe(map((x) => 100 * x));
const c = combine(a, b).map(([x, y]) => x + y);
c.subscribe(console.log);
// c.listen( true, console.log );

/* output
0
101
202
303
404
505
...
*/
```

```ts
import { combine, interval } from 'rnjs';

const a = interval(100, false);
// ^
// +--- false --> start manually
const b = a.map((x) => 100 * x);
// ^
// +--- all operators can be used without pipe method
const c = combine(a, b).map(([x, y]) => x + y);
c.listen(true, console.log);
// ^
// +--- true --> get the first value
a.start(); // start manually

/* output
0  <-- first value
0
101
202
303
404
505
...
*/
```

-   map (with index)
    -   index is initialized by
    -   map function receives
        -   source RN value
        -   source RN index (optional)
        -   this.index (optional)
    -   in the next example, `a` starts before `b` is generated
        --> a.index is not equal to b.index.

```ts
const a = interval(100, true);
const b = a.map((sv, si, i) => [100 * sv, si, i]);
b.listen(true, console.log);

/*
[ 0, 0, -1 ]
[ 100, 1, 0 ]
[ 200, 2, 1 ]
[ 300, 3, 2 ]
[ 400, 4, 3 ]
[ 500, 5, 4 ]
[ 600, 6, 5 ]
[ 700, 7, 6 ]
[ 800, 8, 7 ]
[ 900, 9, 8 ]
*/
```

-   withInitialValue

```ts
const a = interval(100, false);
const b = a.withInitialValue(999);
b.listen(true, console.log);
a.start();

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

/*
interval         : 0   |0---1---2---3---4---5---6---7---8---9--
withInitialValue : 999 |0---1---2---3---4---5---6---7---8---9--
*/
```

-   delay

```ts
const a = interval(100, false);
const b = a.delay(50).map((x) => 100 * x);
const c = merge(a, b);
c.listen(false, console.log);
a.start();

/*
0
0
1
100
2
200
3
300
4
400
5
500
6
600
7
700
*/

/*
interval : 0 |0---1---2---3---4---5---6---7---8---9--
delay    : 0 |--0---1---2---3---4---5---6---7---8---9
*/
```

-   debounce, filter

```ts
import { interval } from 'rnjs';

const a = interval(100, true);
const b = a.filter(0, (e) => e % 10 < 5);
//  ^
//  +--- filter requires initial value
const c = b.debounce(300);
b.listen(false, console.log);
c.listen(false, (e) => console.log(e, 'debounce'));

/* output
1
2
3
4
4 'debounce'
10
11
12
13
14
14 'debounce'
...
*/

/*
interval : 0 |0--1--2--3--4--5--6--7--8--9--10-11-12-13-14-15-16-17-18-19-
filter   : 0 |0--1--2--3--4-----------------10-11-12-13-14----------------
debounce : 0 |---------------------4-----------------------------14-------
*/
```

-   throttle

```ts
const a = interval(100, false);
const b = a.filter(0, (x) => x % 10 < 5).throttle(250);
b.listen(false, console.log);
a.start();

/*
0
3
10
13
20
23
30
33
40
43
...
*/

/*
interval : 0 |0--1--2--3--4--5--6--7--8--9--10-11-12-13-14-15-16-17-18-19-
filter   : 0 |0--1--2--3--4-----------------10-11-12-13-14----------------
throttle : 0 |0--------3--------------------10-------13-------------------
*/
```

-   scan

```ts
import { interval } from 'rnjs';

const a = interval(100, true);
const b = a.scan([] as number[], (prev, curr) => {
    prev.push(curr);
    return prev;
});
a.listen(true, (e) => console.log('a', e));
b.listen(true, (e) => console.log('b', e));

/* output
a 0
b []
a 1
b [ 1 ]
a 2
b [ 1, 2 ]
a 3
b [ 1, 2, 3 ]
*/
```

-   merge

```ts
import { interval, merge } from 'rnjs';

const a = interval(1000, false);
const b = interval(1000, false);
const c = b.map((e) => 100 * e);
const d = merge(a, c);
a.start();
setTimeout(() => {
    b.start();
}, 500);
d.listen(true, console.log);

/* output
0
0
1
100
2
200
3
300
4
400
5
500
*/

/*
a : 0 |0-------1-------2-------3-------4-------5-------6-------
b : 0     |0------100-----200-----300-----400-----500-----600-----
c : 0 |0---0---1--100--2--200--3--300--4--400--5--500--6--600--
*/
```

-   pairwise

```ts
import { interval } from 'rnjs';

interval(100, true).pairwise().listen(true, console.log);

/* output
[ 0, 0 ]
[ 0, 1 ]
[ 1, 2 ]
[ 2, 3 ]
[ 3, 4 ]
[ 4, 5 ]
[ 5, 6 ]
[ 6, 7 ]
[ 7, 8 ]
...
*/

/*
interval : 0     |0------1------2------3------4------5------6------
pairwise : [0,0] |[0,0]--[0,1]--[1,2]--[2,3]--[3,4]--[4,5]--[5,6]--
*/
```

-   pluck

```ts
import { interval } from 'rnjs';

const a = interval(100, true);
const b = a
    .pairwise()
    .map((e) => ({ prev: e[0], curr: e[1] }))
    .pluck('curr');
b.listen(true, console.log);

/* output
0
1
2
3
...
*/
```

-   take

```ts
const a = interval(100, true);
const b = a.take(5);
b.listen(true, console.log);

/*
0
1
2
3
4
*/
```

-   skip

```ts
const a = interval(100, true);
const b = a.skip(999, 3);
// ^
// +--- skip requires initial value
b.listen(true, console.log);

/*
999
3
4
5
6
7
8
9
*/

/*
interval : 0   |0---1---2---3---4---5---6---7---8---9---10--11--12--...
skip     : 999   |----------3---1---4---1---5---9---2---6---u---u---...
*/
```

-   takeWhile, skipAlreadyAppeared

```ts
import { interval } from 'rnjs';

const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
const a = interval(100, false);
const b = a
    .map((_sv, _si, i) => values[i])
    .takeWhile((_sv, _si, i) => 0 <= i && i < values.length)
    .skipAlreadyAppeared();
b.listen(false, console.log);
a.start();

/* output
3
1
4
5
9
2
6
8
*/

/*
interval            : 0 |0---1---2---3---4---5---6---7---8---9---10--11--12--13--14--...
map                 : 3 |3---1---4---1---5---9---2---6---5---3---5---8---9---u---u---
takeWhile           : 3 |3---1---4---1---5---9---2---6---5---3---5---8---9---
skipAlreadyAppeared : 3 |3---1---4-------5---9---2---6---------------8-------
*/
```

```ts
const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9];
const a = interval(100, true);
const b = a
    .map((_sv, _si, i) => values[i])
    .takeWhile((_sv, _si, i) => 0 <= i && i < values.length)
    .skipAlreadyAppeared();
b.listen(false, console.log);

/* output
3
1
4
5
9
2
6
8
*/

/*
interval            : 0 |0---1---2---3---4---5---6---7---8---9---10--11--12--13--14--...
map                 : ud    |3---1---4---1---5---9---2---6---5---3---5---8---9---u---u---
takeWhile           : ud    |3---1---4---1---5---9---2---6---5---3---5---8---9---
skipAlreadyAppeared : ud    |3---1---4-------5---9---2---6---------------8-------
*/
```

-   skipUnchanged

```ts
const values = [3, 3, 3, 1, 4, 1, 5, 9, 9, 9, 2, 6];
const a = interval(100, true);
const b = a
    .map((_sv, _si, i) => values[i])
    .takeWhile((_sv, _si, i) => 0 <= i && i < values.length)
    .skipUnchanged();
b.listen(false, console.log);

/*
3
1
4
1
5
9
2
6
*/

/*
interval            : 0  |0---1---2---3---4---5---6---7---8---9---10--11--12--...
map                 : ud   |--3---3---3---1---4---1---5---9---2---6---u---u---...
takeWhile           : ud   |--3---3---3---1---4---1---5---9---2---6---
skipUnchanged       : ud   |--3-----------1---4---1---5---9---2---6---
*/
```

-   withLatest

```ts
const a = interval(300, true);
const b = interval(100, true);
const c = a.withLatest(b);
c.listen(true, console.log);
/*
[ 0, 0 ]
[ 1, 2 ]
[ 2, 5 ]
[ 3, 8 ]
[ 4, 11 ]
[ 5, 14 ]
[ 6, 17 ]
[ 7, 20 ]
[ 8, 23 ]
[ 9, 26 ]
[ 10, 29 ]
*/

/*
a : 0     |0-----------1-----------2-----------3-----------4----...
b : 0      |0---1---2---3---4---5---6---7---8---9---10--11--12--...
c : [0,0]   |----------[1,2]-------[2,5]-------[3,8]-------[4,11]--...
*/
```

-   withTimestamp

```ts
const a = interval(300, true);
const b = a.withTimestamp();
b.listen(true, console.log);

/*
[ 0, 1544903873595 ]
[ 1, 1544903873896 ]
[ 2, 1544903874195 ]
[ 3, 1544903874497 ]
[ 4, 1544903874797 ]
*/
```

-   valueIs, valueIsNot

```ts
const a = interval(500, true);
const b = a.valueIs(3);
combine(a, b).listen(true, console.log);

/*
[ 0, false ]
[ 1, false ]
[ 2, false ]
[ 3, true ]
[ 4, false ]
[ 5, false ]
...
*/
```

```ts
const a = interval(500, true);
const b = a.valueIsNot(3);
combine(a, b).listen(true, console.log);

/*
[ 0, true ]
[ 1, true ]
[ 2, true ]
[ 3, false ]
[ 4, true ]
[ 5, true ]
...
*/
```

-   switchMap

```ts
const a = interval(1000, true);
const b = a.switchMap((x) => interval(300, true).mapTo(x));
b.listen(true, console.log);

/*
0
0
0
0
1
1
1
1
2
2
*/

/*
interval   : 0 |0---------1---------2---------...

(mapped-1) : 0 |0--0--0--0--0--0--0--0--0--0--...
(mapped-2) : 0           |1--1--1--1--1--1--1-...
(mapped-3) : 0                     |2--2--2--2...
...
    --- switchMap & mapTo ---
         [0,0] |0--0--0--01--1--1--12--2--2--2...
*/
```

-   flatMap

```ts
const a = interval(1000, true);
const b = a.flatMap((x) => interval(300, true).mapTo(x));
b.listen(true, console.log);

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
    --- flatMap & mapTo ---
         [0,0] |0--0--0--01-01-01-012012012012012012012012012
*/
```

-   every, some

```ts
const counter = interval( 500, true );
const a = counter.map( x => x % 2 === 0 );
const b = counter.map( x => x % 3 === 0 );
counter.listen( true, console.log );
every(a, b).listen( true, console.log );

/*
0
true
1
false
2
false
3
false
4
false
5
false
6
true
7
false

counter : 0   |0---1---2---3---4---5---6---7---...
a       : T   |T---F---T---F---T---F---T---F---...
b       : T   |T---F---F---T---F---F---T---F---...
every   : T   |T---F---F---F---F---F---T---F---...
```

```ts
const counter = interval( 500, true );
const a = counter.map( x => x % 2 === 0 );
const b = counter.map( x => x % 3 === 0 );
counter.listen( true, console.log );
some(a, b).listen( true, console.log );

/*
0
true
1
false
2
true
3
true
4
true
5
false
6
true
7
false
...


counter : 0   |0---1---2---3---4---5---6---7---...
a       : T   |T---F---T---F---T---F---T---F---...
b       : T   |T---F---F---T---F---F---T---F---...
some    : T   |T---F---T---T---T---F---T---F---...
```

-   toPromise

```ts
const a = interval(500, true).take(5);
const pr = a.toPromise();
a.listen(true, console.log);
pr.then((v) => console.log('resolve', v));

/*
0
1
2
3
4
resolve 4
*/
```

-   toObservable

```ts
const a = interval(500, true).take(5);
const ob = a.toObservable();
a.listen(true, (v) => console.log('listen', v));
ob.subscribe((v) => console.log('subscribe', v));

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
```

-   once

```ts
const a = interval(1000, true).take(5);
a.listen(true, console.log);
setTimeout(() => a.once().then((v) => console.log('once', v)), 2500);

/*
0
1
2
3
once 3
4

interval : 0 |0-----1-----2-----3-----4-----
                             ^  ^
                             |  |
                             |  +---once resolves
                             +---once is called
*/
```

## ToDo

-   GUI application for generating RN code from data-flow graph
-   add operators
