import type { AppTab } from '../utils/subdomainRoutes';

export interface PageContentEntry {
  /** Short heading shown above the intro paragraph (distinct from the <title> tag). */
  heading: string;
  /** 2-4 sentence explanation of what the tool does and who it's for. */
  intro: string;
  /** Short, numbered "how to use" steps. */
  howToUse: string[];
}

// Real, visible explanatory copy for each calculator/tool page — rendered by
// PageIntroSection.tsx in the live app, and also baked directly into each
// page's static HTML by scripts/generate-seo-pages.ts so the page has real
// content on first load, before any JavaScript runs (see that script for why
// this matters for crawlers, link previews, and content-quality checkers).
export const PAGE_CONTENT: Partial<Record<AppTab, PageContentEntry>> = {
  calculator: {
    heading: 'Pakistan Income & Salary Tax Calculator',
    intro:
      'This calculator estimates your annual and monthly income tax liability under Pakistan\'s Income Tax Ordinance, 2001, for both salaried and non-salaried individuals. It applies the current FBR progressive tax slabs for the selected tax year and shows your tax chargeable, average and marginal tax rate, and take-home pay.',
    howToUse: [
      'Select the tax year and whether you are a salaried or non-salaried individual.',
      'Enter your gross monthly or annual income, along with any exempt allowances or deductions that apply.',
      'Review the calculated tax chargeable, effective tax rate, and monthly take-home salary instantly.',
    ],
  },
  reverse: {
    heading: 'Net to Gross Salary Calculator',
    intro:
      'If you know the monthly take-home salary you want to end up with, this calculator works backwards through Pakistan\'s income tax slabs to estimate the gross salary an employer would need to offer. It\'s useful when comparing job offers quoted in net pay, or when negotiating a package around a target take-home figure.',
    howToUse: [
      'Enter your desired monthly or annual net (take-home) salary.',
      'Select the applicable tax year.',
      'Review the estimated gross salary required, along with the resulting tax deduction.',
    ],
  },
  'invoice-tax': {
    heading: 'Invoice Tax Calculator — GST and Withholding Tax',
    intro:
      'This tool calculates General Sales Tax (GST) and income tax withholding (WHT) on an invoice or payment in Pakistan, based on current FBR rates. It supports both tax-inclusive and tax-exclusive invoice amounts, so you can work from either the pre-tax value or the final billed total.',
    howToUse: [
      'Enter the invoice or payment amount, and choose whether it is tax-inclusive or tax-exclusive.',
      'Select the applicable GST rate and, if relevant, the withholding tax category and filer status.',
      'Review the GST amount, withholding tax deducted, and net payable or receivable figure.',
    ],
  },
  'invoice-withholding': {
    heading: 'Invoice Withholding Calculator — All in One',
    intro:
      'This calculator combines Section 153 income tax withholding and GST on a single invoice, with an optional second section for provincial sales tax on services. It\'s built for cases where a single invoice needs several different tax deductions worked out together, instead of switching between separate calculators.',
    howToUse: [
      'Enter the invoice amount and select the relevant withholding tax section and payee category.',
      'Add GST, and optionally enable the provincial sales tax on services section if the invoice covers a taxable service.',
      'Review the combined breakdown of income tax withheld, GST, and any provincial sales tax, along with the net payment amount.',
    ],
  },
  provincial: {
    heading: 'Provincial Tax Calculator — PRA, SRB, KPRA, BRA, ICT',
    intro:
      'Pakistan\'s provinces and territories each administer their own sales tax on services and several other levies through separate authorities — PRA (Punjab), SRB (Sindh), KPRA (Khyber Pakhtunkhwa), BRA (Balochistan), and the ICT rules for Islamabad. This calculator estimates the applicable provincial services tax, agricultural tax, property transfer tax, and vehicle token tax based on the jurisdiction you select.',
    howToUse: [
      'Select the relevant province or territory (Punjab, Sindh, KP, Balochistan, or ICT).',
      'Choose the specific tax type you need — services tax, agricultural tax, property transfer, or vehicle token tax.',
      'Enter the transaction or income details and review the estimated provincial tax due.',
    ],
  },
  specialized: {
    heading: 'Property, Vehicle & IT Export Tax Calculators',
    intro:
      'This is a hub for three specialized FBR tax calculators that don\'t fit neatly into salary or invoice tax: property purchase/sale advance tax under Sections 236K and 236C, vehicle registration advance tax under Section 231B, and IT/freelancer export remittance tax under Section 154A.',
    howToUse: [
      'Choose the calculator you need: Property, Vehicle Registration, or IT Export Tax.',
      'Enter the relevant transaction value, engine capacity, or export remittance amount.',
      'Review the calculated advance tax based on your filer or non-filer status.',
    ],
  },
  'property-valuation': {
    heading: 'FBR Property Valuation Calculator',
    intro:
      'This calculator estimates the advance tax due on a property purchase or sale using FBR\'s notified valuation tables, applied by city and locality. Since advance tax under Sections 236K and 236C is charged on the higher of the declared value or the notified FBR/DC valuation, knowing the notified rate for your locality first is essential.',
    howToUse: [
      'Select the city and locality where the property is located.',
      'Choose the property classification — residential, commercial, or plot/land — and enter the transaction value.',
      'Review the applicable FBR valuation and the resulting advance tax for filers and non-filers.',
    ],
  },
  'vehicle-registration': {
    heading: 'Vehicle Registration Tax Calculator — Section 231B',
    intro:
      'This calculator estimates the advance tax payable on registering a new or imported motor vehicle in Pakistan under Section 231B of the Income Tax Ordinance. Rates are tiered by engine capacity and differ significantly between active filers and non-filers.',
    howToUse: [
      'Enter the vehicle\'s engine capacity (in cc) or select it from the common presets.',
      'Select your filer or non-filer status.',
      'Review the estimated advance tax due at registration.',
    ],
  },
  'it-export-tax': {
    heading: 'IT Export Tax Calculator — Section 154A',
    intro:
      'This calculator estimates the final tax due on IT and IT-enabled services export remittances under Section 154A, which applies a reduced rate for PSEB/P@SHA-registered exporters compared to unregistered ones, provided the proceeds are received through normal banking channels.',
    howToUse: [
      'Enter the export remittance amount received.',
      'Indicate whether you are PSEB/P@SHA registered.',
      'Review the applicable final tax rate and amount due.',
    ],
  },
  'pta-mobile-tax': {
    heading: 'PTA Mobile Registration Tax Calculator',
    intro:
      'This calculator estimates the PTA/customs duty and tax payable to register an imported mobile phone in Pakistan through DIRBS, based on the phone\'s declared value and whether you register it using your passport or your CNIC.',
    howToUse: [
      'Select the phone\'s price band or enter its declared/invoice value.',
      'Choose whether you are registering via passport or CNIC.',
      'Review the estimated total tax payable to activate the device on a local network.',
    ],
  },
  zakat: {
    heading: 'Zakat Calculator — Nisab and Hawl',
    intro:
      'This calculator works out the Zakat due on your Zakatable assets — cash, gold, silver, savings, and eligible investments — after deducting short-term liabilities, based on the current Nisab threshold and your Hawl (the lunar year since your wealth first reached Nisab).',
    howToUse: [
      'Enter your Zakatable assets — cash, bank balances, gold, silver, and eligible investments.',
      'Enter any short-term liabilities or debts to deduct.',
      'Review your net Zakatable wealth against the current Nisab threshold and the resulting Zakat due (2.5%).',
    ],
  },
  history: {
    heading: 'My Calculation History',
    intro:
      'Signed-in users can save supported calculations here and come back to review them later. It\'s a personal record for planning purposes — not an official FBR, provincial, PTA, or bank filing or receipt.',
    howToUse: [
      'Sign in to your account.',
      'Use the save option on a supported calculator after running a calculation.',
      'Return to this page anytime to review or reopen a saved calculation.',
    ],
  },
  'agricultural-tax': {
    heading: 'Agricultural Income Tax Calculator',
    intro:
      'Agricultural income tax in Pakistan is administered by provincial governments rather than the FBR, and can be assessed either on land holding or on net agricultural income depending on the province. This calculator estimates the tax due under the relevant provincial regime.',
    howToUse: [
      'Select the relevant province.',
      'Choose whether your tax is based on land area or on agricultural income, and enter the corresponding figure.',
      'Review the estimated provincial agricultural tax due.',
    ],
  },
  'property-stamp-duty': {
    heading: 'Property Stamp Duty & CVT Calculator',
    intro:
      'This calculator estimates the provincial stamp duty, Capital Value Tax (CVT), and registration charges due when transferring immovable property in Pakistan, in addition to any federal advance tax already covered by the Property Valuation calculator.',
    howToUse: [
      'Select the relevant province and property type.',
      'Enter the transaction value or applicable DC/FBR valuation.',
      'Review the estimated stamp duty, CVT, and registration fees.',
    ],
  },
  'vehicle-token-tax': {
    heading: 'Vehicle Token Tax Calculator',
    intro:
      'This calculator estimates the annual provincial vehicle token tax due on a car or other motor vehicle, which is set separately by each province\'s Excise and Taxation Department and generally depends on engine capacity and vehicle type.',
    howToUse: [
      'Select your province and the vehicle type.',
      'Enter the engine capacity or select it from the presets.',
      'Review the estimated annual token tax due, including any late-payment surcharge if applicable.',
    ],
  },
  'professional-tax': {
    heading: 'Professional Tax Calculator',
    intro:
      'Provincial professional tax applies to certain salaried individuals, professionals, traders, and businesses in Pakistan, with rules, categories, and rates set independently by each province.',
    howToUse: [
      'Select your province.',
      'Choose the category that applies to you — salaried individual, professional, or business.',
      'Review the estimated professional tax liability.',
    ],
  },
  'tax-slabs': {
    heading: 'FBR Income Tax Slabs',
    intro:
      'This page shows the official FBR progressive income tax slabs for salaried and non-salaried individuals, and lets you compare rates across recent tax years. Each slab lists the income range, the base tax already accumulated from lower slabs, and the marginal rate applied to income within that slab.',
    howToUse: [
      'Select the tax year and taxpayer category (salaried or non-salaried) you want to view.',
      'Enter your annual taxable income to highlight the slab and marginal rate that applies to you.',
      'Compare slabs across tax years to see how rates have changed.',
    ],
  },
  'filer-vs-nonfiler': {
    heading: 'Filer vs Non-Filer Withholding Tax Matrix',
    intro:
      'Active Taxpayer List (ATL) filers pay significantly lower withholding tax rates than non-filers on many common transactions — property, vehicles, banking, and investments. This page lays out the filer and non-filer rates side by side across the most common categories.',
    howToUse: [
      'Browse the matrix by transaction category — property, vehicles, banking, or investments.',
      'Compare the filer rate against the non-filer rate for your transaction.',
      'Use the ATL check guidance if you\'re unsure of your current filer status.',
    ],
  },
  'tax-savings': {
    heading: 'Tax Savings & Deductions Optimizer',
    intro:
      'This tool shows how legitimate tax credits under Sections 61 and 62 of the Income Tax Ordinance — Voluntary Pension Scheme (VPS) contributions, approved charitable donations, and qualifying health insurance premiums — reduce your annual tax liability, subject to their respective caps.',
    howToUse: [
      'Enter your taxable income and the tax already calculated for the year.',
      'Enter your planned or actual VPS contributions, donations, and health insurance premiums.',
      'Review how much each credit saves, subject to its cap, and your revised net tax payable.',
    ],
  },
  'iris-simulator': {
    heading: 'FBR IRIS Practice Simulator',
    intro:
      'This simulator lets you practice filing a Pakistan income tax return using the same structure, field labels, and line items as the real FBR IRIS portal — salary, property, business, capital gain, and other income sources, tax credits, and the Wealth Statement — without touching the real system. It\'s independent of FBR and nothing entered here is filed anywhere.',
    howToUse: [
      'Start a practice return and select the income sources that apply to you.',
      'Work through each section entering practice figures, the same way you would on the real IRIS portal.',
      'Review the computed tax chargeable and Wealth Statement reconciliation at the end.',
    ],
  },
};
