# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36`. Each figure is the median of 5 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        23.10 |  17.20 |            19.80 |  17.60 |  19.50 |  20.00 |
| replace all 1,000 rows          |        25.50 |  19.90 |            26.30 |  23.10 |  21.50 |  22.30 |
| update every 10th of 1,000 rows |        10.80 |   8.70 |             9.20 |   9.20 |   8.80 |   8.80 |
| select a row                    |         4.60 |   4.20 |             4.40 |   4.30 |   4.50 |  27.80 |
| swap two rows                   |         6.50 |   5.00 |             5.50 |   5.40 |  18.70 |   5.40 |
| remove a row                    |         5.90 |   5.10 |             4.80 |   5.10 |   5.30 |   5.30 |
| create 10,000 rows              |       239.40 | 178.10 |           231.30 | 205.80 | 377.70 | 246.60 |
| append 1,000 to 1,000 rows      |        27.70 |  22.00 |            24.30 |  23.80 |  23.90 |  26.30 |
| clear 1,000 rows                |         7.60 |   5.80 |             5.40 |   4.20 |   6.30 |   5.90 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.74× |            0.86× |  0.76× | 0.84× | 0.87× |
| replace all 1,000 rows          | 0.78× |            1.03× |  0.91× | 0.84× | 0.87× |
| update every 10th of 1,000 rows | 0.81× |            0.85× |  0.85× | 0.81× | 0.81× |
| select a row                    | 0.91× |            0.96× |  0.93× | 0.98× | 6.04× |
| swap two rows                   | 0.77× |            0.85× |  0.83× | 2.88× | 0.83× |
| remove a row                    | 0.86× |            0.81× |  0.86× | 0.90× | 0.90× |
| create 10,000 rows              | 0.74× |            0.97× |  0.86× | 1.58× | 1.03× |
| append 1,000 to 1,000 rows      | 0.79× |            0.88× |  0.86× | 0.86× | 0.95× |
| clear 1,000 rows                | 0.76× |            0.71× |  0.55× | 0.83× | 0.78× |
