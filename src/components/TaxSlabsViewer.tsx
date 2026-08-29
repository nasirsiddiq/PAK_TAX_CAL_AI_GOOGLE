import React, { useState } from 'react';
import {
  Scale,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TaxpayerCategory, TaxYear } from '../types/tax';
import { TAX_YEARS_CONFIG } from '../data/taxSlabs';
import { formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';

interface TaxSlabsViewerProps {
  taxYear: TaxYear;
  setTaxYear: (year: TaxYear) => void;
  taxpayerCategory: TaxpayerCategory;
  setTaxpayerCategory: (cat: TaxpayerCategory) => void;
}

export const TaxSlabsViewer: React.FC<TaxSlabsViewerProps> = ({
  taxYear,
  setTaxYear,
  taxpayerCategory,
  setTaxpayerCategory,
}) => {
  const [testIncome, setTestIncome] = useState<number>(1800000); // 18 Lakh annual (1.5 Lakh/mo)
  const [showComparison, setShowComparison] = useState<boolean>(true);

  const currentConfig = TAX_YEARS_CONFIG[taxYear] || TAX_YEARS_CONFIG['2025-2026'];
  const slabs =
    taxpayerCategory === 'salaried'
      ? currentConfig.salariedSlabs
      : currentConfig.nonSalariedSlabs;

  // FY 24-25 vs 25-26 comparison config
  const config2425 = TAX_YEARS_CONFIG['2024-2025'];
  const config2526 = TAX_YEARS_CONFIG['2025-2026'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-700/50">
              <Scale className="w-3.5 h-3.5" />
              Official FBR Tax Slabs
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Income Tax Slabs & Rate Structure
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Complete statutory progressive tax brackets enacted by the Federal Board of Revenue (FBR) and Federal Finance Acts.
            </p>
          </div>

          {/* Slabs Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value as TaxYear)}
              className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg border border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="2025-2026">FY 2025-2026 (Tax Year 2026)</option>
              <option value="2024-2025">FY 2024-2025 (Tax Year 2025)</option>
              <option value="2023-2024">FY 2023-2024 (Tax Year 2024)</option>
              <option value="2022-2023">FY 2022-2023 (Tax Year 2023)</option>
            </select>

            <div className="inline-flex bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setTaxpayerCategory('salaried')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  taxpayerCategory === 'salaried'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Salaried
              </button>
              <button
                type="button"
                onClick={() => setTaxpayerCategory('non_salaried')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  taxpayerCategory === 'non_salaried'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Business / Non-Salaried
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Slab Tester Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Interactive Slab Highlighter
            </h3>
            <p className="text-xs text-slate-500">
              Type or adjust annual taxable income to highlight the exact statutory bracket below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                Rs.
              </span>
              <input
                type="number"
                min="0"
                step="50000"
                value={testIncome || ''}
                onChange={(e) => setTestIncome(Math.max(0, Number(e.target.value)))}
                className="w-44 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                placeholder="1,800,000"
              />
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              {formatPakistaniUnits(testIncome)}/yr
            </span>
          </div>
        </div>

        {/* Tax Slabs Table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3.5 w-16">Slab</th>
                <th className="py-2.5 px-3.5">Taxable Income Range (Annual)</th>
                <th className="py-2.5 px-3.5">Fixed Base Tax</th>
                <th className="py-2.5 px-3.5">Tax Rate on Excess</th>
                <th className="py-2.5 px-3.5">Statutory Formula Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slabs.map((slab, index) => {
                const isSelected =
                  testIncome > slab.min && (slab.max === null || testIncome <= slab.max);
                const isZeroRate = slab.rate === 0;

                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600 ring-inset'
                        : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="py-3 px-3.5 font-bold">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      {slab.min === 0 ? 'Up to' : `${formatPKR(slab.min, { showPrefix: false })} — `}{' '}
                      {slab.max !== null ? formatPKR(slab.max) : 'Above'}
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      {slab.baseTax > 0 ? formatPKR(slab.baseTax) : 'Nil (Rs. 0)'}
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isZeroRate
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {(slab.rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {slab.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Surcharge Note */}
        {currentConfig.surchargeThreshold && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">High Income Surcharge:</span> An additional surcharge of{' '}
              <span className="font-bold">10%</span> of income tax applies on individuals and AOPs having taxable income exceeding{' '}
              <span className="font-mono font-bold">Rs. 10,000,000 (1 Crore)</span> per annum.
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison between FY 2024-25 and FY 2025-26 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              FY 2024-2025 vs FY 2025-2026 Salaried Slabs Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Key reforms in the latest Finance Act: 1% starting rate for 600k-1.2M, new brackets, and highest slab threshold raised to Rs. 7 Million.
            </p>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            {showComparison ? 'Hide Comparison' : 'Show Comparison'}
          </button>
        </div>

        {showComparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* FY 2024-25 Slabs */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-800 text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>FY 2024-2025 (Previous Tax Year)</span>
                <span className="text-[10px] text-slate-300">Finance Act 2024</span>
              </div>
              <div className="p-3 space-y-2 bg-slate-50/50">
                {config2425.salariedSlabs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span className="text-slate-700 font-mono">
                      {s.min === 0 ? 'Up to 600k' : s.max ? `${s.min / 100000}L - ${s.max / 100000}L` : `Above ${s.min / 100000}L`}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {s.baseTax > 0 ? `Rs. ${s.baseTax.toLocaleString()} + ` : ''}{(s.rate * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FY 2025-26 Slabs */}
            <div className="border border-emerald-300 rounded-xl overflow-hidden text-xs shadow-2xs">
              <div className="bg-emerald-800 text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>FY 2025-2026 (Current Tax Year)</span>
                <span className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded text-emerald-100 font-bold">Relief Slabs</span>
              </div>
              <div className="p-3 space-y-2 bg-emerald-50/40">
                {config2526.salariedSlabs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-emerald-100 last:border-0">
                    <span className="text-emerald-950 font-mono font-medium">
                      {s.min === 0 ? 'Up to 600k' : s.max ? `${s.min / 100000}L - ${s.max / 100000}L` : `Above ${s.min / 100000}L`}
                    </span>
                    <span className="font-bold text-emerald-900 font-mono">
                      {s.baseTax > 0 ? `Rs. ${s.baseTax.toLocaleString()} + ` : ''}{(s.rate * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
