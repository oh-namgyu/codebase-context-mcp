import { scanRepo } from './scan.js'
import { parseSource } from './parse.js'
import { buildImportGraph } from './analyze/imports.js'
import { extractRoutes } from './analyze/routes.js'
import { extractCallSites, matchCrossStack } from './analyze/crossstack.js'

/** Run the full analysis pipeline on a repo root. Returns the unified model. */
export function analyzeRepo(root) {
  const { files, truncated } = scanRepo(root)
  const parsed = []
  for (const f of files) {
    const ast = parseSource(f.code, f.path)
    if (ast) parsed.push({ path: f.path, ast })
  }
  const { modules, edges: importEdges } = buildImportGraph(parsed)
  const routes = extractRoutes(parsed, modules)
  const callSites = extractCallSites(parsed)
  const crossStack = matchCrossStack(callSites, routes)
  return {
    root,
    fileCount: files.length,
    parsedCount: parsed.length,
    truncated,
    modules,
    importEdges,
    routes,
    callSites,
    crossStack,
  }
}
