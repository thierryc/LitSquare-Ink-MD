# BluePen-Proof

Static site pipeline for the BluePen Proof privacy policy.

Live site: https://thierryc.github.io/BluePen-Proof/

## Development

1. Install dependencies once: `npm install`
2. Edit the source policy in `docs/PrivacyPolicy.md`
3. Run `npm run build` to regenerate `dist/index.html`
4. Open `dist/index.html` in a browser to preview the rendered page

The build script (`scripts/build-privacy.js`) reads the Markdown file, parses its
frontmatter (title, description, date, version), and renders a styled HTML page
that is production ready for GitHub Pages.

## Deployment

This repository ships with `.github/workflows/deploy.yml` which:

- runs on pushes to `main` (and on manual dispatch)
- installs dependencies and runs `npm run build`
- publishes the contents of `dist/` to the `gh-pages` branch via
  `peaceiris/actions-gh-pages`

After merging to `main`, configure the repository settings so GitHub Pages
serves from the `gh-pages` branch. The workflow will manage updates whenever the
Markdown source changes.
