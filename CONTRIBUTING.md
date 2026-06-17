# Contributing to codebase-context-mcp

Thanks for your interest!

## Development setup

```bash
npm install
npm test            # node --test
node src/cli.js <path-to-a-repo>   # try the analyzer
```

To use it as an MCP server, see the registration snippet in the README.

## Guidelines

- The analyzer is read-only and bounded (`MAX_FILES`, 512 KB/file). Keep it that
  way; never write to analyzed repos.
- Add fixtures + tests under `test/`/`fixtures/` for new languages, route
  frameworks, or cross-stack matching rules.
- Run `npm test` before opening a PR; describe what changed and how you verified it.
