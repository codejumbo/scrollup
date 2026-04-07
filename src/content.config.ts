import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
  schema: z.object({
    title: z.string().describe('Page title shown in sidebar and browser tab'),
    description: z.string().describe('Short description for search results and meta tags'),
    section: z.string().describe('Sidebar section name (must match SECTION_ORDER in navigation.ts)'),
    order: z.number().describe('Sort order within the section (lower numbers appear first)'),
    lastUpdated: z.string().optional().describe('ISO date string of last content update'),
    author: z.string().optional().describe('Author name for attribution'),
    tags: z.array(z.string()).optional().describe('Tags for categorization and filtering'),
    draft: z.boolean().optional().default(false).describe('If true, page is excluded from build'),
    deprecated: z.boolean().optional().default(false).describe('If true, a deprecation banner is shown'),

    // tableOfContents: false disables TOC entirely; a number (2-4) sets max depth
    tableOfContents: z.union([z.literal(false), z.number().min(2).max(4)]).optional().default(2).describe('Max heading depth for TOC, or false to disable'),

    // Slug override — use instead of file path as route param
    slug: z.string().optional().describe('Custom URL slug override (replaces file-path-based route)'),

    // Custom <head> tags injected per-page (external src only — no inline scripts)
    head: z.array(z.object({
      tag: z.string(),
      attrs: z.record(z.string(), z.string()).optional(),
      content: z.string().optional(),
    })).optional().default([]).describe('Extra <head> tags for this page (external scripts only)'),

    // Per-page banner message
    banner: z.string().optional().describe('Banner message shown at the top of this page'),

    // Per-page edit URL override: false = no edit link, string = custom URL
    editUrl: z.union([z.literal(false), z.string()]).optional().describe('Custom edit URL, or false to hide the edit link'),

    // Prev/next navigation overrides
    prev: z.union([
      z.literal(false),
      z.object({ label: z.string(), href: z.string() }),
    ]).optional().describe('Override prev link: false to hide, or { label, href }'),
    next: z.union([
      z.literal(false),
      z.object({ label: z.string(), href: z.string() }),
    ]).optional().describe('Override next link: false to hide, or { label, href }'),

    // Sidebar display options
    sidebar: z.object({
      label: z.string().optional().describe('Custom label in sidebar (defaults to title)'),
      hidden: z.boolean().optional().default(false).describe('If true, excluded from sidebar and prev/next'),
      badge: z.object({
        text: z.string(),
        variant: z.enum(['default', 'success', 'warning', 'info']).optional().default('default'),
      }).optional().describe('Badge shown next to item in sidebar'),
    }).optional(),

    // Exclude from search index
    searchable: z.boolean().optional().default(true).describe('If false, excluded from search index'),

    // Page template
    template: z.enum(['doc', 'splash']).optional().default('doc').describe('Page layout template'),

    // Hero section (for splash template)
    hero: z.object({
      title: z.string().optional(),
      tagline: z.string().optional(),
      image: z.object({ src: z.string(), alt: z.string().optional() }).optional(),
      actions: z.array(z.object({
        label: z.string(),
        href: z.string(),
        variant: z.enum(['primary', 'secondary']).optional().default('primary'),
        external: z.boolean().optional().default(false),
      })).optional(),
    }).optional().describe('Hero section config (splash template only)'),
  }),
});

export const collections = { docs };
