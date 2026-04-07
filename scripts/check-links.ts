import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const docsDir = join(import.meta.dirname, '..', 'content', 'docs');

function getMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getMarkdownFiles(full));
    } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function getSlugs(files: string[]): Set<string> {
  const slugs = new Set<string>();
  for (const file of files) {
    const rel = relative(docsDir, file).replace(/\.mdx?$/, '');
    slugs.add(rel);
  }
  return slugs;
}

const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

function checkFile(filePath: string, slugs: Set<string>): { file: string; line: number; link: string; text: string }[] {
  const raw = readFileSync(filePath, 'utf-8');
  // Blank out fenced code blocks so links inside them are not checked
  const content = raw.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, ' '));
  const lines = content.split('\n');
  const errors: { file: string; line: number; link: string; text: string }[] = [];
  const rel = relative(docsDir, filePath);

  for (let i = 0; i < lines.length; i++) {
    let match;
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(lines[i])) !== null) {
      const [, text, href] = match;

      // Skip external links, anchors, and mailto
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#') || href.startsWith('mailto:')) {
        continue;
      }

      // Normalize internal link: /getting-started/intro -> getting-started/intro
      let target = href.replace(/^\//, '').replace(/\/$/, '').replace(/#.*$/, '');

      if (!slugs.has(target)) {
        errors.push({ file: rel, line: i + 1, link: href, text });
      }
    }
  }

  return errors;
}

const files = getMarkdownFiles(docsDir);
const slugs = getSlugs(files);
let totalErrors = 0;

for (const file of files) {
  const errors = checkFile(file, slugs);
  for (const err of errors) {
    console.error(`  ${err.file}:${err.line} - broken link: [${err.text}](${err.link})`);
    totalErrors++;
  }
}

if (totalErrors > 0) {
  console.error(`\n  Found ${totalErrors} broken link(s).`);
  process.exit(1);
} else {
  console.log('  All internal links are valid.');
}
