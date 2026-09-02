import React, { useState } from 'react';
import { Wheat, Landmark } from 'lucide-react';
import { Province } from '../types/provincialTax';
import {
  PROVINCES_CONFIG,
  AGRI_LAND_SLABS,
  AGRI_INCOME_SLABS,
} from '../data/provincialTaxData';
import { formatPKR, formatPakistaniUnits } from '../utils/taxCalculator';

export const ProvincialAgriculturalTaxCalculator: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province>('punjab');
  const [agriAssessmentMode, setAgriAssessmentMode] = useState<'acreage' | 'income'>('acreage');
  const [landAcres, setLandAcres] = useState<number>(35);
  const [landType, setLandType] = useState<'irrigated' | 'barani'>('irrigated');
  const [agriAnnualIncome, setAgriAnnualIncome] = useState<number>(2500000);
  const [agriExpenses, setAgriExpenses] = useState<number>(800000);

  const provinceConfig = PROVINCES_CONFIG[selectedProvince];

  const calculateAgriTax = () => {
    if (agriAssessmentMode === 'acreage') {
      const landSlabs = AGRI_LAND_SLABS[selectedProvince] || AGRI_LAND_SLABS.punjab;
      let totalLandTax = 0;

      for (const slab of landSlabs) {
        if (landAcres > slab.minAcres) {
          const taxableAcresInSlab = slab.maxAcres
            ? Math.min(landAcres, slab.maxAcres) - slab.minAcres
            : landAcres - slab.minAcres;
          const slabRate = landType === 'irrigated' ? slab.ratePerAcreIrrigated : slab.ratePerAcreBarani;
          totalLandTax += taxableAcresInSlab * slabRate;
        }
      }

      return {
        mode: 'acreage',
        totalTax: totalLandTax,
        rateDesc: `Land holding of ${landAcres} acres (${landType === 'irrigated' ? 'Irrigated / Canal' : 'Barani / Rain-fed'})`,
      };
    } else {
      const netTaxableAgriIncome = Math.max(0, agriAnnualIncome - agriExpenses);
      const incomeSlabs = AGRI_INCOME_SLABS[selectedProvince] || AGRI_INCOME_SLABS.punjab;
      let totalIncomeTax = 0;
      let activeSlabDesc = '';

      for (const slab of incomeSlabs) {
        if (netTaxableAgriIncome > slab.minIncome) {
          if (slab.maxIncome === null || netTaxableAgriIncome <= slab.maxIncome) {
            const excess = netTaxableAgriIncome - slab.minIncome;
            totalIncomeTax = slab.baseTax + excess * slab.rate;
            activeSlabDesc = slab.description;
            break;
          }
        }
      }

      return {
        mode: 'income',
        totalTax: totalIncomeTax,
        netTaxableIncome: netTaxableAgriIncome,
        rateDesc: activeSlabDesc,
      };
    }
  };

  const agriResult = calculateAgriTax();

  return (
    <div className="space-y-6">
      {/* Province Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Wheat className="w-5 h-5 text-emerald-600" />
          Agricultural Income Tax Calculator
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

      {/* Assessment Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900">Assessment Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAgriAssessmentMode('acreage')}
            className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${
              agriAssessmentMode === 'acreage'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Land Acreage Basis
          </button>
          <button
            onClick={() => setAgriAssessmentMode('income')}
            className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${
              agriAssessmentMode === 'income'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Net Income Basis
          </button>
        </div>
      </div>

      {/* Acreage Mode */}
      {agriAssessmentMode === 'acreage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">Land Holding Details</h3>

            <div className="space-y-4">
              {/* Land Acres */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Total Land Acreage:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={landAcres || ''}
                  onChange={(e) => setLandAcres(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Land Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Land Classification:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLandType('irrigated')}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                      landType === 'irrigated'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Irrigated / Canal
                  </button>
                  <button
                    onClick={() => setLandType('barani')}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                      landType === 'barani'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Barani / Rain-fed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">Tax Calculation Result</h3>

            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Annual Agricultural Land Tax
              </span>
              <div className="text-3xl font-black font-mono">{formatPKR(agriResult.totalTax)}</div>
              <div className="text-xs text-emerald-200">{agriResult.rateDesc}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <p className="leading-relaxed">
                Agricultural income tax is levied on land holding based on acreage and classification. Rates vary by province
                and land type (irrigated vs. rain-fed).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Income Mode */}
      {agriAssessmentMode === 'income' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">Net Farm Income Details</h3>

            <div className="space-y-4">
              {/* Annual Income */}
              <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-800 block">
                      Enter income
                    </label>
                    <div className="mt-1 text-sm font-bold text-slate-800">Gross Annual Agricultural Income (PKR)</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                    {formatPakistaniUnits(agriAnnualIncome)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-black text-sm">PKR</span>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={agriAnnualIncome || ''}
                    onChange={(e) => setAgriAnnualIncome(Math.max(0, Number(e.target.value)))}
                    placeholder="2,500,000"
                    className="w-full pl-14 pr-3 py-3.5 bg-white border-2 border-emerald-300 rounded-xl text-lg font-black text-slate-900 font-mono focus:bg-white focus:ring-4 focus:ring-emerald-200 focus:border-emerald-600 text-right shadow-sm"
                  />
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Allowable Agricultural Expenses (PKR):</label>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    {formatPakistaniUnits(agriExpenses)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">PKR</span>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={agriExpenses || ''}
                    onChange={(e) => setAgriExpenses(Math.max(0, Number(e.target.value)))}
                    placeholder="800,000"
                    className="w-full pl-14 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 text-right"
                  />
                </div>
              </div>

              {/* Net Income */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs font-semibold text-emerald-900 mb-2">Taxable Net Income:</div>
                <div className="text-2xl font-black font-mono text-emerald-800">
                  {formatPKR(Math.max(0, agriAnnualIncome - agriExpenses))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">Tax Calculation Result</h3>

            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Annual Agricultural Income Tax
              </span>
              <div className="text-3xl font-black font-mono">{formatPKR(agriResult.totalTax)}</div>
              <div className="text-xs text-emerald-200">{agriResult.rateDesc}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="font-bold text-slate-700 block">Gross Income</span>
                <span className="font-bold font-mono text-slate-900">{formatPKR(agriAnnualIncome)}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="font-bold text-slate-700 block">Deductible Expenses</span>
                <span className="font-bold font-mono text-slate-900">{formatPKR(agriExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
