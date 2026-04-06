/**
 * Component override system.
 *
 * To replace a built-in component with your own version, change the import
 * source for that export. Every layout imports from this file, so your
 * component will be used everywhere automatically.
 *
 * Example — replace the Sidebar with a custom one:
 *
 *   export { default as Sidebar } from '../components/MySidebar.astro';
 *
 * Your replacement must accept the same props as the original.
 */

export { default as Sidebar } from '@/components/Sidebar.astro';
export { default as Footer } from '@/components/Footer.astro';
export { default as Topbar } from '@/components/Topbar.astro';
export { default as TableOfContents } from '@/components/TableOfContents.astro';
export { default as PageLinks } from '@/components/PageLinks.astro';
export { default as Breadcrumbs } from '@/components/Breadcrumbs.astro';
