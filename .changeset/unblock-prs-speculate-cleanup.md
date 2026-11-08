---
'pr-merge-queue': patch
---

`unblock-prs`'s checking ahead dispatches its layers without `diff-parent`, so that each run diffs against `main` as a pull request's does and leaves a whole verdict about its tree, true whatever becomes of the layers below. Cleaning up a layer no longer valid is then only about runners and branches: one whose pull request was set aside for its failure keeps its runs going and loses its branch once they finish; any other has its runs cancelled and loses its branch; no run is deleted. A first layer falls back once a run has waited 90 minutes for a runner, or a job has run 40 minutes from its own start, each measured on its own clock, so that waiting for runners is not taken for being stuck.
