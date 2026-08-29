import React, { useState } from 'react';
import { Header } from './components/Header';
import { SalaryTaxCalculator } from './components/SalaryTaxCalculator';
import { ReverseTaxCalculator } from './components/ReverseTaxCalculator';
import { ProvincialTaxCalculator } from './components/ProvincialTaxCalculator';
import { TaxSlabsViewer } from './components/TaxSlabsViewer';
import { FilerVsNonFilerMatrix } from './components/FilerVsNonFilerMatrix';
import { SpecializedCalculators } from './components/SpecializedCalculators';
import { TaxSavingsOptimizer } from './components/TaxSavingsOptimizer';
import { PayslipTaxCertificateModal } from './components/PayslipTaxCertificateModal';
import { TaxFaqSection } from './components/TaxFaqSection';
import { TaxpayerCategory, TaxYear } from './types/tax';
import { calculateIncomeTax } from './utils/taxCalculator';
import { Landmark, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'reverse' | 'provincial' | 'slabs' | 'filer-matrix' | 'specialized' | 'optimizer'
  >('calculator');
  const [taxYear, setTaxYear] = useState<TaxYear>('2025-2026');
  const [taxpayerCategory, setTaxpayerCategory] = useState<TaxpayerCategory>('salaried');
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

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
        taxpayerCategory={taxpayerCategory}
        setTaxpayerCategory={setTaxpayerCategory}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Quick Tools Grid Navigation Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Calculator Pages & Tools
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Click any tool below to switch pages instantly
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Page 1</div>
              <div className="text-xs font-bold leading-tight">Salary Tax</div>
            </button>

            <button
              onClick={() => setActiveTab('provincial')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'provincial'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-emerald-700 mb-0.5">Page 2 &bull; New</div>
              <div className="text-xs font-bold leading-tight">Provincial (PRA/SRB)</div>
            </button>

            <button
              onClick={() => setActiveTab('reverse')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'reverse'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Page 3</div>
              <div className="text-xs font-bold leading-tight">Reverse Net-to-Gross</div>
            </button>

            <button
              onClick={() => setActiveTab('specialized')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'specialized'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Page 4</div>
              <div className="text-xs font-bold leading-tight">Property, Car & IT</div>
            </button>

            <button
              onClick={() => setActiveTab('optimizer')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'optimizer'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Page 5</div>
              <div className="text-xs font-bold leading-tight">Tax Savings (VPS)</div>
            </button>

            <button
              onClick={() => setActiveTab('filer-matrix')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'filer-matrix'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Page 6</div>
              <div className="text-xs font-bold leading-tight">Filer vs Non-Filer</div>
            </button>

            <button
              onClick={() => setActiveTab('slabs')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === 'slabs'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Page 7</div>
              <div className="text-xs font-bold leading-tight">FBR Slabs Table</div>
            </button>
          </div>
        </div>

        {activeTab === 'calculator' && (
          <SalaryTaxCalculator
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxpayerCategory={taxpayerCategory}
            setTaxpayerCategory={setTaxpayerCategory}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
            onNavigateToOptimizer={() => setActiveTab('optimizer')}
          />
        )}

        {activeTab === 'provincial' && <ProvincialTaxCalculator />}

        {activeTab === 'reverse' && (
          <ReverseTaxCalculator
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxpayerCategory={taxpayerCategory}
            setTaxpayerCategory={setTaxpayerCategory}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
          />
        )}

        {activeTab === 'slabs' && (
          <TaxSlabsViewer
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxpayerCategory={taxpayerCategory}
            setTaxpayerCategory={setTaxpayerCategory}
          />
        )}

        {activeTab === 'filer-matrix' && <FilerVsNonFilerMatrix />}

        {activeTab === 'specialized' && <SpecializedCalculators />}

        {activeTab === 'optimizer' && (
          <TaxSavingsOptimizer
            taxYear={taxYear}
            taxpayerCategory={taxpayerCategory}
          />
        )}

        {/* Global Compliance & FAQ Section */}
        <TaxFaqSection />
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              🇵🇰
            </div>
            <span className="font-bold text-slate-800">Pak Tax Calculator</span>
            <span>&bull; Accurate FBR Pakistan Tax Engine</span>
          </div>

          <div className="text-center md:text-right max-w-xl text-[11px] text-slate-400">
            Disclaimer: This tool estimates tax liability based on the Pakistan Income Tax Ordinance 2001 and latest Federal Finance Acts. Calculations are for guidance and estimation purposes only. Consult a certified Chartered Accountant or Tax Consultant for official filing advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
