# Contributing to Scrollup

Thanks for your interest in contributing! Scrollup is an open-source documentation template, and we welcome contributions of all kinds — bug fixes, new features, documentation improvements, and design refinements.

## Getting started

1. **Fork the repository** at [github.com/codejumbo/scrollup](https://github.com/codejumbo/scrollup)
2. **Clone your fork:**

   ```sh
   git clone git@github.com:YOUR-USERNAME/scrollup.git
   cd scrollup
   npm install
   ```

3. **Start the dev server:**

   ```sh
   npm run dev
   ```

4. **Create a branch** for your change:

   ```sh
   git checkout -b fix/sidebar-collapse
   ```

## Project structure

```
content/docs/          # MDX documentation pages
src/
  components/mdx/      # Reusable MDX components (Callout, Tabs, Steps, etc.)
  styles/tokens.css    # Design tokens — colors, spacing, layout variables
  lib/navigation.ts    # Sidebar sections and ordering
  layouts/             # Page layouts
  pages/               # Astro page routes
astro.config.ts        # Astro and Expressive Code configuration
```

## Development commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on `localhost:4321` |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npx astro check` | Run TypeScript type checking |

## What to contribute

### Bug fixes
If you find a bug, check [existing issues](https://github.com/codejumbo/scrollup/issues) first. If it hasn't been reported, open an issue describing the problem, then submit a PR with the fix.

### Documentation
Improvements to the docs are always welcome — typo fixes, clearer explanations, additional examples, or new guides. Documentation lives as `.mdx` files in `content/docs/`.

### New MDX components
If you have an idea for a reusable component (like the existing Callout, Tabs, or Steps), open an issue to discuss the design before implementing. Components live in `src/components/mdx/`.

### Design and theming
Changes to colors, typography, spacing, or layout should respect the existing design principles: readability first, quiet interface, no unnecessary decoration. See `src/styles/tokens.css` for the design token system.

## Submitting a pull request

1. Keep PRs focused — one bug fix or feature per PR
2. Write clear commit messages that explain *why*, not just *what*
3. Test your changes locally with `npm run build` to ensure nothing breaks
4. Run `npx astro check` to catch type errors
5. Update or add documentation if your change affects user-facing behavior
6. Open the PR against the `main` branch

### PR description format

```markdown
## What
Brief description of the change.

## Why
The problem this solves or the improvement it makes.

## How to test
Steps to verify the change works correctly.
```

## Code style

- **No linter or formatter is enforced** — match the style of surrounding code
- Use TypeScript where the project already uses it
- CSS uses custom properties defined in `tokens.css` — prefer tokens over hardcoded values
- Keep components simple and composable

## Reporting issues

Open an issue at [github.com/codejumbo/scrollup/issues](https://github.com/codejumbo/scrollup/issues) with:

- A clear title describing the problem
- Steps to reproduce
- Expected vs. actual behavior
- Your Node.js version (`node --version`)
- Browser and OS if relevant

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
