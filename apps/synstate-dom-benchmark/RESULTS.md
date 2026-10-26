# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36`. Each figure is the median of 8 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        22.75 |  18.30 |            18.20 |  17.15 |  19.55 |  20.25 |
| replace all 1,000 rows          |        24.90 |  19.65 |            25.00 |  23.10 |  22.05 |  21.65 |
| update every 10th of 1,000 rows |         9.85 |   8.00 |             7.90 |   9.30 |   7.90 |   7.85 |
| select a row                    |         4.60 |   4.20 |             4.40 |   4.30 |   4.50 |  26.15 |
| swap two rows                   |         6.10 |   4.50 |             4.95 |   5.05 |  18.50 |   4.45 |
| remove a row                    |         5.45 |   4.80 |             5.10 |   5.10 |   5.20 |   4.95 |
| create 10,000 rows              |       229.40 | 174.00 |           251.35 | 215.05 | 376.05 | 220.15 |
| append 1,000 to 1,000 rows      |        26.90 |  21.25 |            24.25 |  23.90 |  23.50 |  23.95 |
| clear 1,000 rows                |         7.60 |   5.80 |             5.90 |   4.20 |   6.15 |   6.30 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.80× |            0.80× |  0.75× | 0.86× | 0.89× |
| replace all 1,000 rows          | 0.79× |            1.00× |  0.93× | 0.89× | 0.87× |
| update every 10th of 1,000 rows | 0.81× |            0.80× |  0.94× | 0.80× | 0.80× |
| select a row                    | 0.91× |            0.96× |  0.93× | 0.98× | 5.68× |
| swap two rows                   | 0.74× |            0.81× |  0.83× | 3.03× | 0.73× |
| remove a row                    | 0.88× |            0.94× |  0.94× | 0.95× | 0.91× |
| create 10,000 rows              | 0.76× |            1.10× |  0.94× | 1.64× | 0.96× |
| append 1,000 to 1,000 rows      | 0.79× |            0.90× |  0.89× | 0.87× | 0.89× |
| clear 1,000 rows                | 0.76× |            0.78× |  0.55× | 0.81× | 0.83× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         1.87 |                          2.61 |  1.09 |             1.49 |   0.86 |  0.79 |  1.83 |
| loan: change the interest rate          |         1.04 |                          1.16 |  0.77 |             0.64 |   0.54 |  0.50 |  1.92 |
| loan: prepay in month 181               |         0.56 |                          0.61 |  0.43 |             0.34 |   0.34 |  0.30 | wrong |
| loan: prepay in month 349               |         0.11 |                          0.12 |  0.11 |             0.10 |   0.20 |  0.14 |  0.38 |
| schedule: build the schedule            |         6.32 |                          8.07 |  2.81 |             3.72 |   1.45 |  1.36 |  6.08 |
| schedule: lengthen the first task       |         2.54 |                          2.78 |  2.53 |             1.29 |   0.82 |  0.79 | wrong |
| schedule: lengthen a task in the middle |         1.46 |                          0.07 |  0.52 |             0.21 |   0.26 |  0.23 |  0.42 |
| schedule: lengthen a task near the end  |         1.19 |                          0.17 |  0.55 |             0.33 |   0.41 |  0.36 |  0.30 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |                         1.40× | 0.58× |            0.80× |  0.46× | 0.42× | 0.98× |
| loan: change the interest rate          |                         1.12× | 0.74× |            0.62× |  0.52× | 0.48× | 1.85× |
| loan: prepay in month 181               |                         1.09× | 0.77× |            0.61× |  0.61× | 0.54× |     – |
| loan: prepay in month 349               |                         1.09× | 1.00× |            0.91× |  1.82× | 1.27× | 3.45× |
| schedule: build the schedule            |                         1.28× | 0.44× |            0.59× |  0.23× | 0.22× | 0.96× |
| schedule: lengthen the first task       |                         1.09× | 1.00× |            0.51× |  0.32× | 0.31× |     – |
| schedule: lengthen a task in the middle |                         0.05× | 0.36× |            0.14× |  0.18× | 0.16× | 0.29× |
| schedule: lengthen a task near the end  |                         0.14× | 0.46× |            0.28× |  0.34× | 0.30× | 0.25× |
