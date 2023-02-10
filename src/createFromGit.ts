import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import * as inquirer from 'inquirer'
import * as colors from 'kleur/colors'
import { printFooter } from './printFooter'
import { execSync } from 'child_process'
import { createProjectFolder } from './createProjectFolder'
import { cloneRepository } from './cloneRepository'
import { validateProjectDirectoryInput } from './validateProjectDirectoryInput'
import { installModules } from './installModules'
import { copyTemplate } from './copyTemplate'
import { toRelativePath } from './folder'

export interface CreateFromGitConfig {
  /** git URL or folder path on disk */
  from: string
  /** folder to write too (subfolder) */
  to: string
  /** new projects name */
  projectName: string
}

/** creates a new project from a template named (default: examples/init), given a projectName */
export const createFromGit = async ({ from, to, projectName }: CreateFromGitConfig) => {
  if (!to) to = '.'

  if (!from) {
    console.log(colors.yellow('[??] FATAL: No template path/git repo specified. Add: --from $pathToTplOrGitRepo'))
    process.exit(1)
  }

  const isGitRepo = from.startsWith('http')

  if (isGitRepo) {
    from = await cloneRepository(from)
  } else if (!existsSync(from)) {
    console.log(colors.red(`[!!] Error: The template ${from} doesn't exist. Exiting.`))
    process.exit(1)
  }

  if (!projectName) {
    // get project directory name
    const choiceProjectName = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'projectName',
        default: 'MyNewProject',
        message: `Please specify the project name (e.g. ${colors.cyan('MyNewProject')}):`,
        validate: validateProjectDirectoryInput,
      },
    ])
    projectName = choiceProjectName.projectName
  }

  const projectPathName = projectName!.toLowerCase()
  const projectPath = resolve(to, projectPathName)
  const folderAlreadyExist = existsSync(projectPath)

  if (folderAlreadyExist) {
    const shouldOverride = await inquirer.default.prompt([
      {
        type: 'confirm',
        default: true,
        name: 'answer',
        message: `${colors.bold(colors.yellow(`[??] WARN`))}: The output directory ${colors.green(
          toRelativePath(projectPath, process.cwd()),
        )} already exists. Merge it?`,
      },
    ])

    if (!shouldOverride.answer) {
      return false
    }
  }

  if (!createProjectFolder(projectPath, projectPathName, folderAlreadyExist)) {
    return false
  }

  let dependenciesAsString: Array<string>
  let devDependenciesAsString: Array<string>
  let canInstallModules = false
  try {
    const packageJSON: { dependencies: any; devDependencies: any } = JSON.parse(
      readFileSync(join(from, 'package.json'), { encoding: 'utf8' }),
    )
    dependenciesAsString = transformPackageDependenciesToStrings(packageJSON, 'dependencies')
    devDependenciesAsString = transformPackageDependenciesToStrings(packageJSON, 'devDependencies')
    canInstallModules = true
  } catch (e) {}
  if (!copyTemplate(projectPath, from, projectName!)) {
    return false
  }

  if (isGitRepo) {
    // TODO: fix system independent
    execSync(`rm -rf ${from}`, {
      stdio: 'inherit',
    })
  }

  if (canInstallModules && !(await installModules(projectPath, dependenciesAsString, devDependenciesAsString))) {
    return false
  }
  printFooter(projectPath)
}

const transformPackageDependenciesToStrings = (packageJson: any, key: string): Array<string> => {
  const dependencies: Array<string> = []
  for (const dependencyName in packageJson[key]) {
    dependencies.push(`${dependencyName}@${packageJson[key][dependencyName]}`)
  }
  return dependencies
}
