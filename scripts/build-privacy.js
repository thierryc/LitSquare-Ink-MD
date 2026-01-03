#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = process.cwd();
const INPUT = path.resolve(ROOT, 'docs/PrivacyPolicy.md');
const DIST_DIR = path.resolve(ROOT, 'dist');
const OUTPUT = path.join(DIST_DIR, 'index.html');

/**
 * Extract simple YAML-style frontmatter and the remaining markdown body.
 */
function extractFrontmatter(source) {
  const lines = source.split('\n');
  if (lines[0].trim() !== '---') {
    return { frontmatter: {}, body: source };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { frontmatter: {}, body: source };
  }

  const fmLines = lines.slice(1, endIndex);
  const frontmatter = fmLines.reduce((acc, line) => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      return acc;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const body = lines.slice(endIndex + 1).join('\n').trimStart();
  return { frontmatter, body };
}

function renderDocument(frontmatter, bodyHtml) {
  const title = frontmatter.title || 'Privacy Policy';
  const description =
    frontmatter.description ||
    'Privacy policy generated from Markdown using the BluePen Proof docs build.';

  const updatedOn = frontmatter.date ? `<p class="meta">Updated: ${frontmatter.date}</p>` : '';
  const version = frontmatter.version ? `<p class="meta">Version: ${frontmatter.version}</p>` : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
      :root {
        color-scheme: light dark;
        font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
        font-size: 16px;
        background: #f5f5f7;
        color: #1c1c1e;
      }
      body {
        margin: 0;
        padding: 2rem;
        display: flex;
        justify-content: center;
      }
      main {
        max-width: 48rem;
        width: 100%;
        background: #ffffff;
        border-radius: 16px;
        padding: 2.5rem;
        box-shadow: 0 25px 45px rgba(0, 0, 0, 0.08);
      }
      h1, h2, h3, h4, h5 {
        font-weight: 600;
        line-height: 1.2;
      }
      h1 {
        font-size: 2.5rem;
        margin-top: 0;
      }
      h2 {
        margin-top: 2.5rem;
      }
      p {
        margin: 1rem 0;
      }
      ul {
        padding-left: 1.2rem;
      }
      a {
        color: #0070f3;
      }
      .meta {
        margin: 0;
        color: #6e6e73;
      }
      hr {
        border: none;
        border-top: 1px solid #e5e5ea;
        margin: 2rem 0;
      }
      @media (max-width: 640px) {
        body {
          padding: 1rem;
        }
        main {
          padding: 1.5rem;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${title}</h1>
        ${updatedOn}
        ${version}
        <hr>
      </header>
      ${bodyHtml}
    </main>
  </body>
</html>`;
}

function build() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Could not find ${INPUT}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT, 'utf8');
  const { frontmatter, body } = extractFrontmatter(raw);

  marked.use({ mangle: false, headerIds: true });
  const bodyHtml = marked.parse(body);
  const document = renderDocument(frontmatter, bodyHtml);

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT, document, 'utf8');
  console.log(`Generated ${path.relative(ROOT, OUTPUT)}`);
}

build();
