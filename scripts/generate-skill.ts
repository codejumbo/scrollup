import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const docsDir = join(root, 'content', 'docs');

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

interface PageMeta {
  title: string;
  description: string;
  section: string;
  slug: string;
}

function extractMeta(filePath: string): PageMeta | null {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = match[1];
  const title = fm.match(/title:\s*"([^"]*)"/)?.[1] || '';
  const description = fm.match(/description:\s*"([^"]*)"/)?.[1] || '';
  const section = fm.match(/section:\s*"([^"]*)"/)?.[1] || '';
  const draft = fm.includes('draft: true');
  if (draft) return null;

  const slug = relative(docsDir, filePath).replace(/\.mdx?$/, '');
  return { title, description, section, slug };
}

const files = getMarkdownFiles(docsDir);
const pages = files.map(extractMeta).filter((p): p is PageMeta => p !== null);

// Group by section
const sections = new Map<string, PageMeta[]>();
for (const page of pages) {
  const list = sections.get(page.section) || [];
  list.push(page);
  sections.set(page.section, list);
}

const lines: string[] = [
  '# Scrollup Documentation Skill',
  '',
  'This file describes the documentation available in this Scrollup site.',
  'Use it to understand the structure and content of the docs.',
  '',
];

for (const [section, sectionPages] of sections) {
  lines.push(`## ${section}`);
  lines.push('');
  for (const page of sectionPages) {
    lines.push(`- **${page.title}** (/${page.slug}): ${page.description}`);
  }
  lines.push('');
}

const outPath = join(root, 'public', 'skill.md');
writeFileSync(outPath, lines.join('\n'));
console.log(`  Generated public/skill.md (${pages.length} pages across ${sections.size} sections).`);
