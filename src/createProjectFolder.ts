import { mkdirSync, readdirSync } from 'fs'
import * as colors from 'kleur/colors'
import { join } from 'path'
import { removeRecursiveForce, toRelativePath } from './folder'

export const ignoredPaths = [
  '.DS_Store',
  'Thumbs.db',
  '.git',
  '.gitignore',
  '.idea',
  'README.md',
  'LICENSE',
  '.hg',
  '.hgignore',
  '.hgcheck',
  '.npmignore',
  'mkdocs.yml',
  '.travis.yml',
  '.gitlab-ci.yml',
  '.gitattributes',
]

export const logFiles = ['npm-debug.log', 'yarn-error.log', 'yarn-debug.log']

export const createProjectFolder = (
  projectPath: string,
  projectName: string,
  folderAlreadyExist: boolean = false,
): boolean => {
  if (!folderAlreadyExist) {
    // create shallow directory structure
    mkdirSync(projectPath, { recursive: true })
  }

  if (!isSafeToCreateAppIn(projectPath, projectName)) {
    return false
  }

  console.log(`Creating a new project in ${colors.green(toRelativePath(projectPath, process.cwd()))}.`)

  return true
}

export const isSafeToCreateAppIn = async (projectPath: string, name: string) => {
  console.log()
  const conflicts = readdirSync(projectPath)
    .filter((file: string) => !ignoredPaths.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter((file: string) => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter((file: string) => !logFiles.some((pattern) => file.indexOf(pattern) === 0))

  if (conflicts.length > 0) {
    console.log(
      `${colors.bold(colors.white(colors.bgRed('[!!] FATAL')))}: The folder ${colors.green(
        projectPath,
      )} contains conflicting files:`,
    )
    console.log()
    for (const file of conflicts) {
      console.log(colors.red(`  ${file}`))
    }
    console.log()
    console.log('Either try a different project name, a different output folder or remove the conflicting files.')

    process.exit(1)
  }

  // Remove any remnant files from a previous installation
  const currentFiles = readdirSync(join(projectPath))
  for (let i = 0; i < currentFiles.length; i++) {
    const file = currentFiles[i]
    if (logFiles.find((errorLogFilePattern: string) => file.indexOf(errorLogFilePattern) === 0)) {
      removeRecursiveForce(join(projectPath, file))
    }
  }
  return true
}
