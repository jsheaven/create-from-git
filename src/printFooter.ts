import * as colors from 'kleur/colors'

export const printFooter = (projectPath: string) => {
  console.log('')
  console.log(colors.green(`Thank you for using ${colors.bold(colors.yellow('create-from-git'))}!`))
  console.log('')
  console.log('The project has been created in:')
  console.log('')
  console.log(`    ${colors.green(`cd ${projectPath}`)}`)
  console.log('')
  console.log(colors.bold('Have a lot of fun!'))
  console.log('')
}
