| Library                     |      B=2 |      B=5 |     B=10 |     B=20 |     B=50 |    B=100 |    B=200 |    B=500 |   B=1000 |
| --------------------------- | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: |
| **SynState** (switchMap)    |   2.4 ms |   2.3 ms |   1.8 ms |   1.7 ms |   2.7 ms |   1.7 ms |   1.8 ms |   1.9 ms |   2.9 ms |
| **SynState** (naive derive) |   9.7 ms |  11.9 ms |  15.7 ms |  22.5 ms |  45.5 ms |  87.5 ms | 166.8 ms | 418.9 ms | 790.6 ms |
| RxJS (switchMap)            |   2.9 ms |   2.4 ms |   2.3 ms |   2.3 ms |   2.4 ms |   2.5 ms |   2.5 ms |   2.6 ms |   2.7 ms |
| RxJS (naive combineLatest)  |   7.8 ms |   7.5 ms |   7.7 ms |   7.9 ms |   8.4 ms |  11.3 ms |  20.6 ms |  48.4 ms |  81.8 ms |
| Jotai                       | 106.7 ms | 106.5 ms | 110.4 ms | 107.6 ms | 108.8 ms | 108.4 ms | 107.3 ms | 106.5 ms | 104.8 ms |
| MobX                        |   1.4 ms |   1.2 ms |   1.2 ms |   1.2 ms |   1.3 ms |   1.3 ms |   1.3 ms |   1.3 ms |   1.3 ms |
| Redux                       |  96.4 ms |  94.2 ms |  98.5 ms |  98.2 ms |  97.3 ms | 115.8 ms | 117.3 ms | 141.5 ms | 174.6 ms |
| Solid                       |   0.9 ms |   0.8 ms |   0.5 ms |   0.5 ms |   0.5 ms |   0.5 ms |   0.6 ms |   0.6 ms |   0.6 ms |
| Preact Signals              |   0.8 ms |   0.8 ms |   0.8 ms |   0.8 ms |   0.8 ms |   0.7 ms |   0.8 ms |   0.9 ms |   1.0 ms |
