#!/usr/bin/env node

import { createCli } from './cli'

const program = createCli()

program.parseAsync(process.argv).catch((error: unknown): void => {
	const message = error instanceof Error ? error.message : String(error)
	process.stderr.write(`${message}\n`)
	process.exit(1)
})
