import { getPackageJson } from './file'
import { resolve, parse } from 'path'
import { fileURLToPath } from 'url'

export const getOwnVersion = async () =>
  await getPackageJson(resolve(parse(fileURLToPath(import.meta.url)).dir, '../package.json'))
