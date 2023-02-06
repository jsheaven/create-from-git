import { build } from 'esbuild'
import { extname, dirname } from 'path'
import { readFile } from 'fs/promises'
import { basename, parse } from 'path'
import { green, red, yellow, white } from 'kleur/colors'
import { gzipSize } from 'gzip-size'
import brotliSize from 'brotli-size'
import prettyBytes from 'pretty-bytes'
import fastGlob from 'fast-glob'

const makeAllPackagesExternalPlugin = {
  name: 'make-all-packages-external',
  setup(build) {
    let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({ path: args.path, external: true }))
  },
}

const getPadLeft = (str, width, char = ' ') => char.repeat(width - str.length)

const formatSize = (size, filename, type, raw) => {
  const pretty = raw ? `${size} B` : prettyBytes(size)
  const color = size < 5000 ? green : size > 40000 ? red : yellow
  const indent = getPadLeft(pretty, 13)
  return `${indent}${color(pretty)}: ${white(basename(filename))}${type ? `.${type}` : ''}`
}

const getSizeInfo = async (code, filename, raw) => {
  raw = raw || code.length < 5000

  const [gzip, brotli] = await Promise.all([
    gzipSize(code).catch(() => null),
    brotliSize.default(code).catch(() => null),
  ])

  let out = formatSize(gzip, filename, 'gz', raw)
  if (brotli) {
    out += '\n' + formatSize(brotli, filename, 'br', raw)
  }

  return out
}

const esmDirnamePlugin = {
  name: 'esmDirname',
  setup(build) {
    const nodeModules = new RegExp(/^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/)
    build.onLoad({ filter: /.*/ }, async ({ path: filePath }) => {
      if (!filePath.match(nodeModules)) {
        let contents = await readFile(filePath, 'utf8')
        const loader = extname(filePath).substring(1)
        const _dirname = dirname(filePath)
        contents = contents.replaceAll('__dirname', `"${_dirname}"`).replaceAll('__filename', `"${filePath}"`)
        return {
          contents,
          loader,
        }
      }
    })
  },
}

const baseConfig = {
  //entryPoints: ['./src/cli.ts'],
  sourcemap: 'external',
  //format: 'iife',
  target: 'esnext',
  bundle: true,
  minify: true,
  minifySyntax: true,
  minifyIdentifiers: true,
  minifyWhitespace: true,
  //platform: 'node',
  plugins: [esmDirnamePlugin, makeAllPackagesExternalPlugin],
  legalComments: 'none',
}

const printFileSizes = async () => {
  const jsFiles = fastGlob.sync('./dist/*.*js')
  jsFiles.forEach(async (jsFilePath) => {
    const code = await readFile(jsFilePath)
    console.log(await getSizeInfo(code, jsFilePath, code))
    console.log(formatSize(Buffer.from(code).byteLength, jsFilePath))
  })
}

Promise.all(
  ['iife', 'esm', 'cjs'].map(async (format) => {
    await build({
      ...baseConfig,
      entryPoints: ['./src/cli.ts'],
      format,
      outfile: `./dist/cli.${format}.${format === 'esm' ? 'mjs' : 'js'}`,
      platform: 'node',
    })
  }),
).then(printFileSizes)
