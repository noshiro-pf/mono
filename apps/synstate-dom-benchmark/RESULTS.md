# Results

<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.37 Safari/537.36` with 4 logical cores. Each figure is the median of the timed runs after 3 warm-up runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: |
| create 1,000 rows               |        39.30 |  27.10 |            29.10 |  28.80 |
| replace all 1,000 rows          |        38.10 |  28.70 |            35.50 |  33.40 |
| update every 10th of 1,000 rows |        12.20 |  10.20 |            10.70 |  10.20 |
| select a row                    |         5.50 |   4.30 |             4.60 |  28.30 |
| swap two rows                   |         9.10 |   5.50 |             6.60 |   5.50 |
| remove a row                    |         6.60 |   5.40 |             6.00 |   5.20 |
| create 10,000 rows              |       366.20 | 252.50 |           327.60 | 310.70 |
| append 1,000 to 1,000 rows      |        38.50 |  32.70 |            36.10 |  40.80 |
| clear 1,000 rows                |         9.60 |   6.90 |             8.40 |   6.70 |
