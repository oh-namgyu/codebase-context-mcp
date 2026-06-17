import test from 'node:test'
import assert from 'node:assert/strict'
import { segmentsMatch } from '../src/analyze/crossstack.js'

test('segmentsMatch resolves concrete URLs and patterns to :param routes', () => {
  assert.equal(segmentsMatch('/api/items/:id', '/api/items/5'), true) // concrete URL
  assert.equal(segmentsMatch('/api/items/:id', '/api/items/:id'), true) // pattern
  assert.equal(segmentsMatch('/api/items/:id', '/api/items'), false) // arity mismatch
  assert.equal(segmentsMatch('/api/items', '/api/items?q=1'), true) // query stripped
  assert.equal(segmentsMatch('/api/items', '/api/users'), false) // different path
})
