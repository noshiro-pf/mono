# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 8 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        55.15 |  37.85 |            40.20 |  42.85 |  44.25 |  36.60 |
| replace all 1,000 rows          |        62.85 |  38.20 |            49.70 |  46.55 |  52.10 |  47.90 |
| update every 10th of 1,000 rows |        22.70 |  17.90 |            14.45 |  16.75 |  19.45 |  15.50 |
| select a row                    |         0.50 |   0.13 |             1.03 |   1.77 |   0.70 |  62.20 |
| swap two rows                   |         5.77 |   3.75 |             5.81 |   6.05 |  46.67 |   2.74 |
| remove a row                    |         8.03 |   5.29 |             7.57 |   7.26 |   6.19 |   5.58 |
| create 10,000 rows              |       504.30 | 388.55 |           556.95 | 493.85 | 745.80 | 534.45 |
| append 1,000 to 1,000 rows      |        67.60 |  43.80 |            56.35 |  54.35 |  57.15 |  60.80 |
| clear 1,000 rows                |        10.10 |   5.45 |            10.20 |  10.10 |   8.70 |   7.50 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React |   VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ------: |
| create 1,000 rows               | 0.69× |            0.73× |  0.78× | 0.80× |   0.66× |
| replace all 1,000 rows          | 0.61× |            0.79× |  0.74× | 0.83× |   0.76× |
| update every 10th of 1,000 rows | 0.79× |            0.64× |  0.74× | 0.86× |   0.68× |
| select a row                    | 0.26× |            2.06× |  3.54× | 1.40× | 124.40× |
| swap two rows                   | 0.65× |            1.01× |  1.05× | 8.09× |   0.47× |
| remove a row                    | 0.66× |            0.94× |  0.90× | 0.77× |   0.69× |
| create 10,000 rows              | 0.77× |            1.10× |  0.98× | 1.48× |   1.06× |
| append 1,000 to 1,000 rows      | 0.65× |            0.83× |  0.80× | 0.85× |   0.90× |
| clear 1,000 rows                | 0.54× |            1.01× |  1.00× | 0.86× |   0.74× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         7.07 |                         11.48 |  3.47 |             3.74 |   1.73 |  2.35 |  6.58 |
| loan: change the interest rate          |         1.97 |                          4.68 |  2.96 |             1.41 |   1.42 |  1.76 |  6.42 |
| loan: prepay in month 181               |         1.13 |                          2.29 |  1.16 |             0.71 |   1.12 |  0.72 | wrong |
| loan: prepay in month 349               |         0.32 |                          0.47 |  0.32 |             0.34 |   0.79 |  0.45 |  1.10 |
| schedule: build the schedule            |        24.35 |                         27.64 |  6.56 |             9.90 |   2.72 |  2.68 | 16.55 |
| schedule: lengthen the first task       |         8.54 |                         10.79 |  7.70 |             3.57 |   1.97 |  1.70 | wrong |
| schedule: lengthen a task in the middle |         0.12 |                          0.13 |  0.95 |             0.49 |   0.88 |  0.51 |  1.17 |
| schedule: lengthen a task near the end  |         0.55 |                          0.38 |  1.20 |             0.66 |   1.00 |  0.82 |  0.93 |
| zoom: build the map                     |        14.67 |                         26.25 |  8.40 |             9.05 |   2.12 |  2.57 | 23.29 |
| zoom: zoom within a level               |         0.17 |                          0.22 |  1.13 |             0.65 |   0.61 |  0.53 |  0.24 |
| zoom: zoom to the next level            |         3.38 |                          5.70 |  6.79 |             4.02 |   1.90 |  1.90 | 12.34 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               | synstate-dom (skipIfNoChange) | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | ----------------------------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |                         1.62× | 0.49× |            0.53× |  0.24× | 0.33× | 0.93× |
| loan: change the interest rate          |                         2.38× | 1.50× |            0.72× |  0.72× | 0.89× | 3.26× |
| loan: prepay in month 181               |                         2.03× | 1.03× |            0.63× |  0.99× | 0.64× |     – |
| loan: prepay in month 349               |                         1.47× | 1.00× |            1.06× |  2.47× | 1.41× | 3.44× |
| schedule: build the schedule            |                         1.14× | 0.27× |            0.41× |  0.11× | 0.11× | 0.68× |
| schedule: lengthen the first task       |                         1.26× | 0.90× |            0.42× |  0.23× | 0.20× |     – |
| schedule: lengthen a task in the middle |                         1.08× | 7.92× |            4.08× |  7.33× | 4.25× | 9.75× |
| schedule: lengthen a task near the end  |                         0.69× | 2.18× |            1.20× |  1.82× | 1.49× | 1.69× |
| zoom: build the map                     |                         1.79× | 0.57× |            0.62× |  0.14× | 0.18× | 1.59× |
| zoom: zoom within a level               |                         1.29× | 6.65× |            3.82× |  3.59× | 3.12× | 1.41× |
| zoom: zoom to the next level            |                         1.69× | 2.01× |            1.19× |  0.56× | 0.56× | 3.65× |
