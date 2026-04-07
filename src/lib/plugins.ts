/**
 * Scrollup Plugin API
 *
 * Plugins run at build time via `src/lib/resolved-config.ts`.
 * To write a plugin, implement `ScrollupPlugin` and add it to `siteConfig.plugins`.
 *
 * Example:
 * ```ts
 * import type { ScrollupPlugin } from '@/lib/plugins';
 * export const myPlugin: ScrollupPlugin = {
 *   name: 'my-plugin',
 *   setup(ctx) {
 *     ctx.addCustomCss('/styles/my-plugin.css');
 *     ctx.addHeadTag({ tag: 'meta', attrs: { name: 'generator', content: 'my-plugin' } });
 *   },
 * };
 * ```
 */

/** A config snapshot passed to plugins — read-only view of siteConfig at setup time. */
export interface PluginConfigSnapshot {
  siteName: string | Partial<Record<string, string>>;
  siteUrl: string;
  description: string;
  repoUrl: string;
  editBranch: string;
  favicon: string;
  customCss: readonly string[];
  [key: string]: unknown;
}

/** Context object injected into each plugin's `setup()` call. */
export interface PluginContext {
  /** Append a CSS file path to the site's `customCss` list. */
  addCustomCss(path: string): void;
  /**
   * Inject a tag into `<head>` on every page.
   * Only external `src` attributes are allowed on script tags (no inline scripts).
   */
  addHeadTag(tag: { tag: string; attrs?: Record<string, string>; content?: string }): void;
  /**
   * Add items to the sidebar under the given section label.
   * These are merged with any manually configured `sidebarLinks` in config.
   */
  addSidebarItems(section: string, items: Array<{ label: string; href: string; external?: boolean }>): void;
  /** Read-only snapshot of siteConfig as it existed before plugins ran. */
  readonly config: Readonly<PluginConfigSnapshot>;
}

/** A Scrollup plugin. Implement `setup()` to extend the site at build time. */
export interface ScrollupPlugin {
  /** Unique name for this plugin — used in error messages and deduplication. */
  name: string;
  /** Called once at build time with a mutable context object. May be async. */
  setup(ctx: PluginContext): void | Promise<void>;
}
