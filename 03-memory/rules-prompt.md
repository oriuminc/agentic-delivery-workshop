# Prompt: corrections into rules

Run this in the same chat as the ticket you just worked, so the agent can see your corrections.

> Look at the corrections I made in this session. Which would a future session need to know, and couldn't learn from the code? Propose them as short rules for AGENTS.md. Only things that will come up again.

Then go down the list together and keep only the ones that will. "Wrong twice? Add a line": if you correct the agent on the same thing twice, you're missing a rule.

**Optional:** keep the memory growing on its own. Add this line to `AGENTS.md`:

```markdown
- At the end of a session, propose new rules from my corrections and wait for approval.
```
