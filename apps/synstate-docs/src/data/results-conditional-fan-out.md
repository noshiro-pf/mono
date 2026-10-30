| Library                  |      B=2 |      B=5 |     B=10 |     B=20 |     B=50 |    B=100 |    B=200 |     B=500 |    B=1000 |
| ------------------------ | -------: | -------: | -------: | -------: | -------: | -------: | -------: | --------: | --------: |
| **SynState**             |  36.2 ms |  45.6 ms |  64.5 ms | 104.2 ms | 213.6 ms | 403.6 ms | 764.1 ms | 1935.0 ms | 3708.0 ms |
| **SynState** (switchMap) |   4.6 ms |   4.0 ms |   4.0 ms |   4.0 ms |   4.1 ms |   4.0 ms |   4.0 ms |    4.0 ms |    4.1 ms |
| RxJS                     |   8.5 ms |   8.6 ms |   8.9 ms |   8.8 ms |  10.0 ms |  12.0 ms |  19.5 ms |   39.2 ms |   71.3 ms |
| RxJS (switchMap)         |   2.9 ms |   2.8 ms |   2.9 ms |   2.9 ms |   2.9 ms |   2.9 ms |   2.9 ms |    3.0 ms |    3.0 ms |
| Jotai                    | 139.3 ms | 138.2 ms | 137.7 ms | 138.3 ms | 138.1 ms | 138.4 ms | 138.8 ms |  138.3 ms |  138.5 ms |
| MobX                     |   1.6 ms |   1.5 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |   1.4 ms |    1.5 ms |    1.5 ms |
| Redux                    | 132.3 ms | 132.6 ms | 129.9 ms | 130.7 ms | 126.0 ms | 129.8 ms | 137.3 ms |  155.1 ms |  187.5 ms |
| Solid                    |   0.8 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |   0.7 ms |    0.8 ms |    0.8 ms |
| Preact Signals           |   1.1 ms |   1.0 ms |   1.0 ms |   1.1 ms |   1.0 ms |   1.0 ms |   1.0 ms |    1.1 ms |    1.2 ms |
