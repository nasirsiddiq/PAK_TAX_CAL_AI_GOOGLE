// Postbuild step: bakes per-page <title>/description/canonical/og:*/twitter:*
// tags directly into static HTML files under dist/, one per calculator page.
//
// Why this exists: App.tsx already updates document.title and the meta tags
// client-side on every tab change (see the effect around PAGE_SEO), but that
// only runs after React mounts and executes JavaScript. Link-preview
// crawlers for Facebook, WhatsApp, Twitter/X, LinkedIn, etc. do NOT execute
// JavaScript when they fetch a shared URL — they only ever read the static
// HTML Netlify serves for that exact path. Without this step, every
// calculator link shared on social media showed the same generic homepage
// title/description/image, regardless of which calculator was actually
// shared.
//
// This script copies dist/index.html (the already-built SPA shell, complete
// with hashed asset filenames) once per route in TAB_TO_PATH, swapping in
// that page's own title/description/canonical/og/twitter tags and image, and
// writes each copy to the exact static path Netlify will serve for that
// route (e.g. dist/zakat-calculator.html). The app's own JS bundle is
// untouched and boots exactly the same way from any of these files, so
// client-side navigation and the existing SPA redirect for unmatched paths
// both keep working as before — this only changes what a non-JS crawler sees
// on first fetch.
//
// Routes whose path has no ".html" extension (currently just "provincial",
// served at /sales-tax-punjab) are intentionally skipped: Netlify's static
// file serving relies on the extension to pick the right Content-Type, and
// an extension-less static file could be served as
// application/octet-stream instead of text/html. Those routes keep relying
// on the SPA fallback + client-side meta tags instead.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_SEO } from '../src/data/pageSeo';
import { TAB_TO_PATH } from '../src/utils/subdomainRoutes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://paktaxcalculator.net';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceTagContent(html: string, regex: RegExp, replacement: string): string {
  if (!regex.test(html)) {
    throw new Error(`Expected to find a match for ${regex} in dist/index.html — the shell's <head> may have changed shape.`);
  }
  return html.replace(regex, replacement);
}

function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error(`dist/index.html not found — run "vite build" first.`);
  }
  const template = readFileSync(indexPath, 'utf-8');

  let written = 0;
  let skipped = 0;

  for (const [tab, routePath] of Object.entries(TAB_TO_PATH)) {
    if (!routePath.endsWith('.html')) {
      skipped += 1;
      continue;
    }

    const seo = PAGE_SEO[tab as keyof typeof PAGE_SEO];
    const canonicalUrl = `${SITE_URL}${routePath}`;
    const imageUrl = `${SITE_URL}${seo.image}`;
    const title = escapeHtml(seo.title);
    const description = escapeHtml(seo.description);

    let html = template;
    html = replaceTagContent(html, /<title>.*?<\/title>/s, `<title>${title}</title>`);
    html = replaceTagContent(html, /<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${description}" />`);
    html = replaceTagContent(html, /<link rel="canonical" href=".*?" \/>/s, `<link rel="canonical" href="${canonicalUrl}" />`);
    html = replaceTagContent(html, /<meta property="og:title" content=".*?" \/>/s, `<meta property="og:title" content="${title}" />`);
    html = replaceTagContent(html, /<meta property="og:description" content=".*?" \/>/s, `<meta property="og:description" content="${description}" />`);
    html = replaceTagContent(html, /<meta property="og:url" content=".*?" \/>/s, `<meta property="og:url" content="${canonicalUrl}" />`);
    html = replaceTagContent(html, /<meta property="og:image" content=".*?" \/>/s, `<meta property="og:image" content="${imageUrl}" />`);
    html = replaceTagContent(html, /<meta property="og:image:alt" content=".*?" \/>/s, `<meta property="og:image:alt" content="${title}" />`);
    html = replaceTagContent(html, /<meta name="twitter:title" content=".*?" \/>/s, `<meta name="twitter:title" content="${title}" />`);
    html = replaceTagContent(html, /<meta name="twitter:description" content=".*?" \/>/s, `<meta name="twitter:description" content="${description}" />`);
    html = replaceTagContent(html, /<meta name="twitter:image" content=".*?" \/>/s, `<meta name="twitter:image" content="${imageUrl}" />`);

    const outPath = path.join(DIST_DIR, routePath.replace(/^\//, ''));
    writeFileSync(outPath, html, 'utf-8');
    written += 1;
  }

  console.log(`generate-seo-pages: wrote ${written} static per-page HTML files, skipped ${skipped} extension-less route(s).`);
}

main();
