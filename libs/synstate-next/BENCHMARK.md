# Benchmark: synstate-next and synstate

<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->

Measured with Node.js v26.13.0 on Intel(R) Xeon(R) Processor @ 2.10GHz. Each figure is the median time of one operation, in nanoseconds, of 6 processes per library, each the median of 21 samples after 10 warm-up samples; see `scripts/cmd/benchmark.mts` for the scenarios. The last column is synstate-next's time divided by synstate's: below 1 is faster than synstate, above 1 slower.

| scenario (median ns per operation)                        | synstate | synstate-next | synstate-next / synstate |
| :-------------------------------------------------------- | -------: | ------------: | -----------------------: |
| write a state with one subscriber                         |     53.5 |          56.1 |                    1.05× |
| a chain of 100 maps                                       |     5786 |          4368 |                    0.75× |
| a diamond: two maps joined by derive                      |      222 |           189 |                    0.85× |
| 50 diamonds in a row                                      |    11007 |          5182 |                    0.47× |
| one state read by 1,000 subscribed maps                   |    43122 |         30923 |                    0.72× |
| a write cut off after the first map, before 100 more      |     83.7 |          99.1 |                    1.18× |
| write a state that a chain of 10 maps reads, unsubscribed |      491 |           346 |                    0.70× |
| create and dispose a state, 10 maps and a subscriber      |     6271 |          3276 |                    0.52× |
