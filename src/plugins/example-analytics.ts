/**
 * Example Scrollup plugin: analytics script injection.
 *
 * This file demonstrates how to write a plugin. It is NOT active by default.
 * To use it, add it to `siteConfig.plugins` in `src/lib/config.ts`:
 *
 * ```ts
 * import { analyticsPlugin } from '@/plugins/example-analytics';
 *
 * export const siteConfig = {
 *   // ...
 *   plugins: [analyticsPlugin],
 * };
 * ```
 */
import type { ScrollupPlugin } from '@/lib/plugins';

export const analyticsPlugin: ScrollupPlugin = {
  name: 'example-analytics',
  setup(ctx) {
    // Inject an external analytics script into <head> on every page.
    // Replace the src with your real analytics endpoint.
    ctx.addHeadTag({
      tag: 'script',
      attrs: {
        src: 'https://example-analytics.com/script.js',
        defer: '',
        'data-site': ctx.config.siteUrl as string,
      },
    });
  },
};
