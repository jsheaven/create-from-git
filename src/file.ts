import { readFile } from 'fs/promises'

/** reads file contents as a UTF8 encoded string */
export const readFileContent = async (filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> =>
  readFile(filePath, { encoding })

/** returns the package.json object parsed */
export const getPackageJson = async (packageJsonPath: string) => {
  return JSON.parse(await readFileContent(packageJsonPath))
}
