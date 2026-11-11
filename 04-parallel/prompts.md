# Prompts for parallel work

## Two separate tasks

In the workshop, ask each agent for a plan, not code:

> Plan this ticket: the files you'd change and why. Don't write code yet.

Compare the two file lists. If they overlap, the tasks aren't really separate. On a real day, give each agent a normal prompt in its own worktree (in Cursor, starting the prompt with `/worktree` makes one for you), then ask each: *"Which files did you change? List them."*

## Contract-first: one feature, split

In the workshop, stop at the contract:

> Split this feature into 3 parts that could be built in parallel. Write CONTRACTS.md: which files each part owns, the shared types, props and API shapes, and the merge order. Don't build anything.

The full version, for when you run the parts:

> Split this feature into 3 parts that can be built in parallel. First write CONTRACTS.md: which files each part owns, the shared types, props and API shapes, and the merge order. Wait for my approval. Then start one part-builder subagent per part, each in its own worktree. Give each the contract and only its part, and have it commit its work on its own branch. When they're done, check each against the contract, merge them in order, and run the check command after each merge.

Before approving the contract, check: are the shared shapes real types, not prose? Does every shared file have exactly one owner?

## What not to do

This is the naive version. It's fast to type, and it's how silent collisions happen:

> Build this feature as 3 parts in parallel using subagents: <part 1>, <part 2>, <part 3>.
