| Library                  |      B=2 |      B=5 |     B=10 |     B=20 |     B=50 |    B=100 |    B=200 |    B=500 |   B=1000 |
| ------------------------ | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: | -------: |
| **SynState**             |  10.9 ms |  11.6 ms |  14.3 ms |  20.2 ms |  38.9 ms |  71.6 ms | 140.3 ms | 312.4 ms | 685.7 ms |
| **SynState** (switchMap) |   4.8 ms |   3.4 ms |   3.4 ms |   3.5 ms |   3.8 ms |   3.5 ms |   3.6 ms |   6.2 ms |   4.0 ms |
| RxJS                     |   8.8 ms |   8.4 ms |   8.5 ms |   8.8 ms |  10.5 ms |  11.5 ms |  17.0 ms |  33.6 ms |  60.4 ms |
| RxJS (switchMap)         |   3.4 ms |   2.9 ms |   2.8 ms |   2.8 ms |   2.8 ms |   2.8 ms |   2.8 ms |   3.0 ms |   3.2 ms |
| Jotai                    | 136.2 ms | 135.6 ms | 135.7 ms | 136.6 ms | 136.3 ms | 135.6 ms | 135.9 ms | 135.7 ms | 136.3 ms |
| MobX                     |   1.5 ms |   1.5 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.5 ms |   1.5 ms |
| Redux                    | 117.4 ms | 116.7 ms | 118.8 ms | 122.7 ms | 118.8 ms | 125.2 ms | 129.4 ms | 151.8 ms | 178.9 ms |
| Solid                    |   1.1 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.9 ms |
| Preact Signals           |   1.2 ms |   1.1 ms |   1.1 ms |   1.1 ms |   1.1 ms |   1.1 ms |   1.1 ms |   1.2 ms |   1.4 ms |
