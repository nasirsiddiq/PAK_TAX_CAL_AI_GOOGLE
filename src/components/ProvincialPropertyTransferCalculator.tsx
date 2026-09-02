import React, { useState } from 'react';
import { Home, Building2 } from 'lucide-react';
import { Province } from '../types/provincialTax';
import { PROVINCES_CONFIG } from '../data/provincialTaxData';
import { formatPKR, formatPakistaniUnits } from '../utils/taxCalculator';

export const ProvincialPropertyTransferCalculator: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province>('punjab');
  const [propertyDCValue, setPropertyDCValue] = useState<number>(15000000);
  const [isFilerBuyer, setIsFilerBuyer] = useState<boolean>(true);

  const provinceConfig = PROVINCES_CONFIG[selectedProvince];

  const calculatePropertyTransfer = () => {
    const stampDutyRate = isFilerBuyer ? 0.04 : 0.05; // 4% for filer, 5% for non-filer
    const stampDuty = propertyDCValue * stampDutyRate;

    // Federal WHT on property transfer: 3% for filer, 12% for non-filer
    const federalWHTRate = isFilerBuyer ? 0.03 : 0.12;
    const federalWHT = propertyDCValue * federalWHTRate;

    const totalLiability = stampDuty + federalWHT;

    return {
      propertyValue: propertyDCValue,
      stampDutyRate,
      stampDuty,
      federalWHTRate,
      federalWHT,
      totalLiability,
    };
  };

  const result = calculatePropertyTransfer();

  return (
    <div className="space-y-6">
      {/* Province Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-600" />
          Property Transfer Tax Calculator
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
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Property Details
          </h3>

          <div className="space-y-4">
            {/* Property DC Value */}
            <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-800 block">
                    Enter property value
                  </label>
                  <div className="mt-1 text-sm font-bold text-slate-800">Property Declared/Assessed Value (PKR)</div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                  {formatPakistaniUnits(propertyDCValue)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-black text-sm">PKR</span>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={propertyDCValue || ''}
                  onChange={(e) => setPropertyDCValue(Math.max(0, Number(e.target.value)))}
                  placeholder="15,000,000"
                  className="w-full pl-14 pr-3 py-3.5 bg-white border-2 border-emerald-300 rounded-xl text-lg font-black text-slate-900 font-mono focus:bg-white focus:ring-4 focus:ring-emerald-200 focus:border-emerald-600 text-right shadow-sm"
                />
              </div>
            </div>

            {/* Buyer Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Buyer Tax Filing Status:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsFilerBuyer(true)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                    isFilerBuyer
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Filer (Lower Rate)
                </button>
                <button
                  onClick={() => setIsFilerBuyer(false)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                    !isFilerBuyer
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Non-Filer (Higher Rate)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Tax Liability Breakdown</h3>

          {/* Property Value Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Property Declared Value
            </span>
            <div className="text-3xl font-black font-mono">{formatPKR(result.propertyValue)}</div>
          </div>

          {/* Taxes Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            {/* Stamp Duty */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-blue-900 uppercase block">Stamp Duty</div>
              <div className="text-lg font-bold text-blue-900 font-mono">{(result.stampDutyRate * 100).toFixed(1)}%</div>
              <div className="text-xs font-bold text-blue-700 font-mono">{formatPKR(result.stampDuty)}</div>
            </div>

            {/* Federal WHT */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
              <div className="text-[10px] font-bold text-rose-900 uppercase block">Federal WHT</div>
              <div className="text-lg font-bold text-rose-900 font-mono">{(result.federalWHTRate * 100).toFixed(1)}%</div>
              <div className="text-xs font-bold text-rose-700 font-mono">{formatPKR(result.federalWHT)}</div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Total Tax Liability
            </span>
            <div className="text-2xl font-black font-mono text-emerald-300">
              {formatPKR(result.totalLiability)}
            </div>
            <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-700">
              Stamp Duty {formatPKR(result.stampDuty)} + Federal WHT {formatPKR(result.federalWHT)}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
            <p className="leading-relaxed">
              <strong>Filer:</strong> Stamp duty 4%, Federal WHT 3%<br />
              <strong>Non-Filer:</strong> Stamp duty 5%, Federal WHT 12%
            </p>
            <p className="text-[11px] text-slate-600">
              Rates shown are standard rates. Actual rates may vary based on property type and location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
