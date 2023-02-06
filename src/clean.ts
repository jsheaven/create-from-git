import * as colors from 'kleur/colors'
import { resolve } from 'path'
import { removeRecursiveForce } from './folder'

/** removes the projects dist folder to clean the cache */
export const clean = async (pathToClean: string) => {
  pathToClean = resolve(process.cwd(), pathToClean)

  console.log(colors.bold(colors.dim('task (clean):')), colors.gray(`Removing ${colors.green(pathToClean)}...`))

  // TODO
  console.log('TODO: yep')
  //return removeRecursiveForce(pathToClean)
}
