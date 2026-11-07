# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 8 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        24.85 |  19.70 |            22.95 |  20.95 |  23.70 |  23.20 |
| replace all 1,000 rows          |        31.10 |  21.75 |            30.15 |  25.75 |  27.70 |  24.85 |
| update every 10th of 1,000 rows |         9.95 |   9.85 |            10.65 |  10.75 |  10.45 |   9.95 |
| select a row                    |         4.60 |   4.40 |             5.70 |   4.80 |   4.90 |  39.10 |
| swap two rows                   |         7.80 |   5.65 |             6.45 |   6.10 |  21.40 |   5.90 |
| remove a row                    |         6.45 |   5.40 |             6.05 |   5.70 |   5.50 |   5.15 |
| create 10,000 rows              |       280.00 | 178.95 |           265.00 | 220.05 | 461.00 | 240.30 |
| append 1,000 to 1,000 rows      |        34.90 |  24.00 |            29.45 |  27.80 |  28.40 |  28.00 |
| clear 1,000 rows                |         8.10 |   6.05 |             5.60 |   6.75 |   6.95 |   6.55 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.79× |            0.92× |  0.84× | 0.95× | 0.93× |
| replace all 1,000 rows          | 0.70× |            0.97× |  0.83× | 0.89× | 0.80× |
| update every 10th of 1,000 rows | 0.99× |            1.07× |  1.08× | 1.05× | 1.00× |
| select a row                    | 0.96× |            1.24× |  1.04× | 1.07× | 8.50× |
| swap two rows                   | 0.72× |            0.83× |  0.78× | 2.74× | 0.76× |
| remove a row                    | 0.84× |            0.94× |  0.88× | 0.85× | 0.80× |
| create 10,000 rows              | 0.64× |            0.95× |  0.79× | 1.65× | 0.86× |
| append 1,000 to 1,000 rows      | 0.69× |            0.84× |  0.80× | 0.81× | 0.80× |
| clear 1,000 rows                | 0.75× |            0.69× |  0.83× | 0.86× | 0.81× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         2.71 |                          5.72 |  1.57 |             1.76 |   0.99 |  0.97 |  2.26 |
| loan: change the interest rate          |         0.96 |                          1.32 |  1.10 |             0.87 |   0.74 |  0.69 |  2.92 |
| loan: prepay in month 181               |         0.53 |                          0.69 |  0.61 |             0.45 |   0.46 |  0.42 | wrong |
| loan: prepay in month 349               |         0.13 |                          0.13 |  0.14 |             0.14 |   0.25 |  0.23 |  0.65 |
| schedule: build the schedule            |        11.07 |                         15.59 |  3.51 |             3.94 |   1.91 |  1.56 |  9.69 |
| schedule: lengthen the first task       |         3.30 |                          3.97 |  4.00 |             1.82 |   1.11 |  1.07 | wrong |
| schedule: lengthen a task in the middle |         0.06 |                          0.07 |  0.84 |             0.31 |   0.36 |  0.33 |  0.65 |
| schedule: lengthen a task near the end  |         0.20 |                          0.22 |  0.85 |             0.47 |   0.59 |  0.54 |  0.40 |
| zoom: build the map                     |         7.62 |                         14.69 |  3.39 |             4.34 |   1.36 |  1.32 | 10.85 |
| zoom: zoom within a level               |         0.08 |                          0.07 |  0.69 |             0.48 |   0.37 |  0.31 |  0.09 |
| zoom: zoom to the next level            |         2.40 |                          2.91 |  3.26 |             1.92 |   1.12 |  1.12 |  5.94 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               | synstate-dom (skipIfNoChange) |  Solid | Preact + Signals | Preact | React |  VanJS |
| :-------------------------------------- | ----------------------------: | -----: | ---------------: | -----: | ----: | -----: |
| loan: build the table                   |                         2.11× |  0.58× |            0.65× |  0.37× | 0.36× |  0.83× |
| loan: change the interest rate          |                         1.38× |  1.15× |            0.91× |  0.77× | 0.72× |  3.04× |
| loan: prepay in month 181               |                         1.30× |  1.15× |            0.85× |  0.87× | 0.79× |      – |
| loan: prepay in month 349               |                         1.00× |  1.08× |            1.08× |  1.92× | 1.77× |  5.00× |
| schedule: build the schedule            |                         1.41× |  0.32× |            0.36× |  0.17× | 0.14× |  0.88× |
| schedule: lengthen the first task       |                         1.20× |  1.21× |            0.55× |  0.34× | 0.32× |      – |
| schedule: lengthen a task in the middle |                         1.17× | 14.00× |            5.17× |  6.00× | 5.50× | 10.83× |
| schedule: lengthen a task near the end  |                         1.10× |  4.25× |            2.35× |  2.95× | 2.70× |  2.00× |
| zoom: build the map                     |                         1.93× |  0.44× |            0.57× |  0.18× | 0.17× |  1.42× |
| zoom: zoom within a level               |                         0.88× |  8.63× |            6.00× |  4.63× | 3.88× |  1.13× |
| zoom: zoom to the next level            |                         1.21× |  1.36× |            0.80× |  0.47× | 0.47× |  2.48× |
