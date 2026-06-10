import { parse } from '@babel/parser'
import traverseModule from '@babel/traverse'

// @babel/traverse ships CJS; interop differs across Node versions.
export const traverse = traverseModule.default || traverseModule

/** Parse one source file into an AST, or null if unparseable. */
export function parseSource(code, path) {
  try {
    return parse(code, {
      sourceType: 'unambiguous',
      errorRecovery: true,
      plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
      sourceFilename: path,
    })
  } catch {
    return null
  }
}
