import { ensureDir, removeRecursiveForce } from './folder'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { Stream } from 'stream'

export type Content =
  | string
  | NodeJS.ArrayBufferView
  | Iterable<string | NodeJS.ArrayBufferView>
  | AsyncIterable<string | NodeJS.ArrayBufferView>
  | Stream

/** persists a file and recursively creates the path if necessary */
export const persistFileAbsolute = async (destPath: string, content: Content, encoding: BufferEncoding = 'utf-8') => {
  // create shallow directory structure
  await ensureDir(destPath)

  // remove first
  if (existsSync(destPath)) {
    await removeRecursiveForce(destPath)
  }

  // write file contents
  return writeFile(destPath, content, { encoding })
}

/** reads file contents as a UTF8 encoded string */
export const readFileContent = async (filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> =>
  readFile(filePath, { encoding })

/** writes contents to a file, UTF8 encoded */
export const writeFileContent = async (
  filePath: string,
  contents: string,
  encoding: BufferEncoding = 'utf-8',
): Promise<void> => writeFile(filePath, contents, { encoding })

/** returns the package.json object parsed */
export const getPackageJson = async (packageJsonPath: string) => {
  return JSON.parse(await readFileContent(packageJsonPath))
}
