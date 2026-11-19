---
name: rca
description: Root-cause analysis of a reported issue. Takes a request id, entry id, error text, log link, screenshot path or ticket key. Gathers logs from local app logs, Vercel, Cloudflare and git history, writes an RCA report, then asks whether to hand it to the developer agent. Use for /rca, "why did this fail", or "investigate this error".
argument-hint: <request-id | log URL | screenshot path | ticket | error text> [since=24h]
---
# RCA

## 1. Normalise the input → search terms + time window
- **Screenshot** (an image path): Read it. Extract the `Ref <id>` request id, the error text, the URL and the time.
- **Log link**: `vercel.com/…` → Vercel. `dash.cloudflare.com/…` → Cloudflare. Note any deployment or request id in the link.
- **Ticket key**: fetch it through the Atlassian MCP and pull ids and error text from it.
- The request id is the best term. It appears on every backend log line, and in the UI's error toast.

## 2. Deterministic sources (no model reading)
Run `.claude/scripts/collect-logs.sh <term> [since]`. It saves matches to `.runs/rca/<term>/` and prints only an index: matches per source, the first few lines, commits in the window, and which remote sources exist.

## 3. Remote sources (keep raw logs out of this context)
For each remote source the index lists, run one Agent with `model: haiku` and this brief:
"Fetch logs for `<term>` over `<window>` from `<source>`. Save the raw output to `.runs/rca/<term>/<source>.log`, and return at most 20 matching lines plus the surrounding errors."
- **Vercel**: `mcp__vercel__get_runtime_errors`, then `mcp__vercel__get_runtime_logs`. Fallback: the `vercel logs` CLI.
- **Cloudflare**: a Cloudflare MCP if one is configured, otherwise `wrangler tail`.
Under **Gaps**, list every source you couldn't reach. Never imply you checked something you didn't.

## 4. Trace to code
Follow the evidence: request path → route handler → the line that fails (Grep, then Read only that region). For the commit that introduced it: `git log -S'<symbol>' --oneline | head` in the repo that owns the file.

## 5. Write `.runs/rca/<term>/RCA.md`
- **Summary**: one line.
- **Impact**: who or what was affected, and since when.
- **Timeline**: times taken from the logs.
- **Evidence**: verbatim log lines, each tagged with its source and file.
- **Root cause**: `file:line`, plus why it happens.
- **Why tests missed it**.
- **Fix proposal**: files, approach, and the regression test to add first.
- **Confidence**: high, med or low, and why. It's high only if a log line *and* the code agree.
- **Gaps**: sources you couldn't check.

## 6. Hand off
Show the summary, root cause and confidence in ≤8 lines. Then use AskUserQuestion:
- **Fix it**: run the `developer` agent with the RCA path (regression test first), then run `.claude/scripts/run-checks.sh`. Then offer `/commit`.
- **Hand over the RCA only**: give the RCA.md path and stop.
