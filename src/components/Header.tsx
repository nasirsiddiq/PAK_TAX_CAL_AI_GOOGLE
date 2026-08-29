import React from 'react';
import { Calculator, FileText, Landmark, ShieldCheck, TrendingUp, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { TaxYear, TaxpayerCategory } from '../types/tax';
import { TAX_YEARS_CONFIG } from '../data/taxSlabs';

interface HeaderProps {
  activeTab: 'calculator' | 'reverse' | 'provincial' | 'slabs' | 'filer-matrix' | 'specialized' | 'optimizer';
  setActiveTab: (tab: 'calculator' | 'reverse' | 'provincial' | 'slabs' | 'filer-matrix' | 'specialized' | 'optimizer') => void;
  taxYear: TaxYear;
  setTaxYear: (year: TaxYear) => void;
  taxpayerCategory: TaxpayerCategory;
  setTaxpayerCategory: (cat: TaxpayerCategory) => void;
  onOpenCertificate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  taxYear,
  setTaxYear,
  taxpayerCategory,
  setTaxpayerCategory,
  onOpenCertificate,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar with Pakistan Emblem / Official Law Badge */}
      <div className="bg-emerald-900 text-white text-xs px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-700 text-emerald-100 text-[10px] font-bold tracking-wide uppercase">
              FBR Tax Rules
            </span>
            <span className="text-emerald-100">
              Updated as per Federal Board of Revenue & Finance Act Slabs
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-200">
            <span className="hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Client-Side Privacy Guaranteed
            </span>
            <button
              onClick={onOpenCertificate}
              className="inline-flex items-center gap-1 text-white hover:text-emerald-200 font-semibold cursor-pointer underline underline-offset-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Printable Salary Slip / Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Brand & Core Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Pak Tax Calculator
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {TAX_YEARS_CONFIG[taxYear]?.label || 'FY 2025-26'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Official FBR Pakistan Income Tax Liability & Salary Estimator
              </p>
            </div>
          </div>

          {/* Quick Year & Category Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tax Year Select */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <label htmlFor="tax-year-select" className="text-xs font-semibold text-slate-500 px-2">Tax Year:</label>
              <select
                id="tax-year-select"
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value as TaxYear)}
                className="bg-white text-xs font-bold text-slate-800 rounded-md px-2.5 py-1.5 border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="2025-2026">FY 2025-2026 (Tax Year 2026)</option>
                <option value="2024-2025">FY 2024-2025 (Tax Year 2025)</option>
                <option value="2023-2024">FY 2023-2024 (Tax Year 2024)</option>
                <option value="2022-2023">FY 2022-2023 (Tax Year 2023)</option>
              </select>
            </div>

            {/* Taxpayer Category Select */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <label htmlFor="taxpayer-category-select" className="text-xs font-semibold text-slate-500 px-2">Type:</label>
              <select
                id="taxpayer-category-select"
                value={taxpayerCategory}
                onChange={(e) => setTaxpayerCategory(e.target.value as TaxpayerCategory)}
                className="bg-white text-xs font-bold text-slate-800 rounded-md px-2.5 py-1.5 border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="salaried">Salaried Individual (&gt;75% Salary)</option>
                <option value="non_salaried">Business / Non-Salaried</option>
                <option value="aop">AOP (Association of Persons)</option>
                <option value="it_freelance_export">IT / Freelancer Export (Sec 154A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-3.5 -mb-1 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none" aria-label="Main Navigation">
          <button
            id="tab-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>1. Salary Tax</span>
          </button>

          <button
            id="tab-provincial"
            onClick={() => setActiveTab('provincial')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'provincial'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-300/80 hover:bg-emerald-100'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold">2. Provincial Taxes (PRA / SRB / KPRA / BRA)</span>
          </button>

          <button
            id="tab-reverse"
            onClick={() => setActiveTab('reverse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reverse'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-emerald-300" />
            <span>3. Reverse (Net to Gross)</span>
          </button>

          <button
            id="tab-specialized"
            onClick={() => setActiveTab('specialized')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'specialized'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>4. Property, Car & IT Export</span>
          </button>

          <button
            id="tab-optimizer"
            onClick={() => setActiveTab('optimizer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'optimizer'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>5. Tax Savings (VPS)</span>
          </button>

          <button
            id="tab-filer-matrix"
            onClick={() => setActiveTab('filer-matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'filer-matrix'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>6. Filer vs Non-Filer</span>
          </button>

          <button
            id="tab-slabs"
            onClick={() => setActiveTab('slabs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'slabs'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-300" />
            <span>7. FBR Slabs Table</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
