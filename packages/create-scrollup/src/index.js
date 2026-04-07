#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { createInterface } from 'readline';
import { resolve, join } from 'path';

const BOLD  = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN  = '\x1b[36m';
const DIM   = '\x1b[2m';
const RESET = '\x1b[0m';

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(question, a => { rl.close(); res(a.trim()); }));
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  return result.status === 0;
}

async function main() {
  console.log(`\n${BOLD}create-scrollup${RESET} ${DIM}— Scrollup documentation site scaffolder${RESET}\n`);

  let dir = process.argv[2];

  if (!dir) {
    const answer = await ask(`${BOLD}Where should we create your site?${RESET} ${DIM}(./my-docs)${RESET} `);
    dir = answer || 'my-docs';
  }

  const target = resolve(process.cwd(), dir);

  if (existsSync(target)) {
    console.error(`\nError: "${dir}" already exists. Choose a different directory.\n`);
    process.exit(1);
  }

  console.log(`\nScaffolding into ${CYAN}${dir}${RESET}...\n`);

  const ok = run('git', [
    'clone',
    '--depth=1',
    '--single-branch',
    'https://github.com/codejumbo/scrollup.git',
    target,
  ]);

  if (!ok) {
    console.error('\nFailed to clone template. Make sure git is installed and you have internet access.\n');
    process.exit(1);
  }

  rmSync(join(target, '.git'), { recursive: true, force: true });

  console.log(`
${GREEN}${BOLD}Done!${RESET} Your Scrollup site is ready in ${CYAN}${dir}/${RESET}

  ${CYAN}cd ${dir}${RESET}
  ${CYAN}npm install${RESET}
  ${CYAN}npm run dev${RESET}       ${DIM}→ http://localhost:4321${RESET}

  ${CYAN}npm run setup${RESET}     ${DIM}→ customize site name & accent color${RESET}
`);
}

main().catch(e => {
  console.error(`\nUnexpected error: ${e.message}\n`);
  process.exit(1);
});
