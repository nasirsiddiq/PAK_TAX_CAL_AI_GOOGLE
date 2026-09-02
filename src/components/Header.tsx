import React, { useEffect, useRef, useState } from 'react';
import { Calculator, Clock, Home, Landmark, LogIn, ShoppingCart, TrendingDown, TrendingUp, UserPlus } from 'lucide-react';
import { TaxYear } from '../types/tax';
import { TAX_YEARS_CONFIG } from '../data/taxSlabs';
import type { AppTab } from '../utils/subdomainRoutes';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  taxYear: TaxYear;
  setTaxYear: (year: TaxYear) => void;
  onOpenCertificate: () => void;
  onOpenAuth: () => void;
  onOpenSignUp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  taxYear,
  setTaxYear,
  onOpenCertificate,
  onOpenAuth,
  onOpenSignUp,
}) => {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > lastScrollY.current;
      const pastThreshold = currentScrollY > 96;

      setHidden(scrolledDown && pastThreshold);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
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

            <button onClick={onOpenAuth} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
            <button onClick={onOpenSignUp} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
              <UserPlus className="h-3.5 w-3.5" />
              Sign Up
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-3.5 -mb-1 flex flex-wrap items-center gap-1.5 pb-1.5" aria-label="Main Navigation">
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
            <span>1. Income Tax</span>
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
            id="tab-property-valuation"
            onClick={() => setActiveTab('property-valuation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'property-valuation'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>3. Property Valuation</span>
          </button>

          <button
            id="tab-vehicle-registration"
            onClick={() => setActiveTab('vehicle-registration')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'vehicle-registration'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>4. Vehicle Registration</span>
          </button>

          <button
            id="tab-it-export-tax"
            onClick={() => setActiveTab('it-export-tax')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'it-export-tax'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>5. IT Export Tax</span>
          </button>

          <button
            id="tab-pta-mobile-tax"
            onClick={() => setActiveTab('pta-mobile-tax')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pta-mobile-tax'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>6. PTA Mobile Tax</span>
          </button>

          <button
            id="tab-invoice-tax"
            onClick={() => setActiveTab('invoice-tax')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'invoice-tax' ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900' : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'}`}
          >
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>7. Invoice Tax (GST / WHT)</span>
          </button>

          <button
            id="tab-zakat"
            onClick={() => setActiveTab('zakat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'zakat' ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900' : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'}`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>9. Zakat Calculator</span>
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'history' ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900' : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'}`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>10. My Account</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
