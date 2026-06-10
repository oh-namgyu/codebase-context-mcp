#!/usr/bin/env node
import { program } from 'commander'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { analyzeRepo } from './model.js'
import { render } from './render.js'

program
  .name('codebase-context')
  .description('Static codebase analysis — repo map, import graph, API routes, cross-stack edges')
  .command('analyze')
  .argument('<path>', 'repo root to analyze')
  .option('-f, --format <format>', 'md | json | mermaid', 'md')
  .action((path, opts) => {
    const root = resolve(path)
    if (!existsSync(root)) {
      console.error(`path not found: ${root}`)
      process.exit(1)
    }
    process.stdout.write(render(analyzeRepo(root), opts.format))
  })

program.parse()
