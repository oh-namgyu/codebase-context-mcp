import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.nuxt',
  'vendor', '.venv', '__pycache__', '.cache', 'tmp',
])
const EXTS = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx'])
const MAX_FILES = Number(process.env.CCM_MAX_FILES) || 5000
const MAX_FILE_BYTES = 512 * 1024

/** Walk a repo and return [{path (repo-relative), code}] for parseable source files. */
export function scanRepo(root) {
  const files = []
  const walk = (dir) => {
    if (files.length >= MAX_FILES) return
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (files.length >= MAX_FILES) return
      const full = join(dir, e.name)
      if (e.isDirectory()) {
        if (!IGNORE_DIRS.has(e.name) && !e.name.startsWith('.')) walk(full)
      } else if (EXTS.has(extname(e.name))) {
        try {
          if (statSync(full).size > MAX_FILE_BYTES) continue
          files.push({ path: relative(root, full), code: readFileSync(full, 'utf8') })
        } catch {
          /* unreadable file — skip */
        }
      }
    }
  }
  walk(root)
  return { files, truncated: files.length >= MAX_FILES }
}
