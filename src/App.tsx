import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { PayslipTaxCertificateModal } from './components/PayslipTaxCertificateModal';
import { PageIntroSection } from './components/PageIntroSection';
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
const IrisPracticeSimulator = lazy(() => import('./components/IrisPracticeSimulator'));
import { TaxpayerCategory, TaxYear } from './types/tax';
import { calculateIncomeTax } from './utils/taxCalculator';
import { buildCalculatorUrl, getTabFromPathname, type AppTab } from './utils/subdomainRoutes';
import { exportToPDF } from './utils/pdfExport';
import { Landmark, ShieldCheck, Heart, Printer, Download } from 'lucide-react';
import { PAGE_SEO } from './data/pageSeo';

// Plain informational pages — no calculator to print/export as PDF, and no
// tax FAQ relevant to show underneath them.
const CONTENT_PAGE_TABS = new Set<AppTab>(['about', 'contact', 'privacy', 'feedback']);
// The IRIS simulator is a focused, distraction-free wizard: the site header,
// floating cross-sell widgets, print/PDF buttons and the generic calculator
// FAQ section are all hidden while it's open (see the `isFocusMode` checks
// below), mirroring how the real IRIS portal has its own dedicated header
// with no surrounding site chrome.
const FOCUS_MODE_TABS = new Set<AppTab>(['iris-simulator']);

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
  const [taxYear, setTaxYear] = useState<TaxYear>('2026-2027');
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
    setMetaTag('name', 'robots', seo.noindex ? 'noindex, nofollow' : 'index, follow');
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', `${window.location.origin}${seo.image}`);
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.description);
    setMetaTag('name', 'twitter:image', `${window.location.origin}${seo.image}`);

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

  const isFocusMode = FOCUS_MODE_TABS.has(activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header — hidden in focus mode (e.g. the IRIS simulator) for a distraction-free view */}
      {!isFocusMode && <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taxYear={taxYear}
        setTaxYear={setTaxYear}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        onOpenAuth={() => { setOpenAuthAsSignUp(false); setIsAuthModalOpen(true); }}
        onOpenSignUp={() => { setOpenAuthAsSignUp(true); setIsAuthModalOpen(true); }}
      />}

      {/* Main Content Area */}
      <main id="pak-tax-page-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:py-8 sm:pb-32 space-y-8 print:shadow-none">
        {activeTab !== 'provincial' && !CONTENT_PAGE_TABS.has(activeTab) && !isFocusMode && <div className="flex justify-end gap-3 print:hidden">
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

        {/* Real, visible intro + "how to use" copy for this page — see
            PageIntroSection.tsx for why this exists alongside the FAQ
            section below. */}
        {!CONTENT_PAGE_TABS.has(activeTab) && !isFocusMode && <PageIntroSection activeTab={activeTab} />}

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

        {activeTab === 'iris-simulator' && <IrisPracticeSimulator onExit={() => navigateToCalculator('calculator')} />}
        </Suspense>
        </div>

        {/* Global Compliance & FAQ Section — skipped on plain content pages, which have no relevant tax FAQ */}
        {!CONTENT_PAGE_TABS.has(activeTab) && !isFocusMode && (
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

      {/*
        These three floating widgets are `fixed`, so they stay pinned to the
        viewport and visually sit on top of whatever's scrolled underneath
        them — including the footer once you scroll that far. Without
        `pointer-events-none` on the outer wrapper, clicks anywhere in their
        padding/whitespace (not just on the buttons) get swallowed instead of
        passing through to the footer links behind them. `pointer-events-auto`
        on the actual clickable card/button opts it back in.
      */}
      {!isFocusMode && <aside className="fixed bottom-4 right-4 z-30 w-[calc(100%-2rem)] max-w-xl xl:hidden print:hidden pointer-events-none" aria-label="Quick calculator links">
        <div className="pointer-events-auto rounded-xl border border-emerald-200 bg-white/95 p-3 shadow-lg backdrop-blur flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-700">Open another calculator:</p>
          <div className="flex gap-2">
            {quickLinks.map((link) => <button key={link.tab} onClick={() => navigateToCalculator(link.tab)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer sm:flex-none ${link.tone === 'emerald' ? 'bg-emerald-800 text-white hover:bg-emerald-700' : 'border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'}`}>{link.label}</button>)}
          </div>
        </div>
      </aside>}

      {!isFocusMode && <aside className="fixed left-4 top-1/2 z-30 hidden w-32 -translate-y-1/2 xl:block print:hidden pointer-events-none" aria-label="Related calculator link">
        <button onClick={() => navigateToCalculator(quickLinks[0].tab)} className="pointer-events-auto w-full rounded-xl border border-emerald-300 bg-white p-3 text-left shadow-lg transition hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">{quickLinks[0].label}</span>
          <span className="mt-1 block text-sm font-extrabold leading-snug text-slate-900">{quickLinks[0].prompt}</span>
          <span className="mt-3 block text-xs font-bold text-emerald-800">Open calculator →</span>
        </button>
      </aside>}

      {!isFocusMode && <aside className="fixed right-4 top-1/2 z-30 hidden w-32 -translate-y-1/2 xl:block print:hidden pointer-events-none" aria-label="Related calculator link">
        <button onClick={() => navigateToCalculator(quickLinks[1].tab)} className="pointer-events-auto w-full rounded-xl border border-sky-300 bg-white p-3 text-left shadow-lg transition hover:border-sky-500 hover:bg-sky-50 cursor-pointer">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-700">{quickLinks[1].label}</span>
          <span className="mt-1 block text-sm font-extrabold leading-snug text-slate-900">{quickLinks[1].prompt}</span>
          <span className="mt-3 block text-xs font-bold text-sky-800">Open calculator →</span>
        </button>
      </aside>}

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
                  <li><button onClick={() => navigateToCalculator('iris-simulator')} className="hover:text-emerald-800 transition-colors">IRIS Practice Simulator</button></li>
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
