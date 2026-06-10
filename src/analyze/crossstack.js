import { traverse } from '../parse.js'

const AXIOS_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch'])

function literalPath(node) {
  if (node?.type === 'StringLiteral' && node.value.startsWith('/')) return node.value
  if (node?.type === 'TemplateLiteral') {
    const joined = node.quasis.map((q) => q.value.cooked).join(':param')
    if (joined.startsWith('/')) return joined
  }
  return null
}

function fetchMethod(optionsNode) {
  if (optionsNode?.type !== 'ObjectExpression') return 'GET'
  for (const p of optionsNode.properties) {
    if (p.key?.name === 'method' && p.value?.type === 'StringLiteral') return p.value.value.toUpperCase()
  }
  return 'GET'
}

/** Collect HTTP call sites: fetch('/x') and axios.get('/x'). Returns [{method, path, file, line}] */
export function extractCallSites(parsed) {
  const sites = []
  for (const { path: file, ast } of parsed) {
    traverse(ast, {
      CallExpression({ node }) {
        const { callee } = node
        if (callee.type === 'Identifier' && callee.name === 'fetch') {
          const p = literalPath(node.arguments[0])
          if (p) sites.push({ method: fetchMethod(node.arguments[1]), path: p, file, line: node.loc.start.line })
        } else if (
          callee.type === 'MemberExpression' &&
          callee.object.name === 'axios' &&
          AXIOS_METHODS.has(callee.property.name)
        ) {
          const p = literalPath(node.arguments[0])
          if (p) sites.push({ method: callee.property.name.toUpperCase(), path: p, file, line: node.loc.start.line })
        }
      },
    })
  }
  return sites
}

function segmentsMatch(routePath, callPath) {
  const stripQuery = callPath.split('?')[0]
  const rs = routePath.split('/').filter(Boolean)
  const cs = stripQuery.split('/').filter(Boolean)
  if (rs.length !== cs.length) return false
  return rs.every((seg, i) => seg.startsWith(':') || cs[i] === ':param' || seg === cs[i])
}

/** Match call sites to routes. Returns [{from: callSite, to: route}] */
export function matchCrossStack(callSites, routes) {
  const edges = []
  for (const site of callSites) {
    for (const route of routes) {
      if (route.method === site.method && segmentsMatch(route.path, site.path)) {
        edges.push({ from: site, to: route })
      }
    }
  }
  return edges
}
