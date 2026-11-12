# Benchmark: synstate-next and synstate

<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->

Measured with Node.js v26.13.0 on Intel(R) Xeon(R) Processor @ 2.30GHz. Each figure is the median time of one operation, in nanoseconds, of 6 processes per library, each the median of 21 samples after 10 warm-up samples; see `scripts/cmd/benchmark.mts` for the scenarios. The last column is synstate-next's time divided by synstate's: below 1 is faster than synstate, above 1 slower.

| scenario (median ns per operation)                        | synstate | synstate-next | synstate-next / synstate |
| :-------------------------------------------------------- | -------: | ------------: | -----------------------: |
| write a state with one subscriber                         |     39.7 |          45.3 |                    1.14× |
| a chain of 100 maps                                       |     4028 |          2114 |                    0.52× |
| a diamond: two maps joined by derive                      |      159 |           124 |                    0.78× |
| one of 100 states written, all read by one derive         |      499 |           355 |                    0.71× |
| 50 diamonds in a row                                      |     7378 |          3759 |                    0.51× |
| one state read by 1,000 subscribed maps                   |    29839 |         21194 |                    0.71× |
| a write cut off after the first map, before 100 more      |     55.4 |          54.1 |                    0.98× |
| write a state that a chain of 10 maps reads, unsubscribed |      338 |           234 |                    0.69× |
| create and dispose a state, 10 maps and a subscriber      |     3465 |          2284 |                    0.66× |
