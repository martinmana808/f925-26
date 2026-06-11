# Rules & Standards (PROJECT_rules.md)

## Tech Stack
- **Framework**: Svelte v4 (with Svelte compiler)
- **Bundler**: Vite v5
- **Styling**: Less CSS (precompiled & imported in Layout.svelte)
- **Asset Handling**: Static assets served from the `/public` folder and referenced with absolute paths.

## Directory Structure
- `/src` - Application source code
  - `/src/components` - Shared Svelte components
  - `/src/routes` - Page components (e.g. Services, About)
  - `/src/styles` - Less stylesheets
  - `/src/js` - Client-side javascript
- `/public` - Static assets served directly (e.g., images, videos, fonts)
- `/docs` - Project documentation and development logs

## Coding Standards
- Use Svelte's reactivity model correctly.
- Keep components focused and modular.
- Style globally using Less or scope locally via Svelte's `<style>` tags.
