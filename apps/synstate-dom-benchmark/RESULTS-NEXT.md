# Results: synstate-dom-next

<!-- Written by `pnpm run benchmark:repeat -- --next`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 5 runs of `pnpm run benchmark:next`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom | synstate-dom-next |  Solid |
| :------------------------------ | -----------: | ----------------: | -----: |
| create 1,000 rows               |        27.90 |             26.70 |  22.40 |
| replace all 1,000 rows          |        32.20 |             30.20 |  23.00 |
| update every 10th of 1,000 rows |        10.20 |              9.30 |   9.20 |
| select a row                    |         4.70 |              4.20 |   4.30 |
| swap two rows                   |         5.50 |              5.50 |   5.50 |
| remove a row                    |         6.10 |              5.30 |   5.40 |
| create 10,000 rows              |       297.20 |            243.30 | 205.60 |
| append 1,000 to 1,000 rows      |        33.10 |             29.00 |  26.20 |
| clear 1,000 rows                |         8.00 |              6.20 |   6.20 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | synstate-dom-next | Solid |
| :------------------------------ | ----------------: | ----: |
| create 1,000 rows               |             0.96× | 0.80× |
| replace all 1,000 rows          |             0.94× | 0.71× |
| update every 10th of 1,000 rows |             0.91× | 0.90× |
| select a row                    |             0.89× | 0.91× |
| swap two rows                   |             1.00× | 1.00× |
| remove a row                    |             0.87× | 0.89× |
| create 10,000 rows              |             0.82× | 0.69× |
| append 1,000 to 1,000 rows      |             0.88× | 0.79× |
| clear 1,000 rows                |             0.78× | 0.78× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | synstate-dom (derive) | synstate-dom-next | Solid |
| :-------------------------------------- | -----------: | --------------------: | ----------------: | ----: |
| loan: build the table                   |         2.80 |                  3.04 |              1.64 |  1.56 |
| loan: change the interest rate          |         0.89 |                  0.79 |              0.68 |  1.11 |
| loan: prepay in month 181               |         0.48 |                  0.44 |              0.40 |  0.57 |
| loan: prepay in month 349               |         0.13 |                  0.12 |              0.11 |  0.14 |
| schedule: build the schedule            |        11.56 |                  8.68 |              3.82 |  3.72 |
| schedule: lengthen the first task       |         2.48 |                  1.68 |              1.30 |  3.52 |
| schedule: lengthen a task in the middle |         0.06 |                  0.05 |              0.05 |  0.63 |
| schedule: lengthen a task near the end  |         0.17 |                  0.19 |              0.17 |  0.76 |
| zoom: build the map                     |         8.06 |                  8.36 |              3.60 |  3.14 |
| zoom: zoom within a level               |         0.09 |                  0.08 |              0.08 |  0.56 |
| zoom: zoom to the next level            |         2.23 |                  2.30 |              1.72 |  3.31 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               | synstate-dom (derive) | synstate-dom-next |  Solid |
| :-------------------------------------- | --------------------: | ----------------: | -----: |
| loan: build the table                   |                 1.09× |             0.59× |  0.56× |
| loan: change the interest rate          |                 0.89× |             0.76× |  1.25× |
| loan: prepay in month 181               |                 0.92× |             0.83× |  1.19× |
| loan: prepay in month 349               |                 0.92× |             0.85× |  1.08× |
| schedule: build the schedule            |                 0.75× |             0.33× |  0.32× |
| schedule: lengthen the first task       |                 0.68× |             0.52× |  1.42× |
| schedule: lengthen a task in the middle |                 0.83× |             0.83× | 10.50× |
| schedule: lengthen a task near the end  |                 1.12× |             1.00× |  4.47× |
| zoom: build the map                     |                 1.04× |             0.45× |  0.39× |
| zoom: zoom within a level               |                 0.89× |             0.89× |  6.22× |
| zoom: zoom to the next level            |                 1.03× |             0.77× |  1.48× |
