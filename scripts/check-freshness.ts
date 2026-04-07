import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const docsDir = join(import.meta.dirname, '..', 'content', 'docs');
const STALE_DAYS = parseInt(process.argv[2] || '90', 10);
const now = Date.now();

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

function extractFrontmatter(filePath: string): { title: string; lastUpdated?: string } {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { title: '(unknown)' };

  const fm = match[1];
  const title = fm.match(/title:\s*"([^"]*)"/)?.[1] || '(unknown)';
  const lastUpdated = fm.match(/lastUpdated:\s*"([^"]*)"/)?.[1];
  return { title, lastUpdated };
}

const files = getMarkdownFiles(docsDir);
const stale: { file: string; title: string; reason: string; daysOld?: number }[] = [];

for (const file of files) {
  const rel = relative(docsDir, file);
  const { title, lastUpdated } = extractFrontmatter(file);

  if (!lastUpdated) {
    stale.push({ file: rel, title, reason: 'missing lastUpdated' });
  } else {
    const age = Math.floor((now - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    if (age > STALE_DAYS) {
      stale.push({ file: rel, title, reason: `${age} days old`, daysOld: age });
    }
  }
}

if (stale.length === 0) {
  console.log(`  All pages are fresh (threshold: ${STALE_DAYS} days).`);
} else {
  console.log(`  Stale content report (threshold: ${STALE_DAYS} days):\n`);
  // Sort: missing dates first, then oldest first
  stale.sort((a, b) => {
    const aVal = a.daysOld ?? Infinity;
    const bVal = b.daysOld ?? Infinity;
    if (aVal === Infinity && bVal === Infinity) return 0;
    if (aVal === Infinity) return -1;
    if (bVal === Infinity) return 1;
    return bVal - aVal;
  });
  for (const s of stale) {
    console.log(`  ${s.file} — ${s.title} (${s.reason})`);
  }
  console.log(`\n  ${stale.length} page(s) need review.`);
}
