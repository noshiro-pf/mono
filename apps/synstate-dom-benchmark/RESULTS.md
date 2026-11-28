# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/157.0.8103.78 Safari/537.36`. Each figure is the median of 5 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        19.90 |  18.20 |            19.40 |  17.40 |  18.70 |  17.90 |
| replace all 1,000 rows          |        21.30 |  19.00 |            25.70 |  21.30 |  22.20 |  19.40 |
| update every 10th of 1,000 rows |         7.90 |   7.60 |             8.10 |   8.30 |   8.00 |   8.20 |
| select a row                    |         4.20 |   4.20 |             5.50 |   4.30 |   4.60 |  34.80 |
| swap two rows                   |         4.70 |   4.40 |             5.30 |   5.10 |  17.90 |   5.00 |
| remove a row                    |         5.80 |   4.80 |             5.80 |   5.00 |   5.60 |   5.40 |
| create 10,000 rows              |       191.70 | 154.10 |           214.60 | 173.70 | 357.30 | 188.60 |
| append 1,000 to 1,000 rows      |        22.40 |  18.60 |            22.80 |  22.50 |  23.40 |  23.40 |
| clear 1,000 rows                |         6.00 |   5.70 |             4.70 |   4.20 |   6.70 |   5.10 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.91× |            0.97× |  0.87× | 0.94× | 0.90× |
| replace all 1,000 rows          | 0.89× |            1.21× |  1.00× | 1.04× | 0.91× |
| update every 10th of 1,000 rows | 0.96× |            1.03× |  1.05× | 1.01× | 1.04× |
| select a row                    | 1.00× |            1.31× |  1.02× | 1.10× | 8.29× |
| swap two rows                   | 0.94× |            1.13× |  1.09× | 3.81× | 1.06× |
| remove a row                    | 0.83× |            1.00× |  0.86× | 0.97× | 0.93× |
| create 10,000 rows              | 0.80× |            1.12× |  0.91× | 1.86× | 0.98× |
| append 1,000 to 1,000 rows      | 0.83× |            1.02× |  1.00× | 1.04× | 1.04× |
| clear 1,000 rows                | 0.95× |            0.78× |  0.70× | 1.12× | 0.85× |

## Scenarios

The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time. The medians are taken as above.

| operation (median ms)                   | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| loan: build the table                   |         1.28 |  1.16 |             1.26 |   0.74 |  0.70 |  1.72 |
| loan: change the interest rate          |         0.58 |  0.78 |             0.59 |   0.51 |  0.47 |  2.03 |
| loan: prepay in month 181               |         0.28 |  0.39 |             0.31 |   0.35 |  0.28 | wrong |
| loan: prepay in month 349               |         0.07 |  0.11 |             0.10 |   0.17 |  0.13 |  0.38 |
| schedule: build the schedule            |         2.88 |  2.58 |             3.88 |   1.30 |  1.16 |  6.24 |
| schedule: lengthen the first task       |         1.01 |  2.70 |             1.21 |   0.78 |  0.74 | wrong |
| schedule: lengthen a task in the middle |         0.03 |  0.53 |             0.22 |   0.26 |  0.21 |  0.47 |
| schedule: lengthen a task near the end  |         0.13 |  0.53 |             0.30 |   0.39 |  0.34 |  0.28 |
| zoom: build the map                     |         4.06 |  2.52 |             3.80 |   1.04 |  0.96 |  8.68 |
| zoom: zoom within a level               |         0.06 |  0.61 |             0.32 |   0.26 |  0.24 |  0.07 |
| zoom: zoom to the next level            |         1.23 |  2.69 |             1.51 |   0.79 |  0.78 |  4.19 |

### Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                               |  Solid | Preact + Signals | Preact | React |  VanJS |
| :-------------------------------------- | -----: | ---------------: | -----: | ----: | -----: |
| loan: build the table                   |  0.91× |            0.98× |  0.58× | 0.55× |  1.34× |
| loan: change the interest rate          |  1.34× |            1.02× |  0.88× | 0.81× |  3.50× |
| loan: prepay in month 181               |  1.39× |            1.11× |  1.25× | 1.00× |      – |
| loan: prepay in month 349               |  1.57× |            1.43× |  2.43× | 1.86× |  5.43× |
| schedule: build the schedule            |  0.90× |            1.35× |  0.45× | 0.40× |  2.17× |
| schedule: lengthen the first task       |  2.67× |            1.20× |  0.77× | 0.73× |      – |
| schedule: lengthen a task in the middle | 17.67× |            7.33× |  8.67× | 7.00× | 15.67× |
| schedule: lengthen a task near the end  |  4.08× |            2.31× |  3.00× | 2.62× |  2.15× |
| zoom: build the map                     |  0.62× |            0.94× |  0.26× | 0.24× |  2.14× |
| zoom: zoom within a level               | 10.17× |            5.33× |  4.33× | 4.00× |  1.17× |
| zoom: zoom to the next level            |  2.19× |            1.23× |  0.64× | 0.63× |  3.41× |
