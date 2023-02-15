import { buildForNode } from '@jsheaven/easybuild'

await buildForNode({
  entryPoint: './src/index.ts',
  outfile: './dist/index.js',
  debug: process.argv.indexOf('--dev') > -1,
  esBuildOptions: {
    logLevel: 'error',
  },
})

await buildForNode({
  entryPoint: './src/cli.ts',
  outfile: './dist/cli.js',
  debug: process.argv.indexOf('--dev') > -1,
  esBuildOptions: {
    bundle: true,
    logLevel: 'error',
  },
})
