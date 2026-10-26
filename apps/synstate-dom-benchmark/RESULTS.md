# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 8 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        30.80 |  22.95 |            26.90 |  24.75 |  27.10 |  29.65 |
| replace all 1,000 rows          |        34.35 |  25.20 |            36.15 |  34.75 |  33.90 |  32.75 |
| update every 10th of 1,000 rows |         9.75 |  10.00 |            10.50 |  10.95 |  10.30 |  10.35 |
| select a row                    |         4.90 |   4.35 |             5.35 |   5.10 |   4.80 |  36.55 |
| swap two rows                   |         7.15 |   5.60 |             7.15 |   6.60 |  26.90 |   5.25 |
| remove a row                    |         5.75 |   5.50 |             6.15 |   6.75 |   5.75 |   5.85 |
| create 10,000 rows              |       298.20 | 195.15 |           329.30 | 291.80 | 533.55 | 287.85 |
| append 1,000 to 1,000 rows      |        33.85 |  26.95 |            36.10 |  30.05 |  34.85 |  31.35 |
| clear 1,000 rows                |         7.45 |   6.15 |             6.40 |   5.80 |   7.55 |   6.60 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.75× |            0.87× |  0.80× | 0.88× | 0.96× |
| replace all 1,000 rows          | 0.73× |            1.05× |  1.01× | 0.99× | 0.95× |
| update every 10th of 1,000 rows | 1.03× |            1.08× |  1.12× | 1.06× | 1.06× |
| select a row                    | 0.89× |            1.09× |  1.04× | 0.98× | 7.46× |
| swap two rows                   | 0.78× |            1.00× |  0.92× | 3.76× | 0.73× |
| remove a row                    | 0.96× |            1.07× |  1.17× | 1.00× | 1.02× |
| create 10,000 rows              | 0.65× |            1.10× |  0.98× | 1.79× | 0.97× |
| append 1,000 to 1,000 rows      | 0.80× |            1.07× |  0.89× | 1.03× | 0.93× |
| clear 1,000 rows                | 0.83× |            0.86× |  0.78× | 1.01× | 0.89× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         2.72 |                          3.66 |  1.68 |             2.04 |   1.20 |  1.16 |  2.45 |
| loan: change the interest rate          |         1.41 |                          1.68 |  1.23 |             0.90 |   0.85 |  0.75 |  3.19 |
| loan: prepay in month 181               |         0.80 |                          0.91 |  0.63 |             0.52 |   0.53 |  0.48 | wrong |
| loan: prepay in month 349               |         0.18 |                          0.18 |  0.16 |             0.16 |   0.29 |  0.24 |  0.63 |
| schedule: build the schedule            |        11.45 |                         13.37 |  4.14 |             5.07 |   1.93 |  1.90 | 10.02 |
| schedule: lengthen the first task       |         3.45 |                          3.95 |  3.69 |             1.83 |   1.15 |  1.07 | wrong |
| schedule: lengthen a task in the middle |         2.04 |                          0.10 |  0.72 |             0.34 |   0.40 |  0.35 |  0.72 |
| schedule: lengthen a task near the end  |         1.70 |                          0.24 |  0.78 |             0.49 |   0.63 |  0.59 |  0.43 |
| zoom: build the map                     |         7.02 |                         14.25 |  3.85 |             4.17 |   1.51 |  1.65 | 11.53 |
| zoom: zoom within a level               |         2.17 |                          0.09 |  0.63 |             0.46 |   0.38 |  0.38 |  0.10 |
| zoom: zoom to the next level            |         2.86 |                          3.38 |  3.43 |             2.11 |   1.21 |  1.21 |  6.01 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |                         1.35× | 0.62× |            0.75× |  0.44× | 0.43× | 0.90× |
| loan: change the interest rate          |                         1.19× | 0.87× |            0.64× |  0.60× | 0.53× | 2.26× |
| loan: prepay in month 181               |                         1.14× | 0.79× |            0.65× |  0.66× | 0.60× |     – |
| loan: prepay in month 349               |                         1.00× | 0.89× |            0.89× |  1.61× | 1.33× | 3.50× |
| schedule: build the schedule            |                         1.17× | 0.36× |            0.44× |  0.17× | 0.17× | 0.88× |
| schedule: lengthen the first task       |                         1.14× | 1.07× |            0.53× |  0.33× | 0.31× |     – |
| schedule: lengthen a task in the middle |                         0.05× | 0.35× |            0.17× |  0.20× | 0.17× | 0.35× |
| schedule: lengthen a task near the end  |                         0.14× | 0.46× |            0.29× |  0.37× | 0.35× | 0.25× |
| zoom: build the map                     |                         2.03× | 0.55× |            0.59× |  0.22× | 0.24× | 1.64× |
| zoom: zoom within a level               |                         0.04× | 0.29× |            0.21× |  0.18× | 0.18× | 0.05× |
| zoom: zoom to the next level            |                         1.18× | 1.20× |            0.74× |  0.42× | 0.42× | 2.10× |
