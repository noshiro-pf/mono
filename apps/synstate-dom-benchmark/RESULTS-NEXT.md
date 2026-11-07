# Results: synstate-dom-next

<!-- Written by `pnpm run benchmark:repeat -- --next`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 5 runs of `pnpm run benchmark:next`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom | synstate-dom-next |  Solid |
| :------------------------------ | -----------: | ----------------: | -----: |
| create 1,000 rows               |        21.30 |             19.80 |  16.30 |
| replace all 1,000 rows          |        21.00 |             19.70 |  18.10 |
| update every 10th of 1,000 rows |         7.80 |              8.80 |   9.20 |
| select a row                    |         4.30 |              4.20 |   4.20 |
| swap two rows                   |         6.30 |              5.50 |   5.10 |
| remove a row                    |         6.30 |              6.40 |   4.80 |
| create 10,000 rows              |       195.00 |            187.20 | 149.40 |
| append 1,000 to 1,000 rows      |        23.70 |             23.90 |  19.80 |
| clear 1,000 rows                |         6.20 |              5.80 |   5.60 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | synstate-dom-next | Solid |
| :------------------------------ | ----------------: | ----: |
| create 1,000 rows               |             0.93× | 0.77× |
| replace all 1,000 rows          |             0.94× | 0.86× |
| update every 10th of 1,000 rows |             1.13× | 1.18× |
| select a row                    |             0.98× | 0.98× |
| swap two rows                   |             0.87× | 0.81× |
| remove a row                    |             1.02× | 0.76× |
| create 10,000 rows              |             0.96× | 0.77× |
| append 1,000 to 1,000 rows      |             1.01× | 0.84× |
| clear 1,000 rows                |             0.94× | 0.90× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | synstate-dom (derive) | synstate-dom-next | Solid |
| :-------------------------------------- | -----------: | ----------------------------: | --------------------: | ----------------: | ----: |
| loan: build the table                   |         2.06 |                          4.32 |                  1.94 |              1.28 |  1.28 |
| loan: change the interest rate          |         0.73 |                          0.76 |                  0.65 |              0.57 |  0.99 |
| loan: prepay in month 181               |         0.40 |                          0.44 |                  0.37 |              0.33 |  0.49 |
| loan: prepay in month 349               |         0.09 |                          0.10 |                  0.09 |              0.09 |  0.11 |
| schedule: build the schedule            |         6.96 |                         11.06 |                  4.72 |              3.00 |  2.96 |
| schedule: lengthen the first task       |         2.26 |                          2.73 |                  1.35 |              1.24 |  3.38 |
| schedule: lengthen a task in the middle |         0.04 |                          0.05 |                  0.04 |              0.04 |  0.81 |
| schedule: lengthen a task near the end  |         0.14 |                          0.14 |                  0.15 |              0.13 |  0.74 |
| zoom: build the map                     |         4.42 |                          9.92 |                  4.54 |              3.48 |  2.50 |
| zoom: zoom within a level               |         0.06 |                          0.06 |                  0.06 |              0.06 |  0.56 |
| zoom: zoom to the next level            |         1.51 |                          1.99 |                  1.49 |              1.38 |  2.44 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               | synstate-dom (skipIfNoChange) | synstate-dom (derive) | synstate-dom-next |  Solid |
| :-------------------------------------- | ----------------------------: | --------------------: | ----------------: | -----: |
| loan: build the table                   |                         2.10× |                 0.94× |             0.62× |  0.62× |
| loan: change the interest rate          |                         1.04× |                 0.89× |             0.78× |  1.36× |
| loan: prepay in month 181               |                         1.10× |                 0.92× |             0.82× |  1.22× |
| loan: prepay in month 349               |                         1.11× |                 1.00× |             1.00× |  1.22× |
| schedule: build the schedule            |                         1.59× |                 0.68× |             0.43× |  0.43× |
| schedule: lengthen the first task       |                         1.21× |                 0.60× |             0.55× |  1.50× |
| schedule: lengthen a task in the middle |                         1.25× |                 1.00× |             1.00× | 20.25× |
| schedule: lengthen a task near the end  |                         1.00× |                 1.07× |             0.93× |  5.29× |
| zoom: build the map                     |                         2.24× |                 1.03× |             0.79× |  0.57× |
| zoom: zoom within a level               |                         1.00× |                 1.00× |             1.00× |  9.33× |
| zoom: zoom to the next level            |                         1.32× |                 0.99× |             0.91× |  1.62× |
