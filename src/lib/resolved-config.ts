/**
 * Resolved site configuration — siteConfig after all plugins have run.
 *
 * Import from here (not from `config.ts` directly) inside layouts and pages
 * so that plugin-contributed CSS, head tags, and sidebar items are included.
 *
 * This module uses top-level await (safe in Astro 6 / Node 18+).
 */
import { siteConfig } from './config';
import type { ScrollupPlugin, PluginContext, PluginConfigSnapshot } from './plugins';
import type { SidebarConfigEntry } from './config';

// Mutable accumulators populated by plugin setup() calls
const extraCss: string[] = [];
const extraHeadTags: { tag: string; attrs?: Record<string, string>; content?: string }[] = [];
const extraSidebarEntries: SidebarConfigEntry[] = [];

// Build the read-only config snapshot exposed to plugins
const configSnapshot: Readonly<PluginConfigSnapshot> = Object.freeze({
  siteName: siteConfig.siteName,
  siteUrl: siteConfig.siteUrl,
  description: siteConfig.description,
  repoUrl: siteConfig.repoUrl,
  editBranch: siteConfig.editBranch,
  favicon: siteConfig.favicon,
  customCss: siteConfig.customCss,
});

// Run each plugin's setup() in order
const plugins: ScrollupPlugin[] = siteConfig.plugins ?? [];
for (const plugin of plugins) {
  const ctx: PluginContext = {
    addCustomCss(path: string) {
      extraCss.push(path);
    },
    addHeadTag(tag) {
      // Block inline scripts (security — same rule as `head` frontmatter)
      if (tag.tag === 'script' && tag.content) {
        console.warn(`[${plugin.name}] addHeadTag: inline script content is not allowed. Use an external src instead.`);
        return;
      }
      extraHeadTags.push(tag);
    },
    addSidebarItems(section, items) {
      extraSidebarEntries.push({
        type: 'section',
        label: section,
        items: items.map((item) => ({
          label: item.label,
          href: item.href,
          external: item.external,
        })),
      });
    },
    config: configSnapshot,
  };

  await plugin.setup(ctx);
}

/**
 * The fully-resolved site config with plugin-contributed CSS and sidebar items merged in.
 * Use this everywhere instead of `siteConfig` directly.
 */
export const resolvedConfig = {
  ...siteConfig,
  customCss: [...siteConfig.customCss, ...extraCss],
  sidebarLinks: [...siteConfig.sidebarLinks, ...extraSidebarEntries] as SidebarConfigEntry[],
};

/**
 * Head tags contributed by plugins — rendered in `<head>` on every page.
 */
export const globalHeadTags: readonly {
  tag: string;
  attrs?: Record<string, string>;
  content?: string;
}[] = extraHeadTags;
