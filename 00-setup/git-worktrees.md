# Git worktree cheat sheet

A worktree is a second checkout of the same repo, in another folder, on its own branch. Both share one git history, so you can run two agents side by side without them touching each other's files.

## Create two side-by-side checkouts

```bash
# from your repo, on an up-to-date main
git worktree add ../myrepo-with -b lab-with
git worktree add ../myrepo-without -b lab-without
```

Open each folder in its own editor window, and start one agent in each. On Windows, run these in Git Bash.

## Empty the "without" side

In the `without` checkout, move any instruction files aside. Don't commit this.

```bash
cd ../myrepo-without
mkdir -p ../aside
mv AGENTS.md CLAUDE.md .cursorrules ../aside/ 2>/dev/null
mv .cursor/rules .claude/skills .cursor/skills ../aside/ 2>/dev/null
```

Also check your tool's user-level rules or settings, which apply to every repo.

## See what you have

```bash
git worktree list
```

## Merge a part back (Lab 4)

Each agent commits on its own branch. Because worktrees share one history, those branches are visible from your main checkout:

```bash
cd ../myrepo           # your main checkout
git merge part-data    # merge in the agreed order
<your check command>   # run it after each merge
git merge part-api
<your check command>
```

A merge conflict means two branches changed the same lines.

## Clean up

```bash
git worktree remove ../myrepo-with
git worktree remove ../myrepo-without
git branch -D lab-with lab-without
```

Nothing here is pushed. Branches and worktrees stay on your laptop.
