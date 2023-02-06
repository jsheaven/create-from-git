#!/usr/bin/env node
'use strict'

import * as colors from 'kleur/colors'
import yargs from 'yargs-parser'
import { clean } from './clean'
import { getPackageJson } from './file'

export type Arguments = yargs.Arguments

export enum Commands {
  HELP = 'help',
  VERSION = 'version',
  CLEAN = 'clean',
  SCAFFOLD = 'scaffold',
}

export type Command = 'help' | 'version' | 'clean' | 'scaffold'

export interface CLIState {
  cmd: Command
  options: {
    tpl?: string
    outputDirectory?: string
    projectName?: string
  }
}

/** Determine which action the user requested */
export const resolveArgs = (flags: Arguments): CLIState => {
  const options: CLIState['options'] = {
    tpl: typeof flags.tpl === 'string' ? flags.tpl : undefined,
    outputDirectory: typeof flags.outputDirectory === 'string' ? flags.outputDirectory : undefined,
    projectName: typeof flags.projectName === 'string' ? flags.projectName : undefined,
  }

  if (flags.version) {
    return { cmd: 'version', options }
  } else if (flags.help) {
    return { cmd: 'help', options }
  }

  const cmd: Command = flags._[2] as Command
  switch (cmd) {
    case 'clean':
      return { cmd: 'clean', options }
    default:
      return { cmd: 'scaffold', options }
  }
}

/** Display --help flag */
const printHelp = () => {
  console.error(`  ${colors.bold('Vanil')} - a solid site generator
  ${colors.bold('Commands:')}
  run dev             Run in development mode (live-reload).
  run build           Build a pre-compiled production version of your site.
  run preview         Preview your build locally before deploying.
  run config          Prints the final config and explains how to customize it.
  run clean           Removes the dist folder of your site; this cleans the cache.
  run init <dir>      Scaffolds a new project in <dir>.
  ${colors.bold('Flags:')}
  --prod                Run in production mode.
  --port <number>       Specify port to serve on (dev, preview only).
  --project-root <path> Specify the path to the project root folder, relative to CWD.
  --site <uri>          Specify site to use as site location.
  --use-tls             Enables https:// for all URIs.
  --dist                Specify the distribution folder (build result).
  --hostname <string>   Specify hostname to serve on (dev, preview only).
  --no-sitemap          Disable sitemap generation (build only).
  --version             Show the version number and exit.
  --help                Show this help message.
  ${colors.bold('For creating new projects (run init):')}
  --name <project-name> Name of the project (only useful with "init").
  --tpl <dir-or-repo>   Path to a template folder or git repository.
`)
}

/** display --version flag */
const printVersion = async () => {
  // TODO: get install folder package.json
  console.log((await getOwnVersion()).version)
}

const getOwnVersion = async () => await getPackageJson('../package.json')

export const callCleanCommand = async (outputDirectory: string) => {
  await clean(outputDirectory)
}

/** The primary CLI action */
export const cli = async (args: string[]) => {
  const flags = yargs(args)
  const state = resolveArgs(flags)
  const options = { ...state.options }

  try {
    console.log('Have to do something', flags, 'state', state, 'options', options)
  } catch (err) {
    console.error(colors.red((err as any).toString() || err))
    process.exit(1)
  }

  console.log(
    colors.dim('>'),
    `${colors.bold(colors.yellow('create-from-git'))} @ ${colors.dim(
      (await getOwnVersion()).version,
    )}: ${colors.magenta(colors.bold(state.cmd))}`,
    colors.gray('...'),
  )

  switch (state.cmd) {
    case 'help': {
      printHelp()
      process.exit(0)
    }
    case 'version': {
      await printVersion()
      process.exit(0)
    }
    case 'clean': {
      try {
        // TODO: implement
        await callCleanCommand('???')
      } catch (err) {
        throwAndExit(err)
      }
      process.exit(0)
    }
    default: {
      throw new Error(`Error running ${state.cmd}`)
    }
  }
}

const printError = (err: any) => console.error(colors.red(err.toString() || err))

/** Display error and exit */
const throwAndExit = (err: any) => {
  printError(err)
  process.exit(1)
}

try {
  cli(process.argv)
} catch (error) {
  console.error(error)
  process.exit(1)
}
