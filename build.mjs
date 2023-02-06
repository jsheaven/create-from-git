import { buildForNode } from '@jsheaven/easybuild'

await buildForNode({
  entryPoint: './src/index.ts',
  outfile: './dist/index.js',
})

await buildForNode({
  entryPoint: './src/cli.ts',
  outfile: './dist/cli.js',
  esBuildOptions: {
    bundle: true,
  },
})
