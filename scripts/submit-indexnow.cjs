#!/usr/bin/env node
// Notifies IndexNow-participating search engines (Bing, Yandex, and others
// that read from the shared IndexNow endpoint) that this site's URLs have
// changed, so they can re-crawl sooner instead of waiting for their normal
// schedule.
//
// How this works, end to end:
//   1. IndexNow requires a "key file" hosted at the site root that proves
//      you control the domain: https://paktaxcalculator.net/<KEY>.txt,
//      containing just the key. That file lives in public/<KEY>.txt in
//      this repo (Vite copies public/ verbatim into dist/), so it ships
//      automatically with every deploy — nothing to configure there.
//   2. This script POSTs { host, key, keyLocation, urlList } to
//      https://api.indexnow.org/indexnow. IndexNow then fans that out to
//      every participating search engine on your behalf.
//   3. Run it manually after a deploy (`npm run indexnow`), or wire it into
//      CI to run once your Netlify build finishes.
//
// The key file must already be LIVE on the deployed site before you submit
// for the first time, or the submission will fail verification — push and
// deploy once, then run `npm run indexnow`.
//
// If you rotate the key, delete the old public/<key>.txt, generate a new
// one (see generateKey() below) and update KEY_FILE_NAME to match.

const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'paktaxcalculator.net';
const KEY_FILE_NAME = 'c430698ac1166cb276d4820f58bfd036.txt';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Every user-facing route the app serves. Keep this in sync with
// TAB_TO_PATH in src/utils/subdomainRoutes.ts — when a route is added or
// renamed there, add or update it here too so IndexNow submissions stay
// accurate.
const ROUTES = [
  '/',
  '/income-tax.html',
  '/reverse-net-to-gross.html',
  '/invoice-tax.html',
  '/invoice-withholding.html',
  '/sales-tax-punjab',
  '/sales-tax-sindh',
  '/sales-tax-kpk',
  '/sales-tax-balochistan',
  '/sales-tax-ict',
  '/specialized-calculators.html',
  '/fbr-property-valuation.html',
  '/vehicle-registration-tax.html',
  '/it-export-tax.html',
  '/pta-mobile-tax-calculator.html',
  '/zakat-calculator.html',
  '/my-wht-log.html',
  '/agricultural-income-tax.html',
  '/property-expense-calculator.html',
  '/vehicle-token-tax.html',
  '/professional-tax.html',
  '/fbr-tax-slabs.html',
  '/filer-vs-non-filer.html',
  '/tax-savings-calculator.html',
  '/about.html',
  '/contact.html',
  '/privacy.html',
  '/feedback.html',
];

function readKey() {
  const keyPath = path.join(PUBLIC_DIR, KEY_FILE_NAME);
  if (!fs.existsSync(keyPath)) {
    console.error(`Key file not found at public/${KEY_FILE_NAME}.`);
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(16).toString(\'hex\'))"');
    console.error('then save it to public/<that-value>.txt (containing just the key) and update KEY_FILE_NAME above.');
    process.exit(1);
  }
  return fs.readFileSync(keyPath, 'utf8').trim();
}

function submit(key) {
  const keyLocation = `https://${HOST}/${KEY_FILE_NAME}`;
  const urlList = ROUTES.map((route) => `https://${HOST}${route}`);

  const payload = JSON.stringify({
    host: HOST,
    key,
    keyLocation,
    urlList,
  });

  const req = https.request(
    {
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log(`IndexNow responded ${res.statusCode}${body ? `: ${body}` : ''}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Submitted ${urlList.length} URLs for ${HOST}.`);
        } else {
          console.error('IndexNow submission was not accepted. Common causes: the key file is not live yet on the deployed site, or the host does not match exactly.');
          process.exitCode = 1;
        }
      });
    },
  );

  req.on('error', (err) => {
    console.error('IndexNow submission failed:', err.message);
    process.exitCode = 1;
  });

  req.write(payload);
  req.end();
}

submit(readKey());
