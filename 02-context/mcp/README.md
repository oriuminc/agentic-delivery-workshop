# Connecting an MCP

An MCP server connects the agent to one system, like Jira or Bitbucket. The agent sees its tools and calls them when it needs data. Connect only what you'll use: every server adds tools the agent has to choose between.

**Never put a token in a config file.** These configs read tokens from environment variables. Set them in your shell profile, then restart your editor.

## Jira: Atlassian's MCP server (Jira Cloud)

Atlassian runs a remote MCP server. You sign in with your Atlassian account in the browser (OAuth), so there's no token to manage. It works with Jira Cloud, not Jira Server or Data Center. Your Atlassian admin may need to allow it first.

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
3. Add the `bitbucket` entry from [cursor-mcp.json](cursor-mcp.json) (Cursor, in `.cursor/mcp.json`) or [claude-mcp.json](claude-mcp.json) (Claude Code, in `.mcp.json`).

## Check it works

Ask the agent: *"Show me ticket <KEY>"* or *"List the last 5 merged PRs that touched <area>"*. Real data back means it's connected.
