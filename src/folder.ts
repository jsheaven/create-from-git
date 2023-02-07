import { dirname, join } from 'path'
import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import { mkdir, rm } from 'fs/promises'

/** turns an absolute path into a shortened, project root relative such as ./src/foo.tsx */
export const toRelativePath = (path: string, basePath: string) => path.replace(basePath, '.')

/** generates a temporary folder to use that is hard to guess */
export const makeTempDir = () => join(mkdtempSync(join(tmpdir(), `${randomBytes(8).readBigUInt64LE(0).toString()}-`)))

/** basically, rm -rf $path */
export const removeRecursiveForce = (path: string) => rm(path, { recursive: true, force: true })

/** ensures, that the directory sturcture of the path provided exists */
export const ensureDir = async (path: string) => await mkdir(dirname(path), { recursive: true })
