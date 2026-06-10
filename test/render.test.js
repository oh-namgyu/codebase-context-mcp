import test from 'node:test'
import assert from 'node:assert/strict'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeRepo } from '../src/model.js'
import { toMarkdown, toMermaid, render } from '../src/render.js'

const DEMO = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'demo')

test('markdown render contains all sections and counts', () => {
  const md = toMarkdown(analyzeRepo(DEMO))
  assert.match(md, /^# Architecture/)
  assert.match(md, /- Routes: 3/)
  assert.match(md, /- Cross-stack edges: 3/)
  assert.match(md, /`GET \/api\/items` — src\/server\.js:\d+ \(express\)/)
  assert.match(md, /src\/server\.js → src\/util\.js/)
  assert.match(md, /src\/util\.js: helper, VERSION|src\/util\.js: VERSION, helper/)
})

test('mermaid render declares nodes once and draws both edge kinds', () => {
  const mm = toMermaid(analyzeRepo(DEMO))
  assert.match(mm, /^flowchart LR/)
  assert.match(mm, /src_server_js --> src_util_js/)
  assert.match(mm, /public_app_js -\.-> GET__api_items/)
  const declarations = mm.split('\n').filter((l) => l.includes('public_app_js["'))
  assert.equal(declarations.length, 1)
})

test('render dispatches by format', () => {
  const model = analyzeRepo(DEMO)
  assert.doesNotThrow(() => JSON.parse(render(model, 'json')))
  assert.match(render(model, 'mermaid'), /^flowchart/)
  assert.match(render(model, 'md'), /^# Architecture/)
})
