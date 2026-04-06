import { createInterface } from 'node:readline';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const docsDir = join(root, 'content', 'docs');

async function main() {
  console.log('\n  New Page\n  ────────\n');

  const section = (await ask('  Section (e.g. Getting started, Authoring, Theming, Deployment): ')).trim();
  if (!section) {
    console.log('  Section is required. Aborting.');
    rl.close();
    return;
  }

  const title = (await ask('  Title: ')).trim();
  if (!title) {
    console.log('  Title is required. Aborting.');
    rl.close();
    return;
  }

  const defaultSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = (await ask(`  Slug (${defaultSlug}): `)).trim() || defaultSlug;

  const description = (await ask('  Description: ')).trim() || `${title} documentation.`;

  const order = parseInt((await ask('  Order (e.g. 10, 20, 30): ')).trim(), 10) || 10;

  // Derive folder name from section
  const folderName = section.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sectionDir = join(docsDir, folderName);

  if (!existsSync(sectionDir)) {
    mkdirSync(sectionDir, { recursive: true });
    console.log(`\n  Created section directory: content/docs/${folderName}/`);
  }

  const filePath = join(sectionDir, `${slug}.mdx`);

  if (existsSync(filePath)) {
    console.log(`\n  File already exists: content/docs/${folderName}/${slug}.mdx`);
    rl.close();
    return;
  }

  const content = `---
title: "${title}"
description: "${description}"
section: "${section}"
order: ${order}
---

Start writing your content here.
`;

  writeFileSync(filePath, content);

  console.log(`\n  Created: content/docs/${folderName}/${slug}.mdx`);
  console.log(`\n  Next steps:`);
  console.log(`    1. Edit the file to add your content`);
  console.log(`    2. Run \`npm run dev\` to preview\n`);

  rl.close();
}

main();
