export type AppTab =
  | 'calculator'
  | 'reverse'
  | 'invoice-tax'
  | 'invoice-withholding'
  | 'provincial'
  | 'specialized'
  | 'property-valuation'
  | 'vehicle-registration'
  | 'it-export-tax'
  | 'pta-mobile-tax'
  | 'zakat'
  | 'history'
  | 'agricultural-tax'
  | 'property-stamp-duty'
  | 'vehicle-token-tax'
  | 'professional-tax'
  | 'tax-slabs'
  | 'filer-vs-nonfiler'
  | 'tax-savings'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'feedback'
  | 'iris-simulator';

export const TAB_TO_PATH: Record<AppTab, string> = {
  calculator: '/income-tax.html',
  reverse: '/reverse-net-to-gross.html',
  'invoice-tax': '/invoice-tax.html',
  'invoice-withholding': '/invoice-withholding.html',
  provincial: '/sales-tax-punjab',
  specialized: '/specialized-calculators.html',
  'property-valuation': '/fbr-property-valuation.html',
  'vehicle-registration': '/vehicle-registration-tax.html',
  'it-export-tax': '/it-export-tax.html',
  'pta-mobile-tax': '/pta-mobile-tax-calculator.html',
  zakat: '/zakat-calculator.html',
  history: '/my-wht-log.html',
  'agricultural-tax': '/agricultural-income-tax.html',
  'property-stamp-duty': '/property-expense-calculator.html',
  'vehicle-token-tax': '/vehicle-token-tax.html',
  'professional-tax': '/professional-tax.html',
  'tax-slabs': '/fbr-tax-slabs.html',
  'filer-vs-nonfiler': '/filer-vs-non-filer.html',
  'tax-savings': '/tax-savings-calculator.html',
  about: '/about.html',
  contact: '/contact.html',
  privacy: '/privacy.html',
  feedback: '/feedback.html',
  'iris-simulator': '/iris-practice-simulator.html',
};

const PATH_TO_TAB: Record<string, AppTab> = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab as AppTab]),
);

PATH_TO_TAB['/'] = 'calculator';

const LEGACY_PATH_TO_TAB: Record<string, AppTab> = {
  '/index.html': 'calculator',
  '/withholding-tax.html': 'invoice-tax',
  '/sales-tax-withholding.html': 'invoice-tax',
  '/sales-tax-gst.html': 'invoice-tax',
  '/apna-ghar-calculator.html': 'specialized',
  '/sales-tax-punjab.html': 'provincial',
  '/sales-tax-sindh.html': 'provincial',
  '/sales-tax-kpk.html': 'provincial',
  '/sales-tax-balochistan.html': 'provincial',
  '/sales-tax-ict.html': 'provincial',
  '/sales-tax-punjab': 'provincial',
  '/sales-tax-sindh': 'provincial',
  '/sales-tax-kpk': 'provincial',
  '/sales-tax-balochistan': 'provincial',
  '/sales-tax-ict': 'provincial',
};

export function getTabFromPathname(pathname: string): AppTab {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (/^\/sales-tax-(punjab|sindh|kpk|balochistan|ict)(\.html)?$/.test(normalized)) {
    return 'provincial';
  }
  return PATH_TO_TAB[normalized] ?? LEGACY_PATH_TO_TAB[normalized] ?? 'calculator';
}

export function buildCalculatorUrl(tab: AppTab, currentLocation: Location): string {
  const nextUrl = new URL(currentLocation.href);
  nextUrl.pathname = TAB_TO_PATH[tab];
  nextUrl.search = '';
  nextUrl.hash = '';
  return nextUrl.toString();
}
