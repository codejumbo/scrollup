import { getCollection } from 'astro:content';
import { isValidLocale, DEFAULT_LOCALE, type Locale } from './i18n';
import type { SidebarConfigEntry } from './config';

export async function getPublishedDocs(locale?: string) {
  const entries = await getCollection('docs');
  return entries.filter((e) => {
    if (e.data.draft) return false;
    if (locale) return e.id.startsWith(locale + '/');
    return true;
  });
}

export interface NavItem {
  title: string;
  slug: string;
  section: string;
  order: number;
  sidebarLabel?: string;
  hidden?: boolean;
  badge?: { text: string; variant?: 'default' | 'success' | 'warning' | 'info' };
  // href is set when prev/next is overridden with a custom URL
  href?: string;
  external?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
  /** When true, render items without a collapsible section header (used for top-level config links) */
  flat?: boolean;
}

export function buildSidebar(entries: NavItem[]): NavSection[] {
  const sectionMap = new Map<string, NavItem[]>();

  for (const entry of entries) {
    // Hidden pages are excluded from sidebar
    if (entry.hidden) continue;
    const items = sectionMap.get(entry.section) || [];
    items.push(entry);
    sectionMap.set(entry.section, items);
  }

  const sections: NavSection[] = [];
  for (const [label, items] of sectionMap) {
    items.sort((a, b) => a.order - b.order);
    sections.push({ label, items });
  }

  // Sort sections by their defined section order
  sections.sort((a, b) => getSectionOrder(a.label) - getSectionOrder(b.label));

  return sections;
}

export function buildSidebarWithConfig(
  entries: NavItem[],
  configLinks?: readonly SidebarConfigEntry[],
): NavSection[] {
  const sections = buildSidebar(entries);
  if (!configLinks || configLinks.length === 0) return sections;

  for (const entry of configLinks) {
    if (entry.type === 'section') {
      sections.push({
        label: entry.label,
        items: entry.items.map((item) => ({
          title: item.label,
          slug: item.href,
          href: item.href,
          section: entry.label,
          order: 0,
          badge: item.badge,
          external: item.external,
        })),
      });
    } else {
      // top-level link — flat section with a single item
      sections.push({
        label: entry.label,
        flat: true,
        items: [{
          title: entry.label,
          slug: entry.href,
          href: entry.href,
          section: '',
          order: 0,
          badge: entry.badge,
          external: entry.external,
        }],
      });
    }
  }

  return sections;
}

export function getSortedEntries(entries: NavItem[]): NavItem[] {
  // Hidden pages excluded from prev/next sequence
  return [...entries]
    .filter((e) => !e.hidden)
    .sort((a, b) => {
      const sectionDiff = getSectionOrder(a.section) - getSectionOrder(b.section);
      if (sectionDiff !== 0) return sectionDiff;
      return a.order - b.order;
    });
}

const SECTION_ORDER: Record<string, number> = {
  'Getting started': 0,
  'Authoring': 1,
  'Theming': 2,
  'Internationalization': 3,
  'API reference': 4,
  'Deployment': 5,
  'Component overrides': 6,
  'Plugins': 7,
};

function getSectionOrder(section: string): number {
  return SECTION_ORDER[section] ?? 99;
}

export function getPrevNext(sorted: NavItem[], currentSlug: string) {
  const idx = sorted.findIndex((e) => e.slug === currentSlug);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

export function getLocale(id: string): Locale {
  const first = id.split('/')[0];
  return isValidLocale(first) ? first : DEFAULT_LOCALE;
}

export function stripLocale(id: string): string {
  const parts = id.split('/');
  return isValidLocale(parts[0]) ? parts.slice(1).join('/') : id;
}
