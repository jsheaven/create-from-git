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
//import { fileURLToPath } from 'url'
import { getOwnVersion } from './version'

//const __dirname = dirname(fileURLToPath(import.meta.url))

/** creates a new project from a template named (default: examples/init), given a projectName */
export const createFromGit = async (tplDir: string, projectName?: string, outputDir: string = '.') => {
  if (!tplDir) {
    console.log(colors.yellow('[??] FATAL: No template path/git repo specified. Add: --tpl $pathToTplOrGitRepo'))
    process.exit(1)
  }

  const isGitRepo = tplDir.startsWith('http')

  if (isGitRepo) {
    tplDir = await cloneRepository(tplDir)
  } else if (!existsSync(tplDir)) {
    console.log(colors.red(`[!!] Error: The template ${tplDir} doesn't exist. Exiting.`))
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
  const projectPath = resolve(outputDir, projectPathName)
  const folderAlreadyExist = existsSync(projectPath)

  if (folderAlreadyExist) {
    const shouldOverride = await inquirer.default.prompt([
      {
        type: 'confirm',
        default: false,
        name: 'answer',
        message: colors.yellow(
          `[??] WARN: The output directory ${projectPath} already exists. Do you want to override it?`,
        ),
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
      readFileSync(join(tplDir, 'package.json'), { encoding: 'utf8' }),
    )
    dependenciesAsString = transformPackageDependenciesToStrings(packageJSON, 'dependencies')
    devDependenciesAsString = transformPackageDependenciesToStrings(packageJSON, 'devDependencies')
    canInstallModules = true
  } catch (e) {}
  if (!copyTemplate(projectPath, tplDir, projectName!)) {
    return false
  }

  if (isGitRepo) {
    execSync(`rm -rf ${tplDir}`, {
      stdio: 'inherit',
    })
  }

  if (canInstallModules && !(await installModules(projectPath, dependenciesAsString, devDependenciesAsString))) {
    return false
  }

  const packageJson: { homepage: string; bugs: { url: string } } = await getOwnVersion()

  printFooter(packageJson.homepage, projectPath, packageJson.bugs.url)
}

const transformPackageDependenciesToStrings = (packageJson: any, key: string): Array<string> => {
  const dependencies: Array<string> = []
  for (const dependencyName in packageJson[key]) {
    dependencies.push(`${dependencyName}@${packageJson[key][dependencyName]}`)
  }
  return dependencies
}
