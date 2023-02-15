import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { relative, join, resolve } from 'path'
import * as colors from 'kleur/colors'

const TEMPLATE_LOWER_REGEX = /templatename/g
const TEMPLATE_DASH_LOWER_REGEX = /template-name/g
const TEMPLATE_UNDERSCORE_REGEX = /template_name/g
const TEMPLATE_LOWER_UPPER_REGEX = /templateName/g
const TEMPLATE_UPPER_REGEX = /TemplateName/g
const TEMPLATE_UPPER_UPPER_REGEX = /TEMPLATE_NAME/g

export interface CopyRenameReplaceFileOptions {
  filePath: string
  templateFolderPath: string
  projectPath: string
  concreteName: string
}

export const copyAndMaterializeFile = (options: CopyRenameReplaceFileOptions) => {
  const lcfirst = (s: string) => s.replace(/^\w/, (c) => c.toLocaleLowerCase())

  let fileName = relative(options.templateFolderPath, options.filePath)
    .replace(TEMPLATE_UPPER_REGEX, options.concreteName.replace(/\-/g, ''))
    .replace(TEMPLATE_LOWER_REGEX, options.concreteName.replace(/\-/g, ''))
    .replace(TEMPLATE_UNDERSCORE_REGEX, options.concreteName.replace(/\-/g, '_'))
    .replace(TEMPLATE_UPPER_UPPER_REGEX, options.concreteName.toLocaleUpperCase().replace(/\-/g, '_'))
    .replace(TEMPLATE_LOWER_UPPER_REGEX, lcfirst(options.concreteName).replace(/\-/g, ''))
    .replace(options.concreteName, camelToKebabCase(options.concreteName).toLocaleLowerCase())

  if (fileName[0] === '-') fileName = fileName.substring(1)

  const newFilePath = join(options.projectPath, fileName)
  mkdirSync(resolve(newFilePath, '..'), { recursive: true })

  // whitelist
  if (isProgramCodeFile(options.filePath)) {
    const programCode = readFileSync(options.filePath, { encoding: 'utf8' })
      .replace(TEMPLATE_LOWER_REGEX, options.concreteName.toLocaleLowerCase().replace(/\-/g, ''))
      .replace(TEMPLATE_DASH_LOWER_REGEX, options.concreteName.toLocaleLowerCase())
      .replace(TEMPLATE_UNDERSCORE_REGEX, options.concreteName.toLocaleLowerCase().replace(/\-/g, '_'))
      .replace(TEMPLATE_UPPER_UPPER_REGEX, options.concreteName.toLocaleUpperCase().replace(/\-/g, '_'))
      .replace(TEMPLATE_LOWER_UPPER_REGEX, lcfirst(options.concreteName).replace(/\-/g, ''))
      .replace(TEMPLATE_UPPER_REGEX, kebabToCamelCase(options.concreteName).replace(/\-/g, ''))

    writeFileSync(newFilePath, programCode)
  } else {
    copyFileSync(options.filePath, newFilePath)
  }

  console.log(`- ${colors.cyan(fileName)}`)
}

// TODO: add API and CLI option to enhance this array
const PROGRAM_CODE_FILE_EXTENSIONS = [
  '.astro',
  '.tsx',
  '.js',
  '.jsx',
  '.ts',
  '.html',
  '.css',
  '.json',
  '.json5',
  '.md',
  '.mdx',
  '.yml',
  '.yaml',
]

export const isProgramCodeFile = (fileName: string): boolean => {
  if (!fileName) {
    return false
  }
  return !!PROGRAM_CODE_FILE_EXTENSIONS.find((value: string) => fileName.endsWith(value))
}

export const kebabToCamelCase = (name: string = ''): string =>
  name
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    // transform overall first character upper case too
    .replace(/([a-zA-Z])/, (g) => g[0].toUpperCase())

export const camelToKebabCase = (name: string = '') =>
  name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
