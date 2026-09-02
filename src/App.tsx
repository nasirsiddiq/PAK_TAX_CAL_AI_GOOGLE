import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { PayslipTaxCertificateModal } from './components/PayslipTaxCertificateModal';
// Each tax calculator tab is code-split so the browser only downloads the
// calculator the visitor is actually looking at, instead of all of them
// up front on first load.
const SalaryTaxCalculator = lazy(() => import('./components/SalaryTaxCalculator').then((m) => ({ default: m.SalaryTaxCalculator })));
const InvoiceTaxCalculator = lazy(() => import('./components/InvoiceTaxCalculator').then((m) => ({ default: m.InvoiceTaxCalculator })));
const InvoiceWithholdingAllInOne = lazy(() => import('./components/InvoiceWithholdingAllInOne'));
const ProvincialTaxCalculator = lazy(() => import('./components/ProvincialTaxCalculator').then((m) => ({ default: m.ProvincialTaxCalculator })));
const SpecializedCalculators = lazy(() => import('./components/SpecializedCalculators').then((m) => ({ default: m.SpecializedCalculators })));
const PtaMobileTaxCalculator = lazy(() => import('./components/PtaMobileTaxCalculator').then((m) => ({ default: m.PtaMobileTaxCalculator })));
const TaxFaqSection = lazy(() => import('./components/TaxFaqSection').then((m) => ({ default: m.TaxFaqSection })));
const ZakatCalculator = lazy(() => import('./components/ZakatCalculator'));
const CalculationHistory = lazy(() => import('./components/CalculationHistory'));
const ReverseTaxCalculator = lazy(() => import('./components/ReverseTaxCalculator').then((m) => ({ default: m.ReverseTaxCalculator })));
const TaxSlabsViewer = lazy(() => import('./components/TaxSlabsViewer').then((m) => ({ default: m.TaxSlabsViewer })));
const FilerVsNonFilerMatrix = lazy(() => import('./components/FilerVsNonFilerMatrix').then((m) => ({ default: m.FilerVsNonFilerMatrix })));
const TaxSavingsOptimizer = lazy(() => import('./components/TaxSavingsOptimizer').then((m) => ({ default: m.TaxSavingsOptimizer })));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const FeedbackPage = lazy(() => import('./components/FeedbackPage'));
import { TaxpayerCategory, TaxYear } from './types/tax';
import { calculateIncomeTax } from './utils/taxCalculator';
import { buildCalculatorUrl, getTabFromPathname, type AppTab } from './utils/subdomainRoutes';
import { exportToPDF } from './utils/pdfExport';
import { Landmark, ShieldCheck, Heart, Printer, Download } from 'lucide-react';

const PAGE_SEO: Record<AppTab, { title: string; description: string; keywords: string }> = {
  calculator: {
    title: 'Pakistan Salary Tax Calculator 2025-26 | FBR Income Tax',
    description: 'Calculate Pakistan salary income tax, monthly tax deduction, annual tax liability, and take-home salary under FBR tax slabs.',
    keywords: 'Pakistan income tax calculator, salary tax calculator Pakistan, FBR tax calculator, tax slabs 2025-26, monthly salary tax, take home salary Pakistan',
  },
  reverse: {
    title: 'Pakistan Net to Gross Salary Calculator | FBR Tax',
    description: 'Calculate the gross salary required for your target net salary after Pakistan income tax deductions.',
    keywords: 'net to gross salary calculator Pakistan, reverse tax calculator, take home salary calculator Pakistan, FBR salary tax',
  },
  'invoice-tax': {
    title: 'Pakistan Invoice Tax Calculator | GST and WHT',
    description: 'Calculate Pakistan GST and withholding tax on invoices and payments using current FBR tax rules.',
    keywords: 'Pakistan GST calculator, withholding tax calculator Pakistan, WHT calculator, invoice tax calculator, sales tax on invoice, FBR withholding tax rates',
  },
  provincial: {
    title: 'Pakistan Provincial Tax Calculator | PRA, SRB, KPRA, BRA, ICT',
    description: 'Calculate provincial services tax, withholding tax, agricultural tax, property transfer tax, vehicle token tax, and professional tax in Pakistan.',
    keywords: 'provincial tax calculator Pakistan, PRA sales tax, SRB sales tax, KPRA tax, BRA tax, ICT services tax, Punjab tax calculator',
  },
  specialized: {
    title: 'Pakistan Property, Vehicle and IT Export Tax Calculators',
    description: 'Calculate Pakistan property transfer tax, vehicle registration tax, and IT or freelancer export tax.',
    keywords: 'Pakistan property tax calculator, vehicle registration tax, IT export tax Pakistan, freelancer tax calculator, Section 236K, Section 231B, Section 154A',
  },
  'property-valuation': {
    title: 'FBR Property Valuation Calculator | Pakistan Locality Rates',
    description: 'Calculate property transfer advance tax and FBR/DC valuation using city and locality rates.',
    keywords: 'FBR property valuation, DC rate calculator Pakistan, property valuation by city, FBR immovable property valuation, Section 236K, Section 236C',
  },
  'vehicle-registration': {
    title: 'Pakistan Vehicle Registration Tax Calculator | Section 231B',
    description: 'Calculate Pakistan vehicle registration advance tax under Section 231B.',
    keywords: 'vehicle registration tax Pakistan, Section 231B calculator, car registration tax Pakistan, FBR vehicle advance tax',
  },
  'it-export-tax': {
    title: 'Pakistan IT Export Tax Calculator | Section 154A',
    description: 'Calculate tax on Pakistan IT and freelancer export remittances under Section 154A.',
    keywords: 'IT export tax Pakistan, freelancer tax calculator Pakistan, Section 154A, PSEB tax rate, software export tax Pakistan, IT remittance tax',
  },
  'pta-mobile-tax': {
    title: 'PTA Mobile Registration Tax Calculator | Pakistan',
    description: 'Estimate PTA and customs registration taxes for imported mobile phones using CNIC or passport registration.',
    keywords: 'PTA tax calculator, mobile registration tax Pakistan, DIRBS tax, FBR mobile duty, phone tax Pakistan, IMEI registration tax, passport CNIC mobile tax',
  },
  zakat: {
    title: 'Pakistan Zakat Calculator | Nisab and Hawl',
    description: 'Calculate Zakat due in Pakistan using your assets, debt, Nisab threshold, and Hawl date.',
    keywords: 'Zakat calculator Pakistan, Nisab calculator, Zakat on gold Pakistan, Zakat on cash, Hawl date calculator',
  },
  history: {
    title: 'Pakistan Tax Calculation History',
    description: 'Review saved Pakistan tax calculations and reusable calculation templates.',
    keywords: 'Pakistan tax calculation history, saved tax calculations',
  },
  'agricultural-tax': {
    title: 'Pakistan Agricultural Income Tax Calculator',
    description: 'Calculate provincial agricultural income tax in Pakistan by land area or annual agricultural income.',
    keywords: 'agricultural income tax Pakistan, farm tax calculator Pakistan, Punjab agricultural tax, agricultural land tax',
  },
  'property-stamp-duty': {
    title: 'Pakistan Property Stamp Duty and CVT Calculator',
    description: 'Calculate provincial stamp duty, CVT, registration costs, and property transfer taxes in Pakistan.',
    keywords: 'property stamp duty calculator Pakistan, CVT calculator, property registration fee Pakistan, property transfer tax',
  },
  'vehicle-token-tax': {
    title: 'Pakistan Vehicle Token Tax Calculator',
    description: 'Calculate provincial vehicle token tax for cars and other vehicles in Pakistan.',
    keywords: 'vehicle token tax calculator Pakistan, car token tax, excise token tax Pakistan',
  },
  'professional-tax': {
    title: 'Pakistan Professional Tax Calculator',
    description: 'Calculate provincial professional tax in Pakistan for salaried individuals, businesses, and companies.',
    keywords: 'professional tax calculator Pakistan, Punjab professional tax, provincial professional tax',
  },
  'invoice-withholding': {
    title: 'Invoice Withholding Calculator | All in One | GST and WHT',
    description: 'Calculate Section 153 income tax withholding, GST, and optional provincial sales tax on services on a single invoice, all in one place.',
    keywords: 'invoice withholding calculator Pakistan, all in one withholding calculator, Section 153 calculator, GST and WHT calculator, provincial sales tax withholding',
  },
  'tax-slabs': {
    title: 'Pakistan FBR Income Tax Slabs 2025-26',
    description: 'View and compare official FBR income tax slabs for salaried and non-salaried individuals across recent tax years.',
    keywords: 'FBR tax slabs, Pakistan income tax slabs 2025-26, salaried tax slabs, non-salaried tax slabs, tax bracket Pakistan',
  },
  'filer-vs-nonfiler': {
    title: 'Filer vs Non-Filer Withholding Tax Rates Pakistan',
    description: 'Compare active taxpayer (filer) and non-filer withholding tax rates in Pakistan across property, vehicles, banking and investments.',
    keywords: 'filer vs non-filer Pakistan, ATL rates, non-filer tax rate, active taxpayer list, withholding tax matrix Pakistan',
  },
  'tax-savings': {
    title: 'Pakistan Tax Savings and Deductions Optimizer',
    description: 'See how VPS pension contributions, charitable donations, and health insurance legally reduce your Pakistan income tax liability.',
    keywords: 'tax savings calculator Pakistan, VPS pension tax credit, Section 61 donations, Section 62 tax credit, reduce income tax Pakistan',
  },
  about: {
    title: 'About Us | Pak Tax Calculator',
    description: 'Learn about paktaxcalculator.net, a free independent tool for estimating Pakistan income tax, GST, withholding tax and provincial taxes.',
    keywords: 'about pak tax calculator, Pakistan tax calculator website',
  },
  contact: {
    title: 'Contact Us | Pak Tax Calculator',
    description: 'Get in touch with paktaxcalculator.net about corrections, partnerships, media enquiries or general questions.',
    keywords: 'contact pak tax calculator, Pakistan tax calculator contact',
  },
  privacy: {
    title: 'Privacy Policy | Pak Tax Calculator',
    description: 'Read the privacy policy for paktaxcalculator.net, including what data is and is not collected when you use the calculators.',
    keywords: 'privacy policy pak tax calculator, Pakistan tax calculator privacy',
  },
  feedback: {
    title: 'Feedback | Pak Tax Calculator',
    description: 'Report an outdated tax rate, a bug, or suggest a new calculator for paktaxcalculator.net.',
    keywords: 'feedback pak tax calculator, report tax rate error, suggest calculator',
  },
};

// Plain informational pages — no calculator to print/export as PDF, and no
// tax FAQ relevant to show underneath them.
const CONTENT_PAGE_TABS = new Set<AppTab>(['about', 'contact', 'privacy', 'feedback']);

function setMetaTag(attribute: 'name' | 'property', value: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

function CalculatorLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <span className="text-sm font-semibold">Loading calculator&hellip;</span>
      </div>
    </div>
  );
}

function setCalculatorStructuredData(title: string, description: string, url: string) {
  let element = document.getElementById('calculator-structured-data') as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement('script');
    element.id = 'calculator-structured-data';
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(() => getTabFromPathname(window.location.pathname));
  const [taxYear, setTaxYear] = useState<TaxYear>('2025-2026');
  const [taxpayerCategory, setTaxpayerCategory] = useState<TaxpayerCategory>('salaried');
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [openAuthAsSignUp, setOpenAuthAsSignUp] = useState(false);

  useEffect(() => {
    const nextUrl = buildCalculatorUrl(activeTab, window.location);
    const nextPathname = new URL(nextUrl).pathname;
    const isProvincialSubpage = activeTab === 'provincial' && /^\/sales-tax-(punjab|sindh|kpk|balochistan|ict)(\.html)?$/.test(window.location.pathname);
    if (window.location.pathname !== nextPathname && !isProvincialSubpage) {
      window.history.pushState({}, '', nextUrl);
    }

    const syncTabWithBrowserHistory = () => setActiveTab(getTabFromPathname(window.location.pathname));
    window.addEventListener('popstate', syncTabWithBrowserHistory);
    return () => window.removeEventListener('popstate', syncTabWithBrowserHistory);
  }, [activeTab]);

  useEffect(() => {
    const seo = PAGE_SEO[activeTab];
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    document.title = seo.title;
    setMetaTag('name', 'description', seo.description);
    setMetaTag('name', 'keywords', seo.keywords);
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    setCalculatorStructuredData(seo.title, seo.description, canonicalUrl);
  }, [activeTab]);

  const handlePrintPage = () => {
    window.print();
  };

  const navigateToCalculator = (tab: AppTab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const quickLinks = activeTab === 'zakat'
    ? [
        { tab: 'calculator' as const, label: 'Income Tax', prompt: 'Estimate your income tax', tone: 'emerald' },
        { tab: 'property-valuation' as const, label: 'Property Value', prompt: 'Check an FBR property value', tone: 'sky' },
      ]
    : activeTab === 'property-valuation'
      ? [
          { tab: 'zakat' as const, label: 'Check Zakat', prompt: 'Calculate your Zakat due', tone: 'emerald' },
          { tab: 'invoice-tax' as const, label: 'Invoice Tax', prompt: 'Check GST or WHT on an invoice', tone: 'sky' },
        ]
      : activeTab === 'vehicle-registration'
        ? [
            { tab: 'calculator' as const, label: 'Income Tax', prompt: 'Estimate your income tax', tone: 'emerald' },
            { tab: 'it-export-tax' as const, label: 'IT Export Tax', prompt: 'Calculate export tax', tone: 'sky' },
          ]
        : activeTab === 'it-export-tax'
          ? [
              { tab: 'calculator' as const, label: 'Income Tax', prompt: 'Estimate your income tax', tone: 'emerald' },
              { tab: 'invoice-tax' as const, label: 'Invoice Tax', prompt: 'Check GST or WHT on an invoice', tone: 'sky' },
            ]
          : [
              { tab: 'zakat' as const, label: 'Check Zakat', prompt: 'Calculate your Zakat due', tone: 'emerald' },
              { tab: 'property-valuation' as const, label: 'Property Value', prompt: 'Check an FBR property value', tone: 'sky' },
            ];

  const handleSavePdf = async () => {
    try {
      await exportToPDF('pak-tax-page-content', {
        filename: `${activeTab}-report.pdf`,
        title: `${activeTab.toUpperCase()} Calculator Report`,
        calculationType: activeTab,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Unable to save PDF from this page right now.');
    }
  };

  // Reference quick summary values for modal
  const referenceCalc = calculateIncomeTax({
    taxYear,
    taxpayerCategory,
    period: 'monthly',
    input: {
      period: 'monthly',
      grossSalary: 150000,
      useDetailedBreakdown: false,
      basicSalary: 90000,
      houseRentAllowance: 35000,
      medicalAllowance: 15000,
      isMedicalExemptAuto: true,
      conveyanceAllowance: 10000,
      specialAllowance: 0,
      bonus: 0,
      commission: 0,
      otherIncome: 0,
      charitableDonationsSec61: 0,
      vpsPensionContributionSec62: 0,
      healthInsuranceSec62A: 0,
      educationalExpensesSec60D: 0,
      advanceTaxDeducted: 0,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taxYear={taxYear}
        setTaxYear={setTaxYear}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        onOpenAuth={() => { setOpenAuthAsSignUp(false); setIsAuthModalOpen(true); }}
        onOpenSignUp={() => { setOpenAuthAsSignUp(true); setIsAuthModalOpen(true); }}
      />

      {/* Main Content Area */}
      <main id="pak-tax-page-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:py-8 sm:pb-32 space-y-8 print:shadow-none">
        {activeTab !== 'provincial' && !CONTENT_PAGE_TABS.has(activeTab) && <div className="flex justify-end gap-3 print:hidden">
          <button
            onClick={handlePrintPage}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleSavePdf}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Save PDF
          </button>
        </div>}

        <div id="active-calculator-content">
        <Suspense fallback={<CalculatorLoadingFallback />}>
        {activeTab === 'calculator' && (
          <SalaryTaxCalculator
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxpayerCategory={taxpayerCategory}
            setTaxpayerCategory={setTaxpayerCategory}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
          />
        )}

        {activeTab === 'provincial' && <ProvincialTaxCalculator onPrint={handlePrintPage} onSavePdf={handleSavePdf} onOpenAuth={() => setIsAuthModalOpen(true)} />}

        {activeTab === 'agricultural-tax' && <ProvincialTaxCalculator initialModule="agricultural-tax" showModuleSelector={false} />}

        {activeTab === 'property-stamp-duty' && <ProvincialTaxCalculator initialModule="property-stamp-duty" showModuleSelector={false} />}

        {activeTab === 'vehicle-token-tax' && <ProvincialTaxCalculator initialModule="vehicle-token-tax" showModuleSelector={false} />}

        {activeTab === 'professional-tax' && <ProvincialTaxCalculator initialModule="professional-tax" showModuleSelector={false} />}

        {activeTab === 'invoice-tax' && <InvoiceTaxCalculator onPrint={handlePrintPage} onSavePdf={handleSavePdf} />}

        {activeTab === 'invoice-withholding' && <InvoiceWithholdingAllInOne onPrint={handlePrintPage} onSavePdf={handleSavePdf} />}

        {activeTab === 'reverse' && (
          <ReverseTaxCalculator
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxpayerCategory={taxpayerCategory}
            setTaxpayerCategory={setTaxpayerCategory}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
          />
        )}

        {activeTab === 'tax-slabs' && (
          <TaxSlabsViewer
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxpayerCategory={taxpayerCategory}
            setTaxpayerCategory={setTaxpayerCategory}
          />
        )}

        {activeTab === 'filer-vs-nonfiler' && <FilerVsNonFilerMatrix />}

        {activeTab === 'tax-savings' && <TaxSavingsOptimizer taxYear={taxYear} taxpayerCategory={taxpayerCategory} />}

        {activeTab === 'zakat' && <ZakatCalculator />}

        {activeTab === 'history' && <CalculationHistory />}

        {activeTab === 'specialized' && <SpecializedCalculators />}

        {activeTab === 'property-valuation' && <SpecializedCalculators initialTab="property" />}

        {activeTab === 'vehicle-registration' && <SpecializedCalculators initialTab="vehicle" />}

        {activeTab === 'it-export-tax' && <SpecializedCalculators initialTab="it-export" />}

        {activeTab === 'pta-mobile-tax' && <PtaMobileTaxCalculator />}

        {activeTab === 'about' && <AboutPage onNavigate={navigateToCalculator} />}

        {activeTab === 'contact' && <ContactPage onNavigate={navigateToCalculator} />}

        {activeTab === 'privacy' && <PrivacyPage onNavigate={navigateToCalculator} />}

        {activeTab === 'feedback' && <FeedbackPage onNavigate={navigateToCalculator} />}
        </Suspense>
        </div>

        {/* Global Compliance & FAQ Section — skipped on plain content pages, which have no relevant tax FAQ */}
        {!CONTENT_PAGE_TABS.has(activeTab) && (
          <Suspense fallback={null}>
            <TaxFaqSection activeTab={activeTab} />
          </Suspense>
        )}
      </main>

      {/* Printable Salary Slip / Tax Certificate Modal */}
      <PayslipTaxCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        taxYear={taxYear}
        taxpayerCategory={taxpayerCategory}
        monthlyGross={referenceCalc.grossSalaryMonthly}
        monthlyTax={referenceCalc.netTaxMonthly}
        monthlyTakeHome={referenceCalc.netTakeHomeMonthly}
        annualGross={referenceCalc.grossSalaryAnnual}
        annualTax={referenceCalc.netTaxAnnual}
        taxableIncomeAnnual={referenceCalc.taxableIncomeAnnual}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialSignUp={openAuthAsSignUp}
      />

      <aside className="fixed bottom-4 right-4 z-30 w-[calc(100%-2rem)] max-w-xl rounded-xl border border-emerald-200 bg-white/95 p-3 shadow-lg backdrop-blur xl:hidden print:hidden" aria-label="Quick calculator links">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-700">Open another calculator:</p>
          <div className="flex gap-2">
            {quickLinks.map((link) => <button key={link.tab} onClick={() => navigateToCalculator(link.tab)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer sm:flex-none ${link.tone === 'emerald' ? 'bg-emerald-800 text-white hover:bg-emerald-700' : 'border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'}`}>{link.label}</button>)}
          </div>
        </div>
      </aside>

      <aside className="fixed left-4 top-1/2 z-30 hidden w-32 -translate-y-1/2 xl:block print:hidden" aria-label="Related calculator link">
        <button onClick={() => navigateToCalculator(quickLinks[0].tab)} className="w-full rounded-xl border border-emerald-300 bg-white p-3 text-left shadow-lg transition hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">{quickLinks[0].label}</span>
          <span className="mt-1 block text-sm font-extrabold leading-snug text-slate-900">{quickLinks[0].prompt}</span>
          <span className="mt-3 block text-xs font-bold text-emerald-800">Open calculator →</span>
        </button>
      </aside>

      <aside className="fixed right-4 top-1/2 z-30 hidden w-32 -translate-y-1/2 xl:block print:hidden" aria-label="Related calculator link">
        <button onClick={() => navigateToCalculator(quickLinks[1].tab)} className="w-full rounded-xl border border-sky-300 bg-white p-3 text-left shadow-lg transition hover:border-sky-500 hover:bg-sky-50 cursor-pointer">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-700">{quickLinks[1].label}</span>
          <span className="mt-1 block text-sm font-extrabold leading-snug text-slate-900">{quickLinks[1].prompt}</span>
          <span className="mt-3 block text-xs font-bold text-sky-800">Open calculator →</span>
        </button>
      </aside>

      <div className="bg-[#dfeee5] border-t border-emerald-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_220px] gap-6 items-start">
            <button onClick={() => navigateToCalculator('zakat')} className="rounded-2xl border border-emerald-200 bg-white/40 p-4 text-left shadow-sm transition hover:border-emerald-400 hover:bg-white/70 hover:shadow-md cursor-pointer">
              <div className="text-3xl mb-4">☾</div>
              <p className="text-[15px] font-semibold leading-relaxed text-slate-700">
                Zakat due this year? Track it in minutes.
              </p>
              <span className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-emerald-700 bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
                Zakat Calculator <span aria-hidden="true">→</span>
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-800">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide mb-4 text-slate-800">Federal Taxes</h3>
                <ul className="space-y-2 text-[15px] text-slate-700">
                  <li><button onClick={() => navigateToCalculator('invoice-tax')} className="hover:text-emerald-800 transition-colors">Invoice Tax (GST / WHT)</button></li>
                  <li><button onClick={() => navigateToCalculator('invoice-withholding')} className="hover:text-emerald-800 transition-colors">Invoice Withholding (All in One)</button></li>
                  <li><button onClick={() => navigateToCalculator('calculator')} className="hover:text-emerald-800 transition-colors">Income Tax</button></li>
                  <li><button onClick={() => navigateToCalculator('property-valuation')} className="hover:text-emerald-800 transition-colors">FBR Property Valuation</button></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-wide mb-4 text-slate-800">Provincial Sales Tax</h3>
                <ul className="space-y-2 text-[15px] text-slate-700">
                  <li><button onClick={() => setActiveTab('provincial')} className="hover:text-emerald-800 transition-colors">Punjab (PRA)</button></li>
                  <li><button onClick={() => setActiveTab('provincial')} className="hover:text-emerald-800 transition-colors">Sindh (SRB)</button></li>
                  <li><button onClick={() => setActiveTab('provincial')} className="hover:text-emerald-800 transition-colors">Khyber Pakhtunkhwa (KPRA)</button></li>
                  <li><button onClick={() => setActiveTab('provincial')} className="hover:text-emerald-800 transition-colors">Balochistan (BRA)</button></li>
                  <li><button onClick={() => setActiveTab('provincial')} className="hover:text-emerald-800 transition-colors">Islamabad (ICT)</button></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-wide mb-4 text-slate-800">Other Tools</h3>
                <ul className="space-y-2 text-[15px] text-slate-700">
                  <li><button onClick={() => navigateToCalculator('reverse')} className="hover:text-emerald-800 transition-colors">Net to Gross Calculator</button></li>
                  <li><button onClick={() => navigateToCalculator('tax-slabs')} className="hover:text-emerald-800 transition-colors">FBR Tax Slabs</button></li>
                  <li><button onClick={() => navigateToCalculator('filer-vs-nonfiler')} className="hover:text-emerald-800 transition-colors">Filer vs Non-Filer Rates</button></li>
                  <li><button onClick={() => navigateToCalculator('tax-savings')} className="hover:text-emerald-800 transition-colors">Tax Savings Optimizer</button></li>
                  <li><button onClick={() => setActiveTab('zakat')} className="hover:text-emerald-800 transition-colors">Zakat Calculator</button></li>
                  <li><button onClick={() => setActiveTab('specialized')} className="hover:text-emerald-800 transition-colors">Apna Ghar Calculator</button></li>
                  <li><button onClick={() => setActiveTab('history')} className="hover:text-emerald-800 transition-colors">My Account</button></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-wide mb-4 text-slate-800">Company</h3>
                <ul className="space-y-2 text-[15px] text-slate-700">
                  <li><button onClick={() => setActiveTab('calculator')} className="hover:text-emerald-800 transition-colors">Home</button></li>
                  <li><button onClick={() => navigateToCalculator('about')} className="hover:text-emerald-800 transition-colors">About Us</button></li>
                  <li><button onClick={() => navigateToCalculator('feedback')} className="hover:text-emerald-800 transition-colors">Feedback</button></li>
                  <li><button onClick={() => navigateToCalculator('contact')} className="hover:text-emerald-800 transition-colors">Contact</button></li>
                  <li><button onClick={() => navigateToCalculator('privacy')} className="hover:text-emerald-800 transition-colors">Privacy Policy</button></li>
                </ul>
              </div>
            </div>

            <button onClick={() => navigateToCalculator('property-valuation')} className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-left shadow-sm transition hover:border-sky-400 hover:bg-white hover:shadow-md cursor-pointer">
              <div className="text-3xl mb-4">⌂</div>
              <p className="text-[15px] font-semibold leading-relaxed text-slate-700">
                Check the official FBR rate for your property locality.
              </p>
              <span className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-sky-700 bg-sky-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
                Property Valuation <span aria-hidden="true">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-[#dfeee5] border-t border-emerald-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-xl border border-emerald-200 bg-white/40 px-4 py-3 text-[13px] leading-relaxed text-slate-700">
            This site is provided for informational and estimation purposes only and does not constitute legal, financial, or tax advice. Rates are sourced from FBR&apos;s official rate cards, the Finance Act 2025, the Finance Act 2026-27, and provincial revenue authority publications, and reviewed regularly — but always confirm figures with the relevant authority or a qualified tax advisor before filing. See About Us for more.
          </div>
        </div>
      </footer>
    </div>
  );
}
