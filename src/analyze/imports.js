import { traverse } from '../parse.js'

const RESOLVE_SUFFIXES = ['', '.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs',
  '/index.js', '/index.ts', '/index.tsx', '/index.jsx']

function resolveRelative(fromPath, spec, fileSet) {
  const baseDir = fromPath.split('/').slice(0, -1)
  const parts = [...baseDir, ...spec.split('/')]
  const stack = []
  for (const p of parts) {
    if (p === '.' || p === '') continue
    else if (p === '..') stack.pop()
    else stack.push(p)
  }
  const joined = stack.join('/')
  for (const suffix of RESOLVE_SUFFIXES) {
    if (fileSet.has(joined + suffix)) return joined + suffix
  }
  return null
}

/**
 * Build the import graph for parsed files.
 * Returns { modules: {path: {imports: [spec...], exports: [name...]}}, edges: [{from, to}] }
 * where edges link repo files (relative specs resolved); external packages stay in `imports` only.
 */
export function buildImportGraph(parsed) {
  const fileSet = new Set(parsed.map((f) => f.path))
  const modules = {}
  const edges = []

  for (const { path, ast } of parsed) {
    const imports = []
    const exports = []
    traverse(ast, {
      ImportDeclaration({ node }) {
        imports.push(node.source.value)
      },
      CallExpression({ node }) {
        if (node.callee.name === 'require' && node.arguments[0]?.type === 'StringLiteral') {
          imports.push(node.arguments[0].value)
        }
      },
      ExportNamedDeclaration({ node }) {
        if (node.declaration?.id?.name) exports.push(node.declaration.id.name)
        for (const d of node.declaration?.declarations || []) {
          if (d.id?.name) exports.push(d.id.name)
        }
        for (const s of node.specifiers || []) {
          if (s.exported?.name) exports.push(s.exported.name)
        }
      },
      ExportDefaultDeclaration() {
        exports.push('default')
      },
    })
    modules[path] = { imports, exports }
    for (const spec of imports) {
      if (!spec.startsWith('.')) continue
      const to = resolveRelative(path, spec, fileSet)
      if (to) edges.push({ from: path, to })
    }
  }
  return { modules, edges }
}
