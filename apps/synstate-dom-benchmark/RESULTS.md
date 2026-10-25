# Results

<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`. Each figure is the median of 8 runs of `pnpm run benchmark`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| create 1,000 rows               |        21.05 |  16.85 |            17.85 |  15.25 |  19.70 |  18.15 |
| replace all 1,000 rows          |        24.40 |  17.60 |            23.25 |  21.45 |  21.45 |  20.15 |
| update every 10th of 1,000 rows |        10.65 |   8.45 |             8.70 |   9.05 |   9.40 |   9.00 |
| select a row                    |         4.65 |   4.20 |             4.75 |   4.20 |   4.55 |  29.15 |
| swap two rows                   |         6.10 |   4.85 |             5.00 |   5.60 |  17.05 |   5.05 |
| remove a row                    |         6.60 |   4.70 |             4.95 |   5.20 |   5.35 |   5.40 |
| create 10,000 rows              |       216.55 | 148.95 |           216.35 | 180.35 | 363.60 | 200.95 |
| append 1,000 to 1,000 rows      |        25.10 |  20.35 |            23.45 |  22.30 |  22.35 |  22.90 |
| clear 1,000 rows                |         7.75 |   5.50 |             6.45 |   4.20 |   6.20 |   6.40 |

## Relative to synstate-dom

Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.

| operation                       | Solid | Preact + Signals | Preact | React | VanJS |
| :------------------------------ | ----: | ---------------: | -----: | ----: | ----: |
| create 1,000 rows               | 0.80× |            0.85× |  0.72× | 0.94× | 0.86× |
| replace all 1,000 rows          | 0.72× |            0.95× |  0.88× | 0.88× | 0.83× |
| update every 10th of 1,000 rows | 0.79× |            0.82× |  0.85× | 0.88× | 0.85× |
| select a row                    | 0.90× |            1.02× |  0.90× | 0.98× | 6.27× |
| swap two rows                   | 0.80× |            0.82× |  0.92× | 2.80× | 0.83× |
| remove a row                    | 0.71× |            0.75× |  0.79× | 0.81× | 0.82× |
| create 10,000 rows              | 0.69× |            1.00× |  0.83× | 1.68× | 0.93× |
| append 1,000 to 1,000 rows      | 0.81× |            0.93× |  0.89× | 0.89× | 0.91× |
| clear 1,000 rows                | 0.71× |            0.83× |  0.54× | 0.80× | 0.83× |
