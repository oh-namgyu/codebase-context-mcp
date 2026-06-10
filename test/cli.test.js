import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CLI = join(ROOT, 'src', 'cli.js')
const DEMO = join(ROOT, 'test', 'fixtures', 'demo')
const run = (args) =>
  promisify(execFile)(process.execPath, [CLI, ...args]).then(
    (r) => ({ code: 0, out: r.stdout }),
    (e) => ({ code: e.code, out: (e.stdout || '') + (e.stderr || '') })
  )

test('cli analyze md / json / mermaid', async () => {
  let r = await run(['analyze', DEMO])
  assert.equal(r.code, 0)
  assert.match(r.out, /# Architecture/)

  r = await run(['analyze', DEMO, '--format', 'json'])
  const model = JSON.parse(r.out)
  assert.equal(model.routes.length, 3)

  r = await run(['analyze', DEMO, '-f', 'mermaid'])
  assert.match(r.out, /^flowchart LR/)
})

test('cli analyze missing path exits 1', async () => {
  const r = await run(['analyze', '/nonexistent-path-xyz'])
  assert.equal(r.code, 1)
  assert.match(r.out, /path not found/)
})
