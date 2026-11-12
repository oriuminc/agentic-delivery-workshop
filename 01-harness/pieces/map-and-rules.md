# Map and rules

**Closes the gap:** it never saw how your team builds.

```markdown
## Map
- `<folder>/`: <what lives here>
- `<folder>/`: <what lives here>

## Rules
- Reuse components from `<path>` before writing new UI.
- Don't add a dependency without asking.
- <the 2 or 3 mistakes a new developer makes in this repo>
```

**Writing it well**
- **Map** stops it inventing a folder structure. List only the folders that matter.
- **Rules** cover only where your repo differs from what most code does. Skip generic advice like "write clean code"; it already tries to.
- Keep lines specific: "Use Vitest, not Jest", not "write good tests".
