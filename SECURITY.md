# Security Policy

## Threat model

codebase-context-mcp is a **local, offline analysis tool**:

- It reads source files under the path you pass it and returns derived structure. It performs
  no network access and writes nothing.
- The MCP server runs over stdio for a local client; there is no listening port.
- **Path scope**: the server analyzes whatever absolute path the MCP client asks for. If you
  run it for an untrusted agent, be aware the agent can request analysis of any readable
  directory — run it under an account whose readable files you are comfortable exposing to
  that agent.
- Parsing is error-tolerant (`@babel/parser` with `errorRecovery`); malformed files are
  skipped, and files over 512 KB or beyond the `CCM_MAX_FILES` cap are ignored.

## Reporting a vulnerability

Please report vulnerabilities privately via GitHub Security Advisories on this repository
("Report a vulnerability"). Please do not open public issues for security reports.
