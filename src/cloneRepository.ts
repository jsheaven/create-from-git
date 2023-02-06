import { execSync } from 'child_process'
import { ensureDir } from './folder'

export const cloneRepository = async (url: string): Promise<string> => {
  const cloneDir = '.clone'

  execSync(`rm -rf ${cloneDir}`, {
    stdio: 'inherit',
  })

  await ensureDir(cloneDir)

  execSync(`git clone ${url} ${cloneDir}`, {
    stdio: 'inherit',
  })

  return cloneDir
}
