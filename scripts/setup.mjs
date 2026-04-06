import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  console.log('\n  Scrollup Setup\n  ─────────────\n');

  const siteName = (await ask('  Site name (Scrollup): ')).trim() || 'Scrollup';
  const tagline = (await ask('  Tagline (Beautiful documentation, effortlessly.): ')).trim() || 'Beautiful documentation, effortlessly.';
  const siteUrl = (await ask('  Site URL (https://docs.your-project.com): ')).trim() || '';
  const repoUrl = (await ask('  GitHub repo URL (https://github.com/your-username/your-repo): ')).trim() || '';
  const copyrightInput = (await ask('  Copyright text (leave blank to keep, "none" to remove): ')).trim();
  let accentHex = (await ask('  Accent color hex (#0066FF): ')).trim() || '#0066FF';

  if (!/^#[0-9A-Fa-f]{6}$/.test(accentHex)) {
    console.log(`\n  Invalid hex color "${accentHex}". Using default #0066FF.`);
    accentHex = '#0066FF';
  }

  const safeName = escapeHtml(siteName);
  const safeTagline = escapeHtml(tagline);

  // 1. Update LogoMark.astro (plain text context)
  const logoPath = join(root, 'src/components/LogoMark.astro');
  let logo = readFileSync(logoPath, 'utf-8');
  logo = logo.replace(/Scrollup/, safeName);
  writeFileSync(logoPath, logo);

  // 2. Update site config (name, description, repo URL)
  const configPath = join(root, 'src/lib/config.ts');
  let config = readFileSync(configPath, 'utf-8');
  config = config.replace(/(siteName:\s*)'[^']*'/, `$1'${safeName}'`);
  config = config.replace(/(description:\s*)'[^']*'/, `$1'${safeTagline}'`);
  if (siteUrl) {
    config = config.replace(/(siteUrl:\s*)'[^']*'/, `$1'${siteUrl}'`);
  }
  if (repoUrl) {
    // Replace all occurrences of the template repo URL (repoUrl field + github social link)
    config = config.replace(/https:\/\/github\.com\/codejumbo\/scrollup/g, repoUrl);
  }
  if (copyrightInput === 'none') {
    config = config.replace(/(copyright:\s*)'[^']*'( as string \| false)?/, `$1false`);
  } else if (copyrightInput) {
    const safeCopyright = copyrightInput.replace(/'/g, "\\'");
    config = config.replace(/(copyright:\s*)'[^']*'/, `$1'${safeCopyright}'`);
  }
  writeFileSync(configPath, config);

  // 4. Update package.json
  const pkgPath = join(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.name = siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // 5. Update accent color in tokens.css (light mode only)
  const tokensPath = join(root, 'src/styles/tokens.css');
  let tokens = readFileSync(tokensPath, 'utf-8');
  tokens = tokens.replace(/(--accent:\s*)#[0-9A-Fa-f]{6}/, `$1${accentHex}`);

  // 6. Custom font families
  const sansFont = (await ask('  Sans-serif font (Satoshi): ')).trim() || '';
  const serifFont = (await ask('  Serif font (Source Serif 4): ')).trim() || '';
  const monoFont = (await ask('  Monospace font (JetBrains Mono): ')).trim() || '';

  function replaceFont(css, prop, fontName) {
    const safe = fontName.replace(/'/g, '');
    const re = new RegExp(`(${prop}:\\s*)'[^']*'`);
    return css.replace(re, `$1'${safe}'`);
  }

  if (sansFont) tokens = replaceFont(tokens, '--sans', sansFont);
  if (serifFont) tokens = replaceFont(tokens, '--serif', serifFont);
  if (monoFont) tokens = replaceFont(tokens, '--mono', monoFont);

  writeFileSync(tokensPath, tokens);

  console.log(`\n  Updated accent color in light mode.`);
  console.log(`  Note: Dark mode accent (--accent in [data-theme="dark"]) was left unchanged.`);
  console.log(`  You can manually adjust it in src/styles/tokens.css if needed.`);
  if (sansFont || serifFont || monoFont) {
    console.log(`  Custom fonts updated. Add your font files to public/fonts/ and @font-face declarations to a custom CSS file.`);
  }
  console.log('');

  // 6. Optionally clear sample content
  const clearContent = (await ask('  Clear sample content? (y/N): ')).trim().toLowerCase();
  if (clearContent === 'y') {
    const docsDir = join(root, 'content/docs');
    rmSync(docsDir, { recursive: true, force: true });
    mkdirSync(join(docsDir, 'getting-started'), { recursive: true });
    writeFileSync(
      join(docsDir, 'getting-started/welcome.mdx'),
      `---
title: "Welcome"
description: "Your first page"
section: "Getting started"
order: 1
---

# Welcome to ${siteName}

Start writing your documentation here.
`
    );
    console.log('  Cleared sample content. Created content/docs/getting-started/welcome.mdx\n');
  }

  console.log('  Setup complete!\n');
  console.log('  Summary:');
  console.log(`    Site name:    ${siteName}`);
  console.log(`    Tagline:      ${tagline}`);
  console.log(`    Site URL:     ${siteUrl || '(unchanged)'}`);
  console.log(`    Repo URL:     ${repoUrl || '(unchanged)'}`);
  console.log(`    Copyright:    ${copyrightInput === 'none' ? '(disabled)' : copyrightInput || '(unchanged)'}`);
  console.log(`    Accent color: ${accentHex}`);
  console.log(`\n  Next steps:`);
  console.log('    npm run dev\n');

  rl.close();
}

main();
