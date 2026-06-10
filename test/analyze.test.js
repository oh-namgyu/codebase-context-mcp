import test from 'node:test'
import assert from 'node:assert/strict'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeRepo } from '../src/model.js'

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

test('import graph — relative imports resolve to repo files, exports collected', () => {
  const m = analyzeRepo(join(FIXTURES, 'demo'))
  assert.equal(m.parsedCount, 3)
  assert.deepEqual(m.importEdges, [{ from: 'src/server.js', to: 'src/util.js' }])
  assert.deepEqual(m.modules['src/util.js'].exports.sort(), ['VERSION', 'helper'])
  assert.ok(m.modules['src/server.js'].imports.includes('express'))
})

test('express routes extracted with file:line', () => {
  const m = analyzeRepo(join(FIXTURES, 'demo'))
  const paths = m.routes.map((r) => `${r.method} ${r.path}`).sort()
  assert.deepEqual(paths, ['GET /api/items', 'GET /api/items/:id', 'POST /api/items'])
  assert.ok(m.routes.every((r) => r.framework === 'express' && r.file === 'src/server.js' && r.line > 0))
})

test('fastify routes — member call and route() object form', () => {
  const m = analyzeRepo(join(FIXTURES, 'fastify-app'))
  const got = m.routes.map((r) => `${r.method} ${r.path}`).sort()
  assert.deepEqual(got, ['GET /health', 'POST /users'])
  assert.ok(m.routes.every((r) => r.framework === 'fastify'))
})

test('koa routes via @koa/router require()', () => {
  const m = analyzeRepo(join(FIXTURES, 'koa-app'))
  assert.deepEqual(m.routes.map((r) => `${r.method} ${r.path}`), ['GET /koa/items'])
  assert.equal(m.routes[0].framework, 'koa')
})

test('cross-stack — fetch sites matched to routes incl. template params', () => {
  const m = analyzeRepo(join(FIXTURES, 'demo'))
  assert.equal(m.callSites.length, 3)
  const pairs = m.crossStack.map((e) => `${e.from.file} -> ${e.to.method} ${e.to.path}`).sort()
  assert.deepEqual(pairs, [
    'public/app.js -> GET /api/items',
    'public/app.js -> GET /api/items/:id',
    'public/app.js -> POST /api/items',
  ])
})
