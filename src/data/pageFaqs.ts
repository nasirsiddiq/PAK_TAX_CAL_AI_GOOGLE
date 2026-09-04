// Shared FAQ data, keyed by AppTab (plus a couple of legacy/unused keys kept
// harmlessly for backwards compatibility). Used by TaxFaqSection.tsx for the
// live, client-rendered accordion, and imported directly by
// scripts/generate-seo-pages.ts (a plain Node/tsx script, not a React
// component) so the same real questions and answers can be baked into the
// static HTML of every page — see that script for why that matters for
// non-JS crawlers and content checkers.
export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const BASE_FAQS: FaqItem[] = [
  {
    category: 'FBR Basics',
    question: 'Who is considered a "Salaried Individual" under Pakistan tax law?',
    answer:
      'Under the Income Tax Ordinance 2001, an individual is classified as a "Salaried Individual" if their income from salary exceeds 75% of their total taxable income for the tax year. Salaried individuals benefit from lower progressive tax slab rates compared to business individuals.',
  },
  {
    category: 'Filing & Deadlines',
    question: 'When is the deadline to file annual Income Tax returns in Pakistan?',
    answer:
      'For salaried individuals, freelancers, and non-salaried individuals whose tax year ends on June 30, the statutory annual income tax return filing deadline is September 30 (subject to extensions granted by the FBR).',
  },
  {
    category: 'Tax Benefits',
    question: 'Why should I file my return if my employer already deducts income tax?',
    answer:
      'Even if your employer deducts withholding tax under Section 149, you must submit your annual return on the FBR Iris portal to remain on the Active Taxpayer List (ATL). Active Filers avoid severe 2x to 4x penalty withholding taxes on property purchases (236K), cash withdrawals (231AB), vehicle purchases (231B), and dividend payouts.',
  },
  {
    category: 'Exemptions',
    question: 'How does the Medical Allowance tax exemption work?',
    answer:
      'Under Clause (139) of Part I of the Second Schedule to the Income Tax Ordinance, medical allowance received by an employee up to 10% of their Basic Salary is 100% exempt from income tax, provided the employer does not provide free medical treatment/hospitalization facility.',
  },
  {
    category: 'How to check ATL',
    question: 'How do I check if my name is on the Active Taxpayer List (ATL)?',
    answer:
      'You can verify your ATL status instantly by sending an SMS to 9966 with format "ATL <13-digit CNIC>" (e.g. ATL 4210112345671), or by visiting the official FBR Online NTN / ATL Inquiry portal.',
  },
];

export const FAQS_BY_TAB: Record<string, FaqItem[]> = {
  calculator: [
    ...BASE_FAQS,
    {
      category: 'Salary Tax',
      question: 'Do I pay tax on my take-home salary or gross salary?',
      answer:
        'Pakistan income tax is applied on taxable income after deductions, allowances, and exempt items under the annual tax regime. Your employer deducts withholding tax from gross salary, but your final annual liability is based on the applicable tax slab and your annual taxable income.',
    },
  ],
  reverse: [
    ...BASE_FAQS,
    {
      category: 'Reverse Salary',
      question: 'How do I determine the gross salary needed for my target net salary?',
      answer:
        'Start from your target monthly take-home pay and work backwards through tax deductions, allowances, and annual taxable income. This calculator estimates the required gross salary before tax so you can compare salary offers more accurately.',
    },
  ],
  wht: [
    {
      category: 'Withholding Tax',
      question: 'What is withholding tax on invoices and payments?',
      answer:
        'Withholding tax is deducted at source by the payer on certain payments, including services, exports, contracts, purchases, and bank transactions. It often acts as advance tax and may be adjustable against your annual tax liability if properly documented.',
    },
    {
      category: 'Filer vs Non-Filer',
      question: 'Why do filer and non-filer rates differ so much?',
      answer:
        'As part of the FBR compliance regime, active taxpayers usually pay lower withholding tax rates. Non-filers often face higher rates or surcharges because they are not on the ATL and are not fully compliant with filing obligations.',
    },
    {
      category: 'Payments',
      question: 'Is withholding tax a final tax?',
      answer:
        'Not always. Many withholding taxes are advance taxes that can be adjusted against your annual return. Some final taxes, such as certain export proceeds or specific statutory regimes, are treated as final discharge of tax liability.',
    },
  ],
  'sales-tax': [
    {
      category: 'GST & Sales Tax',
      question: 'What is the difference between inclusive and exclusive sales tax?',
      answer:
        'Inclusive pricing includes sales tax in the displayed price, while exclusive pricing excludes tax and adds it separately at the point of calculation. The correct treatment depends on the invoice, contract, and the tax regime applicable to the product or transaction.',
    },
    {
      category: 'FBR Compliance',
      question: 'When is sales tax supposed to be collected and deposited?',
      answer:
        'Sales tax is usually collected on taxable supplies at the time of sale, then returned and paid to the relevant tax authority through the seller’s regular sales tax filing cycle. Accurate invoicing and proper tax records are essential for FBR compliance.',
    },
  ],
  provincial: [
    {
      category: 'Provincial Taxes',
      question: 'Which provincial taxes are included in this calculator?',
      answer:
        'This calculator covers provincial services tax, agricultural tax, property transfer tax, professional tax, and vehicle token tax based on the relevant province or territory. Rules vary by province and by the type of transaction or service.',
    },
    {
      category: 'PD/PR',
      question: 'Why do provincial tax rates differ between Punjab, Sindh, KP, and ICT?',
      answer:
        'Provincial tax laws are administered separately by each province or territory. Each authority sets its own tax base, rates, exemptions, and filing procedures, so a transaction can carry different tax impacts depending on jurisdiction.',
    },
  ],
  specialized: [
    {
      category: 'Property Tax',
      question: 'How is the property advance tax under Section 236K or 236C calculated?',
      answer:
        'FBR property advance tax is generally based on the higher of a notified DC/FBR value or the declared transaction value, multiplied by the applicable filer or non-filer rate. The exact rate depends on whether it is a purchase or sale and on the taxpayer status on the ATL.',
    },
    {
      category: 'Vehicle Tax',
      question: 'Why does engine capacity change my advance tax?',
      answer:
        'Motor vehicle advance tax under Section 231B follows engine-displacement-based tiers. Smaller vehicles attract fixed taxes, while larger-engine vehicles can be taxed as a percentage of the vehicle value or on a higher fixed scale.',
    },
    {
      category: 'IT Exports',
      question: 'What rate applies to software and freelance export remittances?',
      answer:
        'Under Section 154A, export remittances from IT and IT-enabled services are taxed at a final tax rate of 0.25% for PSEB/P@SHA registered exporters and 1% for others when received through official banking channels.',
    },
  ],
  'invoice-tax': [
    {
      category: 'GST on Invoice',
      question: 'Should I calculate GST as inclusive or exclusive of the invoice value?',
      answer:
        'Use exclusive mode when the quoted amount is before tax; GST is added to it. Use inclusive mode when the quoted amount already includes GST; the calculator extracts the tax portion from the total.',
    },
    {
      category: 'WHT',
      question: 'Is withholding tax the same as GST?',
      answer:
        'No. GST is charged on a taxable supply, while withholding tax is deducted by the payer from specified payments. Depending on the transaction, withholding tax may be adjustable against the supplier’s annual income tax.',
    },
  ],
  'property-valuation': [
    {
      category: 'FBR Valuation',
      question: 'Which property value is used to calculate advance tax?',
      answer:
        'Property advance tax is generally calculated on the higher of the declared transaction value and the applicable notified FBR/DC valuation. Confirm the applicable notification and transaction documents before transfer.',
    },
    {
      category: 'Locality Rates',
      question: 'Why does the locality rate depend on property use?',
      answer:
        'FBR valuation notifications may specify separate values for residential, commercial, industrial, land, built property, or flats. Select the classification that matches the transaction and verify it with the official notification.',
    },
  ],
  'vehicle-registration': [
    {
      category: 'Section 231B',
      question: 'Why does vehicle registration tax vary by engine capacity?',
      answer:
        'Advance tax on registration is prescribed in engine-capacity tiers. Larger vehicles can have higher fixed tax or a value-based rate, and the filer status may also change the applicable amount.',
    },
  ],
  'it-export-tax': [{ category: 'Section 154A', question: 'What is required for the IT export tax rate?', answer: 'Export proceeds should be received through normal banking channels and supporting export documentation should be retained. Registration status and the applicable tax year can affect the rate.' }],
  'pta-mobile-tax': [{ category: 'PTA DIRBS', question: 'How do I find the final tax for my phone?', answer: 'Use the official FBR individual mobile duty lookup with the handset details and verify the IMEI through PTA DIRBS. The final payable amount depends on the device valuation and registration method.' }],
  'agricultural-tax': [
    { category: 'Agricultural Income', question: 'Which province applies agricultural income tax?', answer: 'Agricultural income tax is administered by provincial governments. The applicable rates, land thresholds, exemptions, and filing rules depend on where the agricultural land or income is situated.' },
    { category: 'Tax Basis', question: 'Is agricultural tax based on land area or income?', answer: 'Depending on the provincial regime and taxpayer circumstances, tax may be determined from land holding, net agricultural income, or both. Confirm the current provincial notification before filing.' },
  ],
  'property-stamp-duty': [
    { category: 'Property Transfer', question: 'Which value is used for stamp duty and registration charges?', answer: 'Charges are usually based on the applicable DC/FBR valuation or the declared consideration, subject to provincial rules. The final base should be verified with the relevant sub-registrar or revenue authority.' },
    { category: 'Buyer and Seller', question: 'Who pays property transfer taxes?', answer: 'The buyer and seller can have different obligations, including provincial duties and federal advance taxes. The sale agreement and applicable provincial law determine the final responsibility.' },
  ],
  'vehicle-token-tax': [
    { category: 'Vehicle Token Tax', question: 'How is annual vehicle token tax calculated?', answer: 'Vehicle token tax is set by provincial authorities and usually depends on engine capacity, vehicle type, registration location, and any applicable late-payment surcharge.' },
    { category: 'Payment', question: 'Where should vehicle token tax be verified and paid?', answer: 'Verify the payable amount and payment method with the relevant provincial Excise and Taxation Department or its official online service before payment.' },
  ],
  'professional-tax': [
    { category: 'Professional Tax', question: 'Who may be liable for professional tax?', answer: 'Professional tax rules can apply to certain professions, trades, businesses, employers, and salaried persons, depending on the province and prescribed income or category thresholds.' },
    { category: 'Provincial Rules', question: 'Why do professional tax amounts vary?', answer: 'Each province administers professional tax separately and may set different categories, exemptions, payment dates, and rates.' },
  ],
  history: [
    { category: 'My Account', question: 'What can I save in My Account?', answer: 'Signed-in users can save supported calculations and review them later from their calculation history. Always recheck saved estimates when rates or facts change.' },
    { category: 'Privacy', question: 'Is a saved calculation an official filing record?', answer: 'No. Saved calculations are planning records only. They do not replace an FBR, provincial authority, PTA, or bank receipt and should not be used as proof of payment.' },
  ],
  zakat: [
    {
      category: 'Zakat',
      question: 'What is the Nisab and how is it applied?',
      answer: 'Nisab is the minimum threshold of wealth required before Zakat becomes due. The exact threshold is based on the current value of gold, silver, cash, and other eligible assets, with the calculation depending on the lunar year and your total net assets.',
    },
  ],
  'invoice-withholding': [
    {
      category: 'All in One',
      question: 'What does the "Invoice Withholding — All in One" calculator cover that Invoice Tax does not?',
      answer:
        'It combines Section 153 income tax withholding and GST on an invoice with an optional second section for provincial sales tax on services, so you can work out everything withheld on a single invoice in one place instead of switching between the Invoice Tax and Provincial Taxes tabs.',
    },
    {
      category: 'WHT',
      question: 'Is withholding tax the same as GST?',
      answer:
        'No. GST is charged on a taxable supply, while withholding tax is deducted by the payer from specified payments. Depending on the transaction, withholding tax may be adjustable against the supplier’s annual income tax.',
    },
    {
      category: 'Provincial Services',
      question: 'When does the provincial sales tax section apply?',
      answer:
        'Only when the invoice includes a taxable service under the relevant provincial authority (PRA, SRB, KPRA, BRA or ICT). Goods-only invoices generally fall outside provincial sales tax and only need the federal section above.',
    },
  ],
  'tax-slabs': [
    {
      category: 'Tax Slabs',
      question: 'How do I read the progressive tax slab table?',
      answer:
        'Each slab shows an income range, a fixed base tax already accumulated from lower slabs, and a marginal rate applied only to the portion of income within that slab. Enter your annual taxable income to see exactly which slab and rate applies to you.',
    },
    {
      category: 'Slab Changes',
      question: 'Do tax slabs change every year?',
      answer:
        'Yes. Slabs, base tax amounts, and rates are revised through the annual Finance Act and can change materially between tax years, so always confirm which tax year applies before comparing figures.',
    },
  ],
  'filer-vs-nonfiler': [
    {
      category: 'Filer vs Non-Filer',
      question: 'Why do filer and non-filer withholding tax rates differ so much?',
      answer:
        'Non-filer rates are set deliberately higher — often 2x to 4x the filer rate — as a compliance incentive under the Income Tax Ordinance 2001. Filers on the Active Taxpayer List (ATL) get the standard rate and, in most cases, an adjustable credit; non-filers usually cannot adjust the extra amount.',
    },
    {
      category: 'Becoming a Filer',
      question: 'How do I become an active filer?',
      answer:
        'File your annual income tax return on the FBR Iris portal. Once processed, your name is added to the Active Taxpayer List (ATL), which you can verify by SMS to 9966 in the format "ATL <CNIC>".',
    },
  ],
  'tax-savings': [
    {
      category: 'Tax Credits',
      question: 'How much can I legally reduce my tax through VPS, donations, and insurance?',
      answer:
        'Under Sections 61 and 62 of the Income Tax Ordinance 2001, eligible Voluntary Pension Scheme (VPS) contributions, approved charitable donations, and qualifying health insurance premiums earn a tax credit, subject to caps such as 20% of taxable income for VPS and 30% for donations.',
    },
    {
      category: 'Eligibility',
      question: 'Do donations need to go through a bank to qualify?',
      answer:
        'Yes. Donations must be made via crossed cheque or another banking channel to an approved Section 61 institution to qualify for the tax credit — cash donations generally do not qualify.',
    },
  ],
  'iris-simulator': [
    {
      category: 'Practice Mode',
      question: 'Does anything I enter here get sent to FBR?',
      answer:
        'No. This simulator is completely independent of FBR and the real IRIS portal. Nothing you enter is filed, saved to a government system, or transmitted anywhere near FBR — it exists purely so you can practice the flow and see how your numbers work through the form before using the real portal.',
    },
    {
      category: 'Accuracy',
      question: 'Can I use the numbers from this simulator as my actual return?',
      answer:
        'Treat it as practice only. The simulator mirrors the real IRIS return\'s structure and line items, but your actual filing should always be done and verified on the official FBR IRIS portal at iris.fbr.gov.pk.',
    },
  ],
};
