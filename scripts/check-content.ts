/**
 * check-content.ts
 * Validates all content and structural invariants before commit.
 *
 * Checks:
 *  1. Frontmatter — required fields, correct types
 *  2. Section registration — every section name used in MDX exists in SECTION_ORDER
 *  3. Duplicate order — no two pages share the same order within a section+locale
 *  4. MDX component coverage — every component exported from mdx/index.ts is used in at least one en doc
 *  5. i18n completeness — every key in the `en` locale exists in all other locales
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DOCS_DIR = join(ROOT, 'content', 'docs');
const MDX_INDEX = join(ROOT, 'src', 'components', 'mdx', 'index.ts');
const NAVIGATION_TS = join(ROOT, 'src', 'lib', 'navigation.ts');
const I18N_TS = join(ROOT, 'src', 'lib', 'i18n.ts');

// ─── helpers ────────────────────────────────────────────────────────────────

let errors = 0;
let warnings = 0;

function fail(msg: string) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  ⚠ ${msg}`);
  warnings++;
}

function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function getMdxFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...getMdxFiles(full));
    else if (entry.endsWith('.mdx') || entry.endsWith('.md')) files.push(full);
  }
  return files;
}

interface Frontmatter {
  title?: string;
  description?: string;
  section?: string;
  order?: number;
  draft?: boolean;
  deprecated?: boolean;
  lastUpdated?: string;
}

const stripQuotes = (s?: string) => s?.replace(/^["']|["']$/g, '');

function parseFrontmatter(filePath: string): Frontmatter | null {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = match[1];
  const get = (key: string) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();

  const orderRaw = get('order');
  const order = orderRaw !== undefined ? parseInt(orderRaw, 10) : undefined;

  return {
    title: stripQuotes(get('title')),
    description: stripQuotes(get('description')),
    section: stripQuotes(get('section')),
    order: isNaN(order as number) ? undefined : order,
    draft: get('draft') === 'true',
    deprecated: get('deprecated') === 'true',
    lastUpdated: stripQuotes(get('lastUpdated')),
  };
}

// ─── 1. Frontmatter validation ───────────────────────────────────────────────

function checkFrontmatter(files: string[], parsed: Map<string, Frontmatter | null>) {
  console.log('\n[1] Frontmatter validation');
  let ok = 0;

  for (const file of files) {
    const rel = relative(DOCS_DIR, file);
    const fm = parsed.get(file) ?? null;

    if (!fm) {
      fail(`${rel} — missing frontmatter block`);
      continue;
    }

    const missing: string[] = [];
    if (!fm.title) missing.push('title');
    if (!fm.description) missing.push('description');
    if (!fm.section) missing.push('section');
    if (fm.order === undefined) missing.push('order');

    if (missing.length > 0) {
      fail(`${rel} — missing required fields: ${missing.join(', ')}`);
    } else {
      ok++;
    }

    if (fm.order !== undefined && (typeof fm.order !== 'number' || isNaN(fm.order))) {
      fail(`${rel} — 'order' must be a number, got: ${fm.order}`);
    }

    if (fm.lastUpdated && isNaN(Date.parse(fm.lastUpdated))) {
      fail(`${rel} — 'lastUpdated' is not a valid date: ${fm.lastUpdated}`);
    }
  }

  if (ok > 0) pass(`${ok} file(s) have valid frontmatter`);
}

// ─── 2. Section registration ─────────────────────────────────────────────────

function getSectionOrder(): Set<string> {
  const src = readFileSync(NAVIGATION_TS, 'utf-8');
  const block = src.match(/SECTION_ORDER[^=]*=\s*\{([^}]+)\}/)?.[1] ?? '';
  const sections = new Set<string>();
  for (const match of block.matchAll(/'([^']+)':\s*\d+/g)) {
    sections.add(match[1]);
  }
  return sections;
}

function checkSectionRegistration(files: string[], parsed: Map<string, Frontmatter | null>) {
  console.log('\n[2] Section registration');
  const registered = getSectionOrder();
  const unknown = new Map<string, string>();
  let ok = 0;

  for (const file of files) {
    const rel = relative(DOCS_DIR, file);
    const fm = parsed.get(file) ?? null;
    if (!fm?.section) continue;

    if (!registered.has(fm.section)) {
      if (!unknown.has(fm.section)) unknown.set(fm.section, rel);
    } else {
      ok++;
    }
  }

  for (const [section, file] of unknown) {
    fail(`Section "${section}" (first seen in ${file}) is not in SECTION_ORDER in navigation.ts`);
  }

  if (ok > 0) pass(`All sections in ${ok} file(s) are registered in SECTION_ORDER`);
}

// ─── 3. Duplicate order values ───────────────────────────────────────────────

function checkDuplicateOrder(files: string[], parsed: Map<string, Frontmatter | null>) {
  console.log('\n[3] Duplicate order values');

  const seen = new Map<string, Map<number, string>>();
  let ok = 0;

  for (const file of files) {
    const rel = relative(DOCS_DIR, file);
    const parts = rel.split('/');
    const locale = parts[0];
    const fm = parsed.get(file) ?? null;
    if (!fm?.section || fm.order === undefined) continue;

    const key = `${locale}/${fm.section}`;
    if (!seen.has(key)) seen.set(key, new Map());
    const orders = seen.get(key)!;

    if (orders.has(fm.order)) {
      fail(`Duplicate order ${fm.order} in section "${fm.section}" [${locale}]: ${orders.get(fm.order)} and ${rel}`);
    } else {
      orders.set(fm.order, rel);
      ok++;
    }
  }

  if (ok > 0) pass(`No duplicate order values found across ${ok} page(s)`);
}

// ─── 4. MDX component coverage ───────────────────────────────────────────────

function getExportedComponents(): string[] {
  const src = readFileSync(MDX_INDEX, 'utf-8');
  const components: string[] = [];
  for (const match of src.matchAll(/export\s*\{[^}]*default\s+as\s+(\w+)/g)) {
    components.push(match[1]);
  }
  return components;
}

function checkComponentCoverage(files: string[]) {
  console.log('\n[4] MDX component coverage');

  const components = getExportedComponents();
  const enFiles = files.filter((f) => relative(DOCS_DIR, f).startsWith('en/'));
  const allContent = enFiles.map((f) => readFileSync(f, 'utf-8')).join('\n');

  const unused: string[] = [];
  const used: string[] = [];

  for (const name of components) {
    // Match JSX usage: <ComponentName or <ComponentName/> etc.
    const used_in_docs = new RegExp(`<${name}[\\s/>]`).test(allContent);
    if (used_in_docs) {
      used.push(name);
    } else {
      unused.push(name);
    }
  }

  if (unused.length > 0) {
    for (const name of unused) {
      warn(`Component <${name}> is exported from mdx/index.ts but not used in any English doc`);
    }
  }

  if (used.length > 0) pass(`${used.length}/${components.length} MDX components are demonstrated in the docs`);
}

// ─── 5. i18n completeness ────────────────────────────────────────────────────

function getI18nKeys(): Map<string, Set<string>> {
  const src = readFileSync(I18N_TS, 'utf-8');
  const localeMap = new Map<string, Set<string>>();

  const localeBlockRegex = /^\s{2}(\w{2}):\s*\{([^}]+)\}/gm;
  for (const localeMatch of src.matchAll(localeBlockRegex)) {
    const locale = localeMatch[1];
    const block = localeMatch[2];
    const keys = new Set<string>();
    for (const keyMatch of block.matchAll(/'([^']+)':/g)) {
      keys.add(keyMatch[1]);
    }
    localeMap.set(locale, keys);
  }

  return localeMap;
}

function checkI18n() {
  console.log('\n[5] i18n key completeness');

  const localeKeys = getI18nKeys();
  const enKeys = localeKeys.get('en');

  if (!enKeys || enKeys.size === 0) {
    fail('Could not parse English i18n keys from i18n.ts');
    return;
  }

  let allComplete = true;

  for (const [locale, keys] of localeKeys) {
    if (locale === 'en') continue;

    const missing: string[] = [];
    for (const key of enKeys) {
      if (!keys.has(key)) missing.push(key);
    }

    if (missing.length > 0) {
      allComplete = false;
      for (const key of missing) {
        fail(`i18n [${locale}] missing key: '${key}'`);
      }
    }
  }

  if (allComplete) pass(`All ${enKeys.size} English i18n keys are present in all ${localeKeys.size - 1} other locales`);
}

// ─── run all checks ──────────────────────────────────────────────────────────

const allFiles = getMdxFiles(DOCS_DIR);
const parsedFrontmatter = new Map(allFiles.map((f) => [f, parseFrontmatter(f)]));

checkFrontmatter(allFiles, parsedFrontmatter);
checkSectionRegistration(allFiles, parsedFrontmatter);
checkDuplicateOrder(allFiles, parsedFrontmatter);
checkComponentCoverage(allFiles);
checkI18n();

console.log('\n' + '─'.repeat(50));
if (errors > 0) {
  console.error(`\n  ${errors} error(s), ${warnings} warning(s). Fix errors before committing.\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n  0 errors, ${warnings} warning(s).\n`);
} else {
  console.log(`\n  All checks passed.\n`);
}
