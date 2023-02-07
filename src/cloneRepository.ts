import { execSync } from 'child_process'
import { ensureDir, makeTempDir } from './folder'

export const cloneRepository = async (url: string): Promise<string> => {
  const cloneDir = makeTempDir()

  execSync(`rm -rf ${cloneDir}`, {
    stdio: 'inherit',
  })

  await ensureDir(cloneDir)

  execSync(`git clone ${url} ${cloneDir}`, {
    stdio: 'inherit',
  })

  return cloneDir
}
