const mermaidId = (s) => s.replace(/[^A-Za-z0-9]/g, '_')

/** Render the analysis model as a markdown architecture document. */
export function toMarkdown(m) {
  const lines = [
    '# Architecture',
    '',
    `- Files scanned: ${m.fileCount} (parsed: ${m.parsedCount})${m.truncated ? ' — TRUNCATED at file cap' : ''}`,
    `- Routes: ${m.routes.length}`,
    `- HTTP call sites: ${m.callSites.length}`,
    `- Cross-stack edges: ${m.crossStack.length}`,
    `- Internal import edges: ${m.importEdges.length}`,
    '',
    '## Routes',
  ]
  for (const r of m.routes) lines.push(`- \`${r.method} ${r.path}\` — ${r.file}:${r.line} (${r.framework})`)
  if (!m.routes.length) lines.push('- (none detected)')

  lines.push('', '## Cross-stack edges (frontend call → backend route)')
  for (const e of m.crossStack) {
    lines.push(`- ${e.from.file}:${e.from.line} → \`${e.to.method} ${e.to.path}\` (${e.to.file}:${e.to.line})`)
  }
  if (!m.crossStack.length) lines.push('- (none detected)')

  lines.push('', '## Module imports (internal)')
  for (const e of m.importEdges) lines.push(`- ${e.from} → ${e.to}`)
  if (!m.importEdges.length) lines.push('- (none detected)')

  lines.push('', '## Exports by module')
  for (const [path, mod] of Object.entries(m.modules)) {
    if (mod.exports.length) lines.push(`- ${path}: ${mod.exports.join(', ')}`)
  }
  return lines.join('\n') + '\n'
}

/** Render import + cross-stack edges as a mermaid flowchart. */
export function toMermaid(m) {
  const lines = ['flowchart LR']
  const declared = new Set()
  const declare = (id, label) => {
    if (!declared.has(id)) {
      declared.add(id)
      lines.push(`  ${id}["${label}"]`)
    }
  }
  for (const e of m.importEdges) {
    declare(mermaidId(e.from), e.from)
    declare(mermaidId(e.to), e.to)
    lines.push(`  ${mermaidId(e.from)} --> ${mermaidId(e.to)}`)
  }
  for (const e of m.crossStack) {
    const routeId = mermaidId(`${e.to.method} ${e.to.path}`)
    declare(mermaidId(e.from.file), e.from.file)
    declare(routeId, `${e.to.method} ${e.to.path}`)
    lines.push(`  ${mermaidId(e.from.file)} -.-> ${routeId}`)
  }
  return lines.join('\n') + '\n'
}

export function render(model, format) {
  if (format === 'json') return JSON.stringify(model, null, 2)
  if (format === 'mermaid') return toMermaid(model)
  return toMarkdown(model)
}
