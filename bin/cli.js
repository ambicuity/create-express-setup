#!/usr/bin/env node
import { intro, outro, confirm, spinner } from '@clack/prompts';
import chalk from 'chalk';
import { runInteractive } from '../src/prompts.js';
import { scaffoldProject } from '../src/scaffold.js';
import { generateCRUD } from '../src/crud.js';

const args = process.argv.slice(2);
const crudIndex = args.indexOf('--crud');

if (crudIndex !== -1 && args[crudIndex + 1]) {
    const crudModel = args[crudIndex + 1];
    await generateCRUD(crudModel);
    process.exit(0);
}

const hasPositionalName = args.length >= 1 && !args[0].startsWith('--');

let options;
if (hasPositionalName) {
    const projectName = args[0];
    options = await runInteractive(projectName);
} else {
    options = await runInteractive(null);
}

await scaffoldProject(options);

let nextSteps = '';
if (options.projectName !== '.') {
    nextSteps += `  cd ${options.projectName}\n`;
}
nextSteps += `  npm run dev`;

outro(`${chalk.green('✅ Project scaffolded successfully!')}
\n${chalk.cyan('═'.repeat(60))}
${chalk.bold('Next steps:')}
${chalk.cyan(nextSteps)}\n${chalk.cyan('═'.repeat(60))}
${chalk.dim('📦 Dependencies installed and Git initialized.')}`);