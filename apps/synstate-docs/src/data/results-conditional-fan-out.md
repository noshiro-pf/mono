| Library                     |      B=2 |      B=5 |     B=10 |     B=20 |     B=50 |    B=100 |    B=200 |    B=500 |   B=1000 |
| --------------------------- | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: |
| **SynState** (switchMap)    |   2.1 ms |   2.0 ms |   1.6 ms |   1.7 ms |   1.7 ms |   1.7 ms |   1.8 ms |   5.9 ms |   2.1 ms |
| **SynState** (naive derive) |  11.4 ms |  12.1 ms |  14.9 ms |  20.3 ms |  37.9 ms |  68.4 ms | 131.6 ms | 310.2 ms | 638.6 ms |
| RxJS (switchMap)            |   3.4 ms |   2.9 ms |   2.8 ms |   2.9 ms |   2.8 ms |   2.9 ms |   3.0 ms |   3.1 ms |   3.2 ms |
| RxJS (naive combineLatest)  |   8.5 ms |   8.3 ms |   8.7 ms |   9.1 ms |  10.0 ms |  10.8 ms |  17.2 ms |  30.2 ms |  57.8 ms |
| Jotai                       | 137.7 ms | 138.6 ms | 138.7 ms | 137.3 ms | 137.5 ms | 137.5 ms | 136.1 ms | 138.6 ms | 138.2 ms |
| MobX                        |   1.5 ms |   1.5 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.5 ms |   1.5 ms |
| Redux                       | 136.2 ms | 133.8 ms | 134.8 ms | 118.7 ms | 125.1 ms | 130.8 ms | 133.5 ms | 150.8 ms | 180.8 ms |
| Solid                       |   1.0 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.8 ms |
| Preact Signals              |   1.1 ms |   1.0 ms |   1.1 ms |   1.0 ms |   0.9 ms |   1.1 ms |   1.1 ms |   1.1 ms |   1.3 ms |
