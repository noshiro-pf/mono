---
title: How it works
description: What happens between a write and the DOM, how a switch drops a branch before it computes, and why the rebuild is faster than synstate-dom.
---

This page follows an update from a write to the DOM. It is about synstate-dom-next and the parts of synstate-next it rests on; synstate-next's [DESIGN.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-next/DESIGN.md) has the rest.

## From a write to the DOM

An update has two phases. First the **drain** recomputes the nodes the write reached, in order of depth. Then the **effects** run: the bindings, the switches, `For` and every `subscribe`, each once, against a graph that has settled.

```text
price$.set(120)                 a state, depth 0
   │
   │  the update gets a number (the epoch); price$'s children are queued for it
   ▼
drain, depth by depth
   depth 1   label$ = price$.pipe(map(p => `${p} yen`))     recomputed once
   depth 1   isCheap$ = price$.pipe(map(p => p < 100))      true → false: passed on
   depth 2   ...                                            only what a change reached
   ▼
effects, after the drain
   TextBinding(label$)                text.data = '120 yen'
   ClassToggleBinding(isCheap$)       classList.toggle('cheap', false)
   ▼
next round, only if an effect wrote to a state
```

- **Queueing is a number.** Each update is an integer, the epoch. A node is queued for the current update when its `queuedAt` equals the epoch, so queueing allocates nothing, and a node with one parent never asks which parent changed.
- **Depth makes it glitch-free.** A node's depth is one more than its deepest parent's, and the drain visits depth by depth, so each node is recomputed once per update, after every parent. A diamond (`total = derive([price$, tax$], ...)` where `tax$` is itself derived from `price$`) is computed once, from consistent values.
- **An equal result stops there.** A node that recomputes to an `Object.is` equal value passes nothing on, and nothing below it is visited.
- **Effects run on a settled graph.** A binding never reads a value that is about to change in the same update, and it runs once per update however many of its inputs changed.
- **Writes never interrupt.** A write made during the drain (inside a `map`) waits until the drain ends. A write made by an effect starts the next round. A program that keeps writing from its effects is stopped after 100 rounds with an error naming the cause, rather than looping forever.

## A binding is one effect

A bound attribute, property, class, style or text is one object: an instance of an effect class holding its target in its own fields.

```text
synstate-dom                          synstate-dom-next
  source.subscribe(v => el.x = v)       class PropertyBinding extends EffectClass {
  ├ a closure per binding                 #element; #name
  ├ a subscriber record                   run() { this.#element[this.#name] = this.source.current }
  └ a cleanup in the scope              }
                                        one object; disposed with its owner
```

Its `run` is a method on a prototype shared by every binding of its kind. Creating 1,000 rows creates one object per binding, not three, and an update that reaches a binding calls one method.

Event handlers are the same idea from the other side: a handler is assigned to the element's `on…` property where it has one, and never removed, because the element is dropped with the owner that made it.

## Mounting is a batch

`render`, a branch and a row mount inside a batch. A write made while they mount (a component that sets a state from its props, a `subscribe` whose first call writes) propagates once the nodes are in place, in one update, rather than reaching half-built DOM.

## A switch decides before its branch computes

`If`, `MatchOptional`, `MatchResult` and `Switch` unmount a branch in their effect, after the drain. Left at that, the drain would first recompute the branch's own nodes from the very value that rules it out: a `MatchOptional` branch's `map` would unwrap a `none`, a row's `map` would read an index that is no longer there.

So the switch decides in the drain instead. Below the value it switches on, it puts a small check node, and every node a branch creates is placed deeper than that check:

```text
depth 0     page$                                  the value switched on
depth 1     check: key(page$) still 'item'?        no → retire the branch here
depth ≥ 2   branch 'item':  title$ = page$.pipe(map(p => p.title))
                            ↑ never visited for a page that rules the branch out
effects     the switch unmounts the branch and mounts the next one
```

- The branch's owner is made with a **depth floor**: every node created in it, and in its child owners, is at least as deep as the floor, so the drain reaches the check first.
- **Retiring** a branch takes its nodes and effects out of the updates to come without running any code of the application: no cleanup runs during the drain. The effect then disposes the branch's owner, which runs the cleanups, and mounts the next branch.
- `For` does the same for its rows: the keys are checked in the drain, and the rows whose key is gone are retired before their nodes are visited.
- A key function that throws is not let out into the drain: the switch retires what it could not keep, and its effect drops it and throws the exception as the switch's own. The rest of the update completes.

An observable a branch is given rather than makes (one created where the JSX was written) is not the branch's, and computes from every value. That is why [Lifecycle and owners](/mono/synstate-dom-next/guides/lifecycle/#two-habits) asks you to create what a branch shows inside it.

## `For` keeps a state per row

Each row holds a state behind its `item$` (and `index$`, when the row function takes one). When `items` changes, the `For` effect compares keys:

- when the keys are the same, in the same order, there is no keyed diff and nothing moves;
- a row whose element is the same object as before is not visited at all;
- a row whose element changed has its state set, which wakes only that row's nodes and bindings;
- otherwise rows are added, disposed and moved, as few as the longest increasing run of their old positions allows.

The writes to the rows' states start the next round, so a row reads its new element one update after `items` changed. Both rounds complete before anything is painted. `selector` works the same way: selecting writes to the old row's and the new row's state, and to no other.

## Why it is faster than synstate-dom

The rebuild is measured against synstate-dom on the [benchmark](/mono/synstate-dom-next/background/benchmark/). Where the time goes, qualitatively:

- **Fewer objects per binding and per node.** A binding is one object, not a closure, a subscriber and a cleanup; a node is a class instance with fields, its methods on a prototype. Creating and disposing rows is mostly allocating and freeing these, so creating 10,000 rows and clearing them improve the most.
- **No update tokens.** synstate allocates a token per write and compares it on the way down; here an update is a number. A partial update or a selection allocates almost nothing.
- **No completion to propagate.** An observable ends by being disposed with its owner; there is no `complete` travelling through every child of a row on removal, and no reference count to decrement.
- **One run per binding per update.** Effects run after the drain, once each, however many of a binding's inputs changed.
- **Less to do in `For`.** Rows whose element did not change are skipped, and a list whose keys kept their order skips the keyed diff.
- **Equality cut-off in every node.** Every derived node stops an equal result by itself, rather than through one more node (`skipIfNoChange`) after it, so a change that comes out the same (a zoom within the same level, a task whose slack absorbs a delay) stops at the first node that sees it, whatever lies below, at no extra cost in building the graph.
