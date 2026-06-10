# codebase-context-mcp

**[🇰🇷 한국어 README](README_KOR.md)**

Static codebase analysis as MCP tools — give AI coding agents a **map of your repo** instead
of letting them burn half their tokens rediscovering it file by file.

One tool call returns: file/module overview, internal **import graph**, HTTP **routes**
(Express / Fastify / Koa, with `file:line`), and **cross-stack edges** — which frontend
`fetch`/`axios` call hits which backend route.

## Why

AI coding agents entering an unfamiliar codebase spend a large share of their context window
on `grep`/`read` loops just to learn the structure — and repeat it every session. Static
analysis answers most of those questions in milliseconds, deterministically, offline. This
server packages that as [Model Context Protocol](https://modelcontextprotocol.io) tools any
MCP client (Claude Code, Cursor, Cline, ...) can call.

## Quick start

```bash
git clone https://github.com/oh-namgyu/codebase-context-mcp && cd codebase-context-mcp
npm install

# as a CLI
npx codebase-context analyze /path/to/repo            # markdown architecture doc
npx codebase-context analyze /path/to/repo -f mermaid # flowchart
npx codebase-context analyze /path/to/repo -f json    # raw model

# as an MCP server (Claude Code)
claude mcp add codebase-context -- node /path/to/codebase-context-mcp/src/mcp.js
```

## MCP tools

| Tool | What it answers |
|---|---|
| `analyze_repo` | "What does this codebase look like?" — full architecture map (markdown or mermaid) |
| `get_routes` | "What HTTP endpoints exist?" — method, path, `file:line`, framework |
| `find_api_callers` | "Who calls this API?" — frontend call sites matched to a route |

Example output (this section is real output for a small Express repo):

```
# Architecture
- Routes: 7
- Cross-stack edges: 2
- Internal import edges: 5

## Routes
- `GET /api/claims` — src/server.js:29 (express)
...
## Cross-stack edges (frontend call → backend route)
- public/app.js:12 → `GET /api/claims` (src/server.js:29)
```

## What it detects (v0.1)

- **Languages**: JavaScript / TypeScript / JSX / TSX (Babel parser, error-tolerant)
- **Import graph**: ESM `import` + CJS `require`, relative specifiers resolved to repo files
- **Routes**: Express / Fastify / Koa-router member calls (`app.get('/x', ...)`) and Fastify's
  `route({method, url})` object form — only in files that actually import those frameworks
- **Call sites**: `fetch('/x')` (incl. template literals → `:param`) and `axios.get('/x')`
- **Cross-stack matching**: method + path segments, route `:params` match any segment

Not yet: Next.js/NestJS conventions, non-JS languages, incremental caching. PRs welcome.

## Configuration

| Env | Default | |
|---|---|---|
| `CCM_MAX_FILES` | `5000` | file cap per analysis (guards huge monorepos) |

No network access, no telemetry, nothing leaves your machine.

## Development

```bash
npm test   # analyzer fixtures + render snapshots + CLI e2e + MCP stdio round-trip
```

MIT — see [LICENSE](LICENSE). Security policy: [SECURITY.md](SECURITY.md).
