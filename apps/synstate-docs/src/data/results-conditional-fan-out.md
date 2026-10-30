| Library                     |      B=2 |      B=5 |     B=10 |     B=20 |     B=50 |    B=100 |    B=200 |    B=500 |   B=1000 |
| --------------------------- | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: |
| **SynState** (switchMap)    |   2.2 ms |   2.1 ms |   1.7 ms |   1.7 ms |   1.8 ms |   1.7 ms |   1.8 ms |   6.2 ms |   2.2 ms |
| **SynState** (naive derive) |  10.6 ms |  11.5 ms |  14.3 ms |  19.8 ms |  37.5 ms |  68.5 ms | 132.2 ms | 317.0 ms | 630.2 ms |
| RxJS (switchMap)            |   3.4 ms |   2.9 ms |   2.9 ms |   2.9 ms |   2.9 ms |   2.9 ms |   2.9 ms |   3.0 ms |   3.3 ms |
| RxJS (naive combineLatest)  |   8.2 ms |   8.4 ms |   8.4 ms |   8.7 ms |  10.6 ms |  10.9 ms |  18.0 ms |  33.1 ms |  61.3 ms |
| Jotai                       | 138.1 ms | 138.0 ms | 137.8 ms | 137.4 ms | 138.3 ms | 137.1 ms | 138.1 ms | 137.1 ms | 137.3 ms |
| MobX                        |   1.6 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.5 ms |   1.5 ms |
| Redux                       | 146.1 ms | 145.1 ms | 135.8 ms | 142.7 ms | 136.4 ms | 143.6 ms | 146.4 ms | 168.5 ms | 197.5 ms |
| Solid                       |   1.1 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.9 ms |
| Preact Signals              |   1.1 ms |   1.1 ms |   1.1 ms |   1.1 ms |   1.0 ms |   1.1 ms |   1.1 ms |   1.3 ms |   1.3 ms |
