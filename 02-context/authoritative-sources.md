# Authoritative sources

Add a section like this to `AGENTS.md` once a source is connected. Without it, the agent often ignores the source and guesses instead.

```markdown
## Authoritative sources
- For ticket details, acceptance criteria and linked issues, use the Jira MCP.
- For how similar changes were done before, look up merged PRs with the Bitbucket MCP.
- For <domain knowledge>, use the `<skill-name>` skill.
- Don't guess field names, IDs or API shapes. Look them up, or ask.
```

Say *when* to use each source, not just that it exists.
