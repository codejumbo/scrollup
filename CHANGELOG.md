# Changelog

All notable changes to Scrollup are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

## [1.0.0] - 2026-04-04

### Added

**Authoring**
- MDX support with auto-imported components (Callout, Badge, Steps/Step, Tabs/Tab, LinkGrid, ApiEndpoint, ParamField, Accordion, Frame, Tooltip)
- Frontmatter schema validation via Zod (`title`, `description`, `section`, `order`, plus optional `draft`, `deprecated`, `lastUpdated`, `author`, `tags`, `tocDepth`)
- Draft mode — pages with `draft: true` are excluded from builds
- Deprecated page banner — amber warning banner when `deprecated: true`
- Last updated timestamp displayed below page content
- Edit-on-GitHub link on every doc page
- Mermaid diagram support via client-side CDN rendering
- Emoji shortcodes via `remark-emoji` (`:emoji:` syntax)

**Navigation**
- Auto-generated sidebar from frontmatter `section` and `order` fields
- Collapsible sidebar groups with state persisted in `sessionStorage`
- Table of contents (right panel) auto-generated from headings with scroll tracking
- Configurable TOC depth via `tocDepth` frontmatter field (2–4)
- Breadcrumbs on all doc pages
- Previous/next page links at the bottom of each doc

**Search**
- Full-text client-side search powered by Orama
- Keyboard shortcut `Cmd+K` / `Ctrl+K` to open search
- Typo-tolerant matching with highlighted results showing title, section, and description

**Theme & Layout**
- Three-column responsive layout: sidebar | content | TOC
- Collapses to two columns at 1280px, single column at 768px
- Three-state theme toggle: light → system → dark
- Warm light mode (`#FAF9F5`) and cool dark mode (`#161619`)
- Self-hosted variable fonts: Satoshi, Source Serif 4, JetBrains Mono
- Custom CSS injection via `customCssPath` in `config.ts`
- Configurable favicon, social links, and footer

**AI & LLM Integration**
- `/llms.txt` and `/llms-full.txt` endpoints per the [llmstxt.org](https://llmstxt.org) spec
- `/api/docs/[slug]` endpoint returning raw Markdown for any doc page
- Auto-generated `public/skill.md` summarizing all docs for AI agent consumption (`npm run generate-skill`)

**Build & Deployment**
- Interactive setup script (`npm run setup`) for template customization
- Page scaffolding script (`npm run new-page`)
- Content validation script (`npm run validate`) — runs `astro check` + link checker
- Broken internal link detection (`npm run check-links`)
- Content staleness detection (`npm run check-freshness`) with configurable threshold
- Sitemap generation via `@astrojs/sitemap`
- RSS feed via `@astrojs/rss`
- SEO meta tags — Open Graph, Twitter Card, and canonical URLs
- Deployment guides for Vercel, Netlify, Cloudflare Pages, GitLab Pages, and self-hosted

---

[Unreleased]: https://github.com/codejumbo/scrollup/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/codejumbo/scrollup/releases/tag/v1.0.0
