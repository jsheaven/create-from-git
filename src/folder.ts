import { dirname, join, parse, resolve } from 'path'
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import { mkdir, rm } from 'fs/promises'
import { fileURLToPath } from 'url'
import fg from 'fast-glob'

/** checks if the path provided is an existing directory */
export const isExistingDir = (path: string) => existsSync(path) && lstatSync(path).isDirectory()

/** looks for all files in the path pattern provided  */
export const glob = (pathPattern: string): Array<string> => fg.sync(pathPattern, { dot: true })

/** turns an absolute path into a shortened, project root relative such as ./src/foo.tsx */
export const toRelativePath = (path: string, basePath: string) => path.replace(basePath, '.')

/** copies files and directories recursively from fromPath to destPath */
export const copyFiles = (fromPath: string, destPath: string) => {
  const fromPathStat = lstatSync(fromPath)

  mkdirSync(parse(destPath).dir, { recursive: true })

  if (fromPathStat.isFile() && existsSync(destPath) && lstatSync(destPath).isDirectory()) {
    destPath = join(destPath, parse(fromPath).base)
  }

  cpSync(fromPath, destPath, {
    dereference: true,
    errorOnExist: false,
    recursive: true,
    force: true,
  })
  return destPath
}

/** generates a temporary folder to use that is hard to guess */
export const makeTempDir = () => join(mkdtempSync(join(tmpdir(), `${randomBytes(8).readBigUInt64LE(0).toString()}-`)))

/** basically, rm -rf $path */
export const removeRecursiveForce = (path: string) => rm(path, { recursive: true, force: true })

/** return true if a glob pattern exists in the path provided */
export const hasGlobPattern = (path: string) => path.indexOf('*') > -1 || path.indexOf('{') > -1

/** returns true if the comparePath shared the same basePath */
export const hasSameBasePath = (basePath: string, comparePath: string): boolean => comparePath.startsWith(basePath)

/** returns true if comparePath shares base with one of the basePaths  */
export const isExcludedByBasePath = (basePaths: Array<string>, comparePath: string): boolean => {
  for (let i = 0; i < basePaths.length; i++) {
    if (hasSameBasePath(basePaths[i], comparePath)) return true
  }
  return false
}

/** returns true if the path contains the string node_modules/ */
export const isNodeModulesPath = (path: string) => path.indexOf('node_modules/') > -1

/** ensures, that the directory sturcture of the path provided exists */
export const ensureDir = async (path: string) => await mkdir(dirname(path), { recursive: true })
