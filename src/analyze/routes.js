import { traverse } from '../parse.js'

const HTTP_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'all'])
const FRAMEWORK_PACKAGES = {
  express: 'express',
  fastify: 'fastify',
  'koa-router': 'koa',
  '@koa/router': 'koa',
}

function frameworkOf(imports) {
  for (const spec of imports) {
    if (FRAMEWORK_PACKAGES[spec]) return FRAMEWORK_PACKAGES[spec]
  }
  return null
}

function pathArg(node) {
  if (node?.type === 'StringLiteral' && node.value.startsWith('/')) return node.value
  return null
}

/**
 * Extract HTTP routes from files that import express / fastify / koa-router.
 * Detects `x.get('/path', ...)` member calls and fastify's `x.route({method, url})`.
 * Returns [{framework, method, path, file, line}]
 */
export function extractRoutes(parsed, modules) {
  const routes = []
  for (const { path: file, ast } of parsed) {
    const framework = frameworkOf(modules[file]?.imports || [])
    if (!framework) continue
    traverse(ast, {
      CallExpression({ node }) {
        const callee = node.callee
        if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier') return
        const name = callee.property.name
        if (HTTP_METHODS.has(name)) {
          const routePath = pathArg(node.arguments[0])
          if (routePath) {
            routes.push({ framework, method: name.toUpperCase(), path: routePath, file, line: node.loc.start.line })
          }
        } else if (name === 'route' && framework === 'fastify' && node.arguments[0]?.type === 'ObjectExpression') {
          let method, url
          for (const p of node.arguments[0].properties) {
            if (p.key?.name === 'method' && p.value.type === 'StringLiteral') method = p.value.value
            if (p.key?.name === 'url' && p.value.type === 'StringLiteral') url = p.value.value
          }
          if (method && url) {
            routes.push({ framework, method: method.toUpperCase(), path: url, file, line: node.loc.start.line })
          }
        }
      },
    })
  }
  return routes
}
