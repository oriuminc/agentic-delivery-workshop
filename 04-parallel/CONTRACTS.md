# CONTRACTS.md: <feature>

<!-- Written before any part starts. The main agent drafts it; a person approves it. -->

## Parts
| Part | Owner | Does |
|------|-------|------|
| <data> | subagent 1 | <what it builds> |
| <api> | subagent 2 | <what it builds> |
| <ui> | subagent 3 | <what it builds> |

## Shared shapes
<!-- Real types someone could build against, not prose. -->
```ts
export type <Thing> = {
  id: string
  // ...
}

export function <fetchThing>(id: string): Promise<<Thing>>
```

## File owners
| File | Owner | Others may |
|------|-------|-----------|
| `<path/to/shared/types>` | data | read only |
| `<routes or index file>` | api | read only |
| `package.json` | nobody | ask first |

## Merge order
1. <data>: others depend on its types
2. <api>
3. <ui>

Run the check command after each merge.
