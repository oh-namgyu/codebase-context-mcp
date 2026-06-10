#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { resolve } from 'node:path'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { analyzeRepo } from './model.js'
import { toMarkdown, toMermaid } from './render.js'

const text = (s) => ({ content: [{ type: 'text', text: s }] })
const PATH_ARG = { path: z.string().describe('Absolute path to the repository root') }

export function buildServer() {
  const server = new McpServer({ name: 'codebase-context-mcp', version: '0.1.0' })

  server.tool(
    'analyze_repo',
    'Analyze a repository and return its architecture map: file/module overview, internal import graph, HTTP routes (Express/Fastify/Koa), and frontend-to-backend call edges. Call this FIRST when entering an unfamiliar codebase instead of reading files one by one.',
    { ...PATH_ARG, format: z.enum(['markdown', 'mermaid']).optional().describe('Output format (default markdown)') },
    async ({ path, format }) => {
      const model = analyzeRepo(resolve(path))
      return text(format === 'mermaid' ? toMermaid(model) : toMarkdown(model))
    }
  )

  server.tool(
    'get_routes',
    'List the HTTP routes (method, path, file:line, framework) defined in a repository. Supports Express, Fastify, and Koa router.',
    PATH_ARG,
    async ({ path }) => text(JSON.stringify(analyzeRepo(resolve(path)).routes, null, 2))
  )

  server.tool(
    'find_api_callers',
    'Find frontend call sites (fetch/axios) that hit a given API route path — answers "who calls this API?". Returns matching call sites with file:line.',
    { ...PATH_ARG, route: z.string().describe('Route path to look up, e.g. /api/items') },
    async ({ path, route }) => {
      const model = analyzeRepo(resolve(path))
      const hits = model.crossStack.filter((e) => e.to.path === route)
      return text(JSON.stringify(hits, null, 2))
    }
  )

  return server
}

let isMain = false
try {
  isMain = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
} catch {
  /* not a direct CLI invocation */
}
if (isMain) {
  const server = buildServer()
  await server.connect(new StdioServerTransport())
}
