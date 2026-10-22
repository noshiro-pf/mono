# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36`. Each figure is the median of 5 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        31.20 |  25.60 |            30.40 |  27.70 |  26.20 |  26.90 |
| replace all 1,000 rows          |        34.70 |  29.90 |            37.90 |  33.80 |  31.40 |  33.00 |
| update every 10th of 1,000 rows |        11.70 |  10.00 |            10.50 |  11.20 |  10.20 |   9.80 |
| select a row                    |         4.80 |   4.30 |             4.80 |   4.30 |   4.60 |  29.00 |
| swap two rows                   |         6.90 |   5.70 |             6.00 |   6.00 |  27.10 |   5.70 |
| remove a row                    |         5.90 |   5.30 |             5.80 |   5.60 |   5.80 |   5.40 |
| create 10,000 rows              |       340.50 | 254.80 |           345.10 | 287.70 | 501.20 | 324.90 |
| append 1,000 to 1,000 rows      |        37.60 |  29.20 |            35.80 |  30.90 |  31.20 |  32.60 |
| clear 1,000 rows                |         8.70 |   6.30 |             6.70 |   7.80 |   6.80 |   6.10 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.82× |            0.97× |  0.89× | 0.84× | 0.86× |
| replace all 1,000 rows          | 0.86× |            1.09× |  0.97× | 0.90× | 0.95× |
| update every 10th of 1,000 rows | 0.85× |            0.90× |  0.96× | 0.87× | 0.84× |
| select a row                    | 0.90× |            1.00× |  0.90× | 0.96× | 6.04× |
| swap two rows                   | 0.83× |            0.87× |  0.87× | 3.93× | 0.83× |
| remove a row                    | 0.90× |            0.98× |  0.95× | 0.98× | 0.92× |
| create 10,000 rows              | 0.75× |            1.01× |  0.84× | 1.47× | 0.95× |
| append 1,000 to 1,000 rows      | 0.78× |            0.95× |  0.82× | 0.83× | 0.87× |
| clear 1,000 rows                | 0.72× |            0.77× |  0.90× | 0.78× | 0.70× |
