# Results

<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->

Measured in `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36` with 4 logical cores. Each figure is the median of the timed runs after 3 warm-up runs; see README.md for what is timed.

| operation (median ms)           | synstate-dom |  Solid | Preact + Signals |  VanJS |
| :------------------------------ | -----------: | -----: | ---------------: | -----: |
| create 1,000 rows               |        81.10 |  37.60 |            47.90 |  40.80 |
| replace all 1,000 rows          |       114.90 |  44.60 |            56.00 |  46.90 |
| update every 10th of 1,000 rows |        25.00 |  17.50 |            17.20 |  17.60 |
| select a row                    |         5.70 |   5.30 |             6.20 |  61.50 |
| swap two rows                   |        17.00 |   8.00 |             8.90 |  11.00 |
| remove a row                    |        19.00 |   7.30 |            13.60 |  14.00 |
| create 10,000 rows              |      1131.40 | 412.50 |           482.10 | 496.40 |
| append 1,000 to 1,000 rows      |       106.40 |  45.80 |            60.00 |  59.50 |
| clear 1,000 rows                |        32.80 |   8.30 |             7.80 |   9.30 |
