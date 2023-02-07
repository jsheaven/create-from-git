#!/usr/bin/env node
'use strict'

import * as colors from 'kleur/colors'
import yargs from 'yargs-parser'
import { createFromGit } from './createFromGit'
import { getOwnVersion } from './version'

export type Arguments = yargs.Arguments

export enum Commands {
  HELP = 'help',
  VERSION = 'version',
  SCAFFOLD = 'scaffold',
}

export type Command = 'help' | 'version' | 'scaffold'

export interface CLIState {
  cmd: Command
  options: {
    from?: string
    to?: string
    projectName?: string
  }
}

/** Determine which action the user requested */
export const resolveArgs = (flags: Arguments): CLIState => {
  const options: CLIState['options'] = {
    from: typeof flags.from === 'string' ? flags.from : undefined,
    to: typeof flags.to === 'string' ? flags.to : undefined,
    projectName: typeof flags.name === 'string' ? flags.name : undefined,
  }

  if (flags.version) {
    return { cmd: 'version', options }
  } else if (flags.help) {
    return { cmd: 'help', options }
  }

  const cmd: Command = flags._[2] as Command
  switch (cmd) {
    default:
      return { cmd: 'scaffold', options }
  }
}

/** Display --help flag */
const printHelp = () => {
  console.error(`  ${colors.bold('create-from-git')} - a project scaffolder
  ${colors.bold('Commands:')}
  run version          Show the program version.
  run help             Show this help message.
  run scaffold         Create a new project from template folder or git repository URL.
  ${colors.bold('Flags:')}
  --name <projectName>  Name of your new project [Default: prompted] (./$projectName/*)
  --from <gitUrl|path>  URL to a git repository or path to a folder on disk
  --to <outDir>         Output folder to save the new project in [Default: .] (./$outDir/$projectName/*)
  --version             Show the version number and exit.
  --help                Show this help message.

  Example call:
  npx create-from-git --from https://github.com/jsheaven/runtime-info --name MyRuntimeInfo
`)
}

/** display --version flag */
const printVersion = async () => {
  console.log((await getOwnVersion()).version)
}

/** The primary CLI action */
export const cli = async (args: string[]) => {
  const flags = yargs(args)
  const state = resolveArgs(flags)
  const options = { ...state.options }

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
    case 'scaffold': {
      try {
        await createFromGit({
          from: options.from,
          projectName: options.projectName,
          to: options.to,
        })
      } catch (e) {
        throwAndExit(e)
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
