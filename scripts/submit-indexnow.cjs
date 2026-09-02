const siteUrl = process.env.INDEXNOW_SITE_URL;
const key = 'cc95cb01aed24508a18b995de1fde73d';

if (!siteUrl) {
  throw new Error('Set INDEXNOW_SITE_URL to the published site origin, for example https://paktaxcalculator.net');
}

const origin = new URL(siteUrl).origin;
const urlList = [
  '/',
  '/income-tax.html',
  '/invoice-withholding.html',
  '/sales-tax-gst.html',
  '/sales-tax-punjab',
  '/fbr-property-valuation.html',
  '/vehicle-registration-tax.html',
  '/it-export-tax.html',
  '/zakat-calculator.html',
  '/property-expense-calculator.html',
].map((pathname) => new URL(pathname, origin).href);

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(origin).host,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList,
  }),
});

if (!response.ok) {
  throw new Error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs for ${origin}.`);
