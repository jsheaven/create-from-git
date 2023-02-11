<h1 align="center">create-from-git</h1>

> Scaffolds a new project using `git checkout` and smart, in-file string replacements. Comes with an API and CLI: `npx create-from-git`. Runs on Mac, Windows and Linux.

<h2 align="center">User Stories</h2>

1. As a developer of a product, I don't want to repeat myself again and again when I'm going to start a new project. I need a CLI that can copy over an arbitrary, ready-made project template from an arbitrary git repository, but don't clone it and also get the `.git` metadata, but check it out, and simply replace everything that is named `templateName`, `template-name`, `template_name` or `TemplateName` with the name of my new project in all files and file names so that I don't have to do that manually again and again.

2. As a developer of a framework, I need a library that can generate new projects from templates that I prepared, so that my users can use my CLI or the CLI of that tool to use my framework with ease by not starting from scratch.

<h2 align="center">Features</h2>

- ✅ Generate a new software project from scratch by using `git checkout`
- ✅ Agnostic to programming language, frameworks etc. pp.
- ✅ Available as a simple API and simple to use CLI
- ✅ Just `5k` nano sized (ESM, gizpped)
- ✅ Tree-shakable and side-effect free
- ✅ Async from the ground up
- ✅ Runs on Windows, Mac, Linux, CI tested
- ✅ First class TypeScript support
- ✅ Only JS Heaven maintained dependencies
- ✅ 100% Unit Test coverage

<h2 align="center">Example usage (CLI)</h2>

`npx create-from-git@latest --from https://github.com/jsheaven/template-for-libraries --name MyNewProject`

> You need at least version 18 of [Node.js](https://www.nodejs.org) installed.

<h2 align="center">Example usage (API, as a library)</h2>

<h3 align="center">Setup</h3>

- yarn: `yarn add create-from-git`
- npm: `npm install create-from-git`

<h3 align="center">ESM</h3>

```ts
import { createFromGit } from 'create-from-git'

try {
  const statusReport = await createFromGit({
    from: 'git@github.com/jsheaven/template-for-libraries',
    to: '.',
    projectName: 'MyNewProject',
  })
} catch (e) {
  console.error('Scaffolding went wrong: ', e)
}
```

<h3 align="center">CommonJS</h3>

```ts
const { createFromGit } = require('create-from-git')

// same API like ESM variant
```
