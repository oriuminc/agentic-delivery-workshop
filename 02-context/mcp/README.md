# Connecting an MCP

An MCP server connects the agent to one system, like Jira or Bitbucket. Why not just paste the details in? A paste is a snapshot you have to remember to update; an MCP is a set of tools the agent calls when it needs the data. Connect only what you'll use: every server adds tools the agent has to choose between.

**Never put a token in a config file.** These configs read tokens from environment variables. Set them in your shell profile, then quit your editor completely and reopen it, so it picks them up.

## Jira: Atlassian's MCP server (Jira Cloud)

Atlassian runs a remote MCP server. You sign in with your Atlassian account in the browser (OAuth), so there's no token to manage. It works with Jira Cloud, not Jira Server or Data Center. Your Atlassian admin may need to allow it first. It can also create and edit issues, so ask it only to read during the workshop.

- **Cursor:** add the `atlassian` entry from [cursor-mcp.json](cursor-mcp.json) to `.cursor/mcp.json`, then click **Connect** in Cursor's MCP settings to sign in.
- **Claude Code:** run
  ```bash
  claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp/authv2
  ```
  then run `/mcp` in Claude Code to sign in.

Check Atlassian's setup guide if the URL has changed: <https://support.atlassian.com/atlassian-rovo-mcp-server/>

## Bitbucket: the community `bitbucket-mcp` server (Bitbucket Cloud)

[`bitbucket-mcp`](https://github.com/MatanYemini/bitbucket-mcp) is a community-maintained server, run with `npx`. Destructive tools are off unless you turn them on.

1. Create a Bitbucket API token (or app password) with read access to repositories and pull requests.
2. Set these in your shell:
   ```bash
   export BITBUCKET_WORKSPACE="<your-workspace>"
   export BITBUCKET_USERNAME="<your Atlassian account email>"
   export BITBUCKET_PASSWORD="<your API token or app password>"
   ```
   On Windows, use `setx BITBUCKET_WORKSPACE "<your-workspace>"` for each one, then open a new terminal.
3. Add the `bitbucket` entry from [cursor-mcp.json](cursor-mcp.json) (Cursor, in `.cursor/mcp.json`) or [claude-mcp.json](claude-mcp.json) (Claude Code, in `.mcp.json`).

## Context7: current library docs

[Context7](https://github.com/upstash/context7) gives the agent up-to-date docs for the libraries you use, so it stops inventing APIs. No token needed to start (an optional free API key raises the rate limit).

- **Cursor:** add the `context7` entry from [cursor-mcp.json](cursor-mcp.json).
- **Claude Code:** `claude mcp add --transport http context7 https://mcp.context7.com/mcp`

Then add a line to `AGENTS.md`: *"Use Context7 for library and framework docs before writing code against them."*

## Playwright: check the UI in a browser

[Playwright MCP](https://github.com/microsoft/playwright-mcp) lets the agent open your app in a browser, click through it and check what it built.

- **Cursor:** add the `playwright` entry from [cursor-mcp.json](cursor-mcp.json).
- **Claude Code:** `claude mcp add playwright -- npx @playwright/mcp@latest`

## Your QA tool

Many QA platforms now have an MCP. Spur, for example, connects at `https://api.spurnow.com/mcp` and signs you in with your Spur account. Check your platform's docs.

## Check it works

Ask the agent: *"Show me ticket <KEY>"* or *"List the last 5 merged PRs that touched <area>"*. Real data back means it's connected.
