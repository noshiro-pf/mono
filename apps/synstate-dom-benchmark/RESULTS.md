# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36`. Each figure is the median of 5 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        23.80 |  19.50 |            19.80 |  16.30 |  19.80 |  19.90 |
| replace all 1,000 rows          |        25.50 |  19.40 |            25.80 |  23.50 |  21.70 |  22.30 |
| update every 10th of 1,000 rows |        10.30 |   8.70 |             8.90 |   9.80 |   8.80 |   9.30 |
| select a row                    |         4.60 |   4.30 |             4.40 |   4.20 |   4.50 |  23.20 |
| swap two rows                   |         6.90 |   4.90 |             5.30 |   4.90 |  19.00 |   5.00 |
| remove a row                    |         5.80 |   5.40 |             4.90 |   5.00 |   5.30 |   4.80 |
| create 10,000 rows              |       226.70 | 186.10 |           238.00 | 197.50 | 365.40 | 209.40 |
| append 1,000 to 1,000 rows      |        27.30 |  22.20 |            25.30 |  24.20 |  23.00 |  24.90 |
| clear 1,000 rows                |         7.70 |   5.90 |             5.10 |   4.20 |   6.30 |   6.30 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.82× |            0.83× |  0.68× | 0.83× | 0.84× |
| replace all 1,000 rows          | 0.76× |            1.01× |  0.92× | 0.85× | 0.87× |
| update every 10th of 1,000 rows | 0.84× |            0.86× |  0.95× | 0.85× | 0.90× |
| select a row                    | 0.93× |            0.96× |  0.91× | 0.98× | 5.04× |
| swap two rows                   | 0.71× |            0.77× |  0.71× | 2.75× | 0.72× |
| remove a row                    | 0.93× |            0.84× |  0.86× | 0.91× | 0.83× |
| create 10,000 rows              | 0.82× |            1.05× |  0.87× | 1.61× | 0.92× |
| append 1,000 to 1,000 rows      | 0.81× |            0.93× |  0.89× | 0.84× | 0.91× |
| clear 1,000 rows                | 0.77× |            0.66× |  0.55× | 0.82× | 0.82× |
