// Postbuild step: bakes per-page <title>/description/canonical/og:*/twitter:*
// tags, plus real visible intro/how-to-use/FAQ content, directly into static
// HTML files under dist/, one per calculator page — including index.html,
// the homepage.
//
// Why this exists: App.tsx already updates document.title, the meta tags,
// and the on-page intro/FAQ content client-side on every tab change, but
// none of that runs until React mounts and executes JavaScript. Two classes
// of visitor never get that far:
//   1. Link-preview crawlers (Facebook, WhatsApp, Twitter/X, LinkedIn, etc.)
//      do NOT execute JavaScript when they fetch a shared URL — they only
//      ever read the static HTML Netlify serves for that exact path.
//   2. Any other non-JS fetch of the page — a search-engine crawler taking a
//      quick pre-render pass, or a content-quality checker — sees whatever
//      is in the raw HTML `<div id="root">`, which by default is empty for a
//      client-rendered SPA. That's genuinely thin: no visible text, no FAQ,
//      no explanation of what the tool does, even though the live app has
//      all of that once JS runs.
//
// This script copies dist/index.html (the already-built SPA shell, complete
// with hashed asset filenames) once per route in TAB_TO_PATH, swaps in that
// page's own title/description/canonical/og/twitter tags and image, and
// injects the same intro/how-to-use/FAQ copy the live app shows (from
// src/data/pageContent.ts and src/data/pageFaqs.ts) as real HTML *inside*
// `<div id="root">`. Because `main.tsx` calls
// `createRoot(document.getElementById('root')).render(...)`, React replaces
// every child of that div the instant it mounts — so a real visitor never
// sees this static copy, only ever the live app. A non-JS fetch sees the
// same words a JS-executing visitor would eventually see, just rendered as
// plain HTML instead of React components, which is what keeps this from
// being cloaking rather than progressive enhancement.
//
// The homepage ("/") is a special case: Netlify always serves dist/index.html
// for that exact path, and PATH_TO_TAB['/'] maps it to the 'calculator' tab,
// but the loop below writes the 'calculator' tab's content to
// income-tax.html (its TAB_TO_PATH entry), never to index.html itself. So
// index.html is written a second time, explicitly, with the 'calculator'
// tab's content and a canonical/og:url of SITE_URL + '/' instead of
// '/income-tax.html'.
//
// Routes whose path has no ".html" extension (currently just "provincial",
// served at /sales-tax-punjab) are intentionally skipped: Netlify's static
// file serving relies on the extension to pick the right Content-Type, and
// an extension-less static file could be served as
// application/octet-stream instead of text/html. Those routes keep relying
// on the SPA fallback + client-side meta tags and content instead.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_SEO } from '../src/data/pageSeo';
import { PAGE_CONTENT } from '../src/data/pageContent';
import { FAQS_BY_TAB, BASE_FAQS, type FaqItem } from '../src/data/pageFaqs';
import { TAB_TO_PATH, type AppTab } from '../src/utils/subdomainRoutes';

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

// Builds the same intro/how-to-use/FAQ copy PageIntroSection.tsx and
// TaxFaqSection.tsx render client-side, as plain static HTML.
function buildStaticContent(tab: AppTab): string {
  const content = PAGE_CONTENT[tab];
  const faqs: FaqItem[] = FAQS_BY_TAB[tab] ?? BASE_FAQS;

  const introHtml = content
    ? `<h1>${escapeHtml(content.heading)}</h1>` +
      `<p>${escapeHtml(content.intro)}</p>` +
      `<h2>How to use this tool</h2>` +
      `<ol>${content.howToUse.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`
    : '';

  const faqHtml = faqs.length
    ? `<h2>Frequently Asked Questions</h2>` +
      `<dl>${faqs.map((f) => `<dt>${escapeHtml(f.question)}</dt><dd>${escapeHtml(f.answer)}</dd>`).join('')}</dl>`
    : '';

  if (!introHtml && !faqHtml) return '';

  return (
    `<div style="max-width:900px;margin:0 auto;padding:24px 16px;` +
    `font-family:system-ui,-apple-system,sans-serif;color:#1e293b;line-height:1.6;">` +
    introHtml +
    faqHtml +
    `</div>`
  );
}

function buildFaqJsonLd(tab: AppTab): string {
  const faqs: FaqItem[] = FAQS_BY_TAB[tab] ?? BASE_FAQS;
  if (!faqs.length) return '';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  // Safe to inline directly: this is our own authored data (no user input),
  // and JSON.stringify never emits a literal "</script>" sequence here.
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const ROOT_DIV_REGEX = /<div id="root"><\/div>/;

function injectBodyContent(html: string, tab: AppTab): string {
  const staticContent = buildStaticContent(tab);
  const faqJsonLd = buildFaqJsonLd(tab);
  if (!staticContent && !faqJsonLd) return html;
  return replaceTagContent(
    html,
    ROOT_DIV_REGEX,
    `<div id="root">${staticContent}</div>${faqJsonLd}`,
  );
}

function tagPage(template: string, tab: AppTab, canonicalUrl: string): string {
  const seo = PAGE_SEO[tab];
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
  html = injectBodyContent(html, tab);
  return html;
}

function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error(`dist/index.html not found — run "vite build" first.`);
  }
  const template = readFileSync(indexPath, 'utf-8');

  let written = 0;
  let skipped = 0;

  for (const [tab, routePath] of Object.entries(TAB_TO_PATH) as [AppTab, string][]) {
    if (!routePath.endsWith('.html')) {
      skipped += 1;
      continue;
    }

    const html = tagPage(template, tab, `${SITE_URL}${routePath}`);
    const outPath = path.join(DIST_DIR, routePath.replace(/^\//, ''));
    writeFileSync(outPath, html, 'utf-8');
    written += 1;
  }

  // The homepage ("/") always serves dist/index.html directly, and maps to
  // the 'calculator' tab (see PATH_TO_TAB['/'] in subdomainRoutes.ts) — but
  // the loop above never writes index.html itself. Do that explicitly here,
  // with a canonical/og:url of the site root rather than /income-tax.html.
  const homepageHtml = tagPage(template, 'calculator', `${SITE_URL}/`);
  writeFileSync(indexPath, homepageHtml, 'utf-8');
  written += 1;

  console.log(`generate-seo-pages: wrote ${written} static HTML files (including the homepage), skipped ${skipped} extension-less route(s).`);
}

main();
