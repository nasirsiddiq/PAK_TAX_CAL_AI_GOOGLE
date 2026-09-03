import type { AppTab } from '../utils/subdomainRoutes';

export interface PageSeoEntry {
  title: string;
  description: string;
  keywords: string;
  /** Absolute-from-root path to this page's social share image (1200x630). */
  image: string;
  /**
   * Set for pages that are account-specific and have no content worth
   * indexing or serving ads against for a signed-out visitor (e.g. the
   * calculation history page, which is just a "Sign In Required" notice
   * until the user signs in). Tells App.tsx to mark the page noindex.
   */
  noindex?: boolean;
}

// Single source of truth for per-page SEO + social share metadata. Used both
// client-side (App.tsx, for in-app navigation) and by
// scripts/generate-seo-pages.mjs (a postbuild step that bakes this same data
// into static per-route HTML files, since Facebook/WhatsApp/Twitter/LinkedIn
// link-preview crawlers don't run JavaScript and would otherwise only ever
// see the default homepage tags).
export const PAGE_SEO: Record<AppTab, PageSeoEntry> = {
  calculator: {
    title: 'Pakistan Income & Salary Tax Calculator 2025-26 & 2026-27',
    description: 'Free Pakistan income tax & salary tax calculator, updated for FY 2025-26 and 2026-27. Instantly calculate FBR income tax, monthly withholding, and take-home salary.',
    keywords: 'Pakistan income tax calculator, salary tax calculator Pakistan, FBR tax calculator, tax calculator 2025-26, tax calculator 2026-27, tax calculator pakistan 2025-26, salary tax calculator 2025-26, tax calculator pakistan, income tax calculation in pakistan, tax calculator fbr pakistan, income tax rate in pakistan, monthly salary tax, take home salary Pakistan',
    image: '/og/calculator.jpg',
  },
  reverse: {
    title: 'Pakistan Net to Gross Salary Calculator | FBR Tax',
    description: 'Calculate the gross salary required for your target net salary after Pakistan income tax deductions.',
    keywords: 'net to gross salary calculator Pakistan, reverse tax calculator, take home salary calculator Pakistan, FBR salary tax',
    image: '/og/reverse.jpg',
  },
  'invoice-tax': {
    title: 'Pakistan Invoice Tax Calculator | GST and WHT',
    description: 'Calculate Pakistan GST and withholding tax on invoices and payments using current FBR tax rules.',
    keywords: 'Pakistan GST calculator, withholding tax calculator Pakistan, withholding tax pakistan, WHT calculator, invoice tax calculator, sales tax on invoice, FBR withholding tax rates',
    image: '/og/invoice-tax.jpg',
  },
  provincial: {
    title: 'Pakistan Provincial Tax Calculator | PRA, SRB, KPRA, BRA, ICT',
    description: 'Calculate provincial services tax, withholding tax, agricultural tax, property transfer tax, vehicle token tax, and professional tax in Pakistan.',
    keywords: 'provincial tax calculator Pakistan, PRA sales tax, SRB sales tax, KPRA tax, BRA tax, ICT services tax, Punjab tax calculator',
    image: '/og/provincial.jpg',
  },
  specialized: {
    title: 'Pakistan Property, Vehicle and IT Export Tax Calculators',
    description: 'Calculate Pakistan property transfer tax, vehicle registration tax, and IT or freelancer export tax.',
    keywords: 'Pakistan property tax calculator, vehicle registration tax, IT export tax Pakistan, freelancer tax calculator, Section 236K, Section 231B, Section 154A',
    image: '/og/specialized.jpg',
  },
  'property-valuation': {
    title: 'FBR Property Valuation Calculator | Pakistan Locality Rates',
    description: 'Calculate property transfer advance tax and FBR/DC valuation using city and locality rates.',
    keywords: 'FBR property valuation, DC rate calculator Pakistan, property valuation by city, FBR immovable property valuation, Section 236K, Section 236C',
    image: '/og/property-valuation.jpg',
  },
  'vehicle-registration': {
    title: 'Pakistan Vehicle Registration Tax Calculator | Section 231B',
    description: 'Calculate Pakistan vehicle registration advance tax under Section 231B.',
    keywords: 'vehicle registration tax Pakistan, Section 231B calculator, car registration tax Pakistan, FBR vehicle advance tax',
    image: '/og/vehicle-registration.jpg',
  },
  'it-export-tax': {
    title: 'Pakistan IT Export Tax Calculator | Section 154A',
    description: 'Calculate tax on Pakistan IT and freelancer export remittances under Section 154A.',
    keywords: 'IT export tax Pakistan, freelancer tax calculator Pakistan, Section 154A, PSEB tax rate, software export tax Pakistan, IT remittance tax',
    image: '/og/it-export-tax.jpg',
  },
  'pta-mobile-tax': {
    title: 'PTA Mobile Registration Tax Calculator | Pakistan',
    description: 'Estimate PTA and customs registration taxes for imported mobile phones using CNIC or passport registration.',
    keywords: 'PTA tax calculator, mobile registration tax Pakistan, tax on mobile phones in Pakistan, DIRBS tax, FBR mobile duty, phone tax Pakistan, IMEI registration tax, passport CNIC mobile tax',
    image: '/og/pta-mobile-tax.jpg',
  },
  zakat: {
    title: 'Pakistan Zakat Calculator | Nisab and Hawl',
    description: 'Calculate Zakat due in Pakistan using your assets, debt, Nisab threshold, and Hawl date.',
    keywords: 'Zakat calculator Pakistan, Nisab calculator, Zakat on gold Pakistan, Zakat on cash, Hawl date calculator',
    image: '/og/zakat.jpg',
  },
  history: {
    title: 'Pakistan Tax Calculation History',
    description: 'Review saved Pakistan tax calculations and reusable calculation templates.',
    keywords: 'Pakistan tax calculation history, saved tax calculations',
    image: '/og/history.jpg',
    noindex: true,
  },
  'agricultural-tax': {
    title: 'Pakistan Agricultural Income Tax Calculator',
    description: 'Calculate provincial agricultural income tax in Pakistan by land area or annual agricultural income.',
    keywords: 'agricultural income tax Pakistan, farm tax calculator Pakistan, Punjab agricultural tax, agricultural land tax',
    image: '/og/agricultural-tax.jpg',
  },
  'property-stamp-duty': {
    title: 'Pakistan Property Stamp Duty and CVT Calculator',
    description: 'Calculate provincial stamp duty, CVT, registration costs, and property transfer taxes in Pakistan.',
    keywords: 'property stamp duty calculator Pakistan, CVT calculator, property registration fee Pakistan, property transfer tax',
    image: '/og/property-stamp-duty.jpg',
  },
  'vehicle-token-tax': {
    title: 'Pakistan Vehicle Token Tax Calculator',
    description: 'Calculate provincial vehicle token tax for cars and other vehicles in Pakistan.',
    keywords: 'vehicle token tax calculator Pakistan, car token tax, excise token tax Pakistan',
    image: '/og/vehicle-token-tax.jpg',
  },
  'professional-tax': {
    title: 'Pakistan Professional Tax Calculator',
    description: 'Calculate provincial professional tax in Pakistan for salaried individuals, businesses, and companies.',
    keywords: 'professional tax calculator Pakistan, Punjab professional tax, provincial professional tax',
    image: '/og/professional-tax.jpg',
  },
  'invoice-withholding': {
    title: 'Invoice Withholding Calculator | All in One | GST and WHT',
    description: 'Calculate Section 153 income tax withholding, GST, and optional provincial sales tax on services on a single invoice, all in one place.',
    keywords: 'invoice withholding calculator Pakistan, all in one withholding calculator, Section 153 calculator, GST and WHT calculator, provincial sales tax withholding',
    image: '/og/invoice-withholding.jpg',
  },
  'tax-slabs': {
    title: 'Pakistan FBR Income Tax Slabs 2026-27',
    description: 'View and compare official FBR income tax slabs for salaried and non-salaried individuals across recent tax years.',
    keywords: 'FBR tax slabs, Pakistan income tax slabs 2026-27, salaried tax slabs, non-salaried tax slabs, tax bracket Pakistan',
    image: '/og/tax-slabs.jpg',
  },
  'filer-vs-nonfiler': {
    title: 'Filer vs Non-Filer Withholding Tax Rates Pakistan',
    description: 'Compare active taxpayer (filer) and non-filer withholding tax rates in Pakistan across property, vehicles, banking and investments.',
    keywords: 'filer vs non-filer Pakistan, ATL rates, non-filer tax rate, active taxpayer list, withholding tax matrix Pakistan',
    image: '/og/filer-vs-nonfiler.jpg',
  },
  'tax-savings': {
    title: 'Pakistan Tax Savings and Deductions Optimizer',
    description: 'See how VPS pension contributions, charitable donations, and health insurance legally reduce your Pakistan income tax liability.',
    keywords: 'tax savings calculator Pakistan, VPS pension tax credit, Section 61 donations, Section 62 tax credit, reduce income tax Pakistan',
    image: '/og/tax-savings.jpg',
  },
  about: {
    title: 'About Us | Pak Tax Calculator',
    description: 'Learn about paktaxcalculator.net, a free independent tool for estimating Pakistan income tax, GST, withholding tax and provincial taxes.',
    keywords: 'about pak tax calculator, Pakistan tax calculator website',
    image: '/og/about.jpg',
  },
  contact: {
    title: 'Contact Us | Pak Tax Calculator',
    description: 'Get in touch with paktaxcalculator.net about corrections, partnerships, media enquiries or general questions.',
    keywords: 'contact pak tax calculator, Pakistan tax calculator contact',
    image: '/og/contact.jpg',
  },
  privacy: {
    title: 'Privacy Policy | Pak Tax Calculator',
    description: 'Read the privacy policy for paktaxcalculator.net, including what data is and is not collected when you use the calculators.',
    keywords: 'privacy policy pak tax calculator, Pakistan tax calculator privacy',
    image: '/og/privacy.jpg',
  },
  feedback: {
    title: 'Feedback | Pak Tax Calculator',
    description: 'Report an outdated tax rate, a bug, or suggest a new calculator for paktaxcalculator.net.',
    keywords: 'feedback pak tax calculator, report tax rate error, suggest calculator',
    image: '/og/feedback.jpg',
  },
  'iris-simulator': {
    title: 'FBR IRIS Practice Simulator | Practice Your Tax Return',
    description: 'Practice filing your Pakistan income tax return before using the real FBR IRIS portal. A free, independent simulator covering salary, property, business, capital gain, foreign income, agriculture and the Wealth Statement.',
    keywords: 'IRIS practice simulator, FBR IRIS practice, how to file tax return Pakistan, IRIS return demo, practice tax return Pakistan, wealth statement practice, FBR 114(1) return, IRIS login practice',
    image: '/og/iris-simulator.jpg',
  },
};
