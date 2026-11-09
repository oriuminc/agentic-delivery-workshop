# Prompts for parallel work

## Two separate tasks

In each worktree, a normal prompt for that task. Afterwards, check:

> Which files did you change? List them.

Compare the two lists. If they overlap, the tasks weren't really separate.

## Contract-first: one feature, split

> Split this feature into 3 parts that can be built in parallel. First write CONTRACTS.md: which files each part owns, the shared types, props and API shapes, and the merge order. Wait for my approval. Then start one part-builder subagent per part. Give each the contract and only its part, and have it commit its work. When they're done, check each against the contract, merge them in order, and run the check command after each merge.

Before approving the contract, check: are the shared shapes real types, not prose? Does every shared file have exactly one owner?

## What not to do

This is the naive version. It's fast to type, and it's how silent collisions happen:

> Build this feature as 3 parts in parallel using subagents: <part 1>, <part 2>, <part 3>.
