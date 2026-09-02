import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Province } from '../types/provincialTax';
import { PROVINCES_CONFIG, PROFESSIONAL_TAX_SLABS } from '../data/provincialTaxData';
import { formatPKR } from '../utils/taxCalculator';

export const ProvincialProfessionalTaxCalculator: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province>('punjab');
  const [profTaxCategory, setProfTaxCategory] = useState<'salaried' | 'business' | 'company'>('salaried');
  const [monthlyGrossSalary, setMonthlyGrossSalary] = useState<number>(250000);

  const provinceConfig = PROVINCES_CONFIG[selectedProvince];
  const profSlabs = PROFESSIONAL_TAX_SLABS[selectedProvince] || PROFESSIONAL_TAX_SLABS.punjab;
  const categorySlabs = profSlabs.filter((s) => s.category === profTaxCategory);

  const calculateProfessionalTax = () => {
    const annualIncome = monthlyGrossSalary * 12;
    let totalTax = 0;
    let appliedSlab = null;

    for (const slab of categorySlabs) {
      if (annualIncome >= slab.minIncome) {
        if (slab.maxIncome === null || annualIncome <= slab.maxIncome) {
          totalTax = slab.baseTax + (annualIncome - slab.minIncome) * slab.rate;
          appliedSlab = slab;
          break;
        }
      }
    }

    return {
      monthlyGrossSalary,
      annualIncome,
      totalTax,
      monthlyTax: Math.round(totalTax / 12),
      appliedSlab,
    };
  };

  const result = calculateProfessionalTax();

  return (
    <div className="space-y-6">
      {/* Province Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          Professional Tax Calculator
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(PROVINCES_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedProvince(key as Province)}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                selectedProvince === key
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {config.authority}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Professional Income Details</h3>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Professional Category:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setProfTaxCategory('salaried')}
                className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                  profTaxCategory === 'salaried'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Salaried
              </button>
              <button
                onClick={() => setProfTaxCategory('business')}
                className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                  profTaxCategory === 'business'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => setProfTaxCategory('company')}
                className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                  profTaxCategory === 'company'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Company
              </button>
            </div>
          </div>

          {/* Monthly Salary Input */}
          <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-800 block">
                  Enter income
                </label>
                <div className="mt-1 text-sm font-bold text-slate-800">Monthly Gross Income (PKR)</div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                {formatPKR(monthlyGrossSalary)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-black text-sm">PKR</span>
              <input
                type="number"
                min="0"
                step="10000"
                value={monthlyGrossSalary || ''}
                onChange={(e) => setMonthlyGrossSalary(Math.max(0, Number(e.target.value)))}
                placeholder="250,000"
                className="w-full pl-14 pr-3 py-3.5 bg-white border-2 border-emerald-300 rounded-xl text-lg font-black text-slate-900 font-mono focus:bg-white focus:ring-4 focus:ring-emerald-200 focus:border-emerald-600 text-right shadow-sm"
              />
            </div>
          </div>

          {/* Annual Income Display */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="text-xs font-bold text-emerald-900 mb-2">Annual Gross Income:</div>
            <div className="text-2xl font-black font-mono text-emerald-800">{formatPKR(result.annualIncome)}</div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Tax Calculation Result</h3>

          {/* Annual Tax */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Annual Professional Tax ({provinceConfig.authority})
            </span>
            <div className="text-3xl font-black font-mono text-white">{formatPKR(result.totalTax)}</div>
          </div>

          {/* Monthly Tax */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-blue-900 uppercase block">Monthly Tax</div>
              <div className="text-lg font-bold text-blue-900 font-mono">{formatPKR(result.monthlyTax)}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-slate-700 uppercase block">Tax Category</div>
              <div className="text-sm font-bold text-slate-900 capitalize">{profTaxCategory}</div>
            </div>
          </div>

          {/* Slab Information */}
          {result.appliedSlab && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
              <div className="font-bold text-slate-900 mb-2">Applied Tax Slab:</div>
              <div className="space-y-1">
                <p>
                  <strong>Income Range:</strong> {formatPKR(result.appliedSlab.minIncome)} to{' '}
                  {result.appliedSlab.maxIncome ? formatPKR(result.appliedSlab.maxIncome) : 'No limit'}
                </p>
                <p>
                  <strong>Base Tax:</strong> {formatPKR(result.appliedSlab.baseTax)}
                </p>
                <p>
                  <strong>Rate on Excess:</strong> {(result.appliedSlab.rate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
            <p className="leading-relaxed">
              Professional tax is levied on salaried employees, business owners, and companies by provincial authorities.
              Rates and slabs vary significantly by province and professional category.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
