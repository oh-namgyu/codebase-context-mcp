import test from 'node:test'
import assert from 'node:assert/strict'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEMO = join(ROOT, 'test', 'fixtures', 'demo')

test('MCP stdio round-trip — list tools and call all three', async (t) => {
  const client = new Client({ name: 'test-client', version: '0.0.1' })
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(ROOT, 'src', 'mcp.js')],
  })
  await client.connect(transport)
  t.after(() => client.close())

  const { tools } = await client.listTools()
  assert.deepEqual(tools.map((x) => x.name).sort(), ['analyze_repo', 'find_api_callers', 'get_routes'])

  const analysis = await client.callTool({ name: 'analyze_repo', arguments: { path: DEMO } })
  assert.match(analysis.content[0].text, /# Architecture/)
  assert.match(analysis.content[0].text, /Cross-stack edges: 3/)

  const routes = await client.callTool({ name: 'get_routes', arguments: { path: DEMO } })
  assert.equal(JSON.parse(routes.content[0].text).length, 3)

  const callers = await client.callTool({
    name: 'find_api_callers',
    arguments: { path: DEMO, route: '/api/items' },
  })
  const hits = JSON.parse(callers.content[0].text)
  assert.ok(hits.length >= 2)
  assert.ok(hits.every((h) => h.from.file === 'public/app.js'))
})
