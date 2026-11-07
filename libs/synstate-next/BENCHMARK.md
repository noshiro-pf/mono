# Benchmark: synstate-next and synstate

<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->

Measured with Node.js v26.13.0 on Intel(R) Xeon(R) Processor @ 2.30GHz. Each figure is the median time of one operation, in nanoseconds, of 5 processes per library, each the median of 21 samples after 10 warm-up samples; see `scripts/cmd/benchmark.mts` for the scenarios. The last column is synstate-next's time divided by synstate's: below 1 is faster than synstate, above 1 slower.

| scenario (median ns per operation)                        | synstate | synstate-next | synstate-next / synstate |
| :-------------------------------------------------------- | -------: | ------------: | -----------------------: |
| write a state with one subscriber                         |     43.8 |          47.4 |                    1.08× |
| a chain of 100 maps                                       |     3618 |          2144 |                    0.59× |
| a diamond: two maps joined by derive                      |      172 |           115 |                    0.67× |
| 50 diamonds in a row                                      |     6898 |          3723 |                    0.54× |
| one state read by 1,000 subscribed maps                   |    29383 |         21922 |                    0.75× |
| a write cut off after the first map, before 100 more      |     56.6 |          41.7 |                    0.74× |
| write a state that a chain of 10 maps reads, unsubscribed |      361 |           226 |                    0.63× |
| create and dispose a state, 10 maps and a subscriber      |     3663 |          2542 |                    0.69× |
