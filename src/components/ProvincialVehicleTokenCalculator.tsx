import React, { useState } from 'react';
import { Car, Landmark } from 'lucide-react';
import { Province } from '../types/provincialTax';
import { PROVINCES_CONFIG, VEHICLE_TOKEN_SLABS } from '../data/provincialTaxData';
import { formatPKR } from '../utils/taxCalculator';

export const ProvincialVehicleTokenCalculator: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province>('punjab');
  const [vehicleCCIndex, setVehicleCCIndex] = useState<number>(2);

  const provinceConfig = PROVINCES_CONFIG[selectedProvince];
  const taxKeyByProvince: Record<Province, keyof Pick<
    (typeof VEHICLE_TOKEN_SLABS)[number],
    'annualTokenPunjab' | 'annualTokenSindh' | 'annualTokenKP' | 'annualTokenICT'
  >> = {
    punjab: 'annualTokenPunjab',
    sindh: 'annualTokenSindh',
    kpk: 'annualTokenKP',
    balochistan: 'annualTokenPunjab',
    ict: 'annualTokenICT',
  };

  const vehicleSlabs = VEHICLE_TOKEN_SLABS.map((slab) => ({
    ...slab,
    ccRange: slab.engineCCRange,
    taxAmount: slab[taxKeyByProvince[selectedProvince]] ?? slab.annualTokenPunjab,
  }));
  const selectedSlab = vehicleSlabs[vehicleCCIndex] || vehicleSlabs[0];

  return (
    <div className="space-y-6">
      {/* Province Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Car className="w-5 h-5 text-emerald-600" />
          Motor Vehicle Token Tax (Excise) Calculator
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
        {/* Vehicle Selection */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Vehicle Engine Capacity</h3>

          <div className="space-y-2">
            {vehicleSlabs.map((slab, idx) => (
              <button
                key={idx}
                onClick={() => setVehicleCCIndex(idx)}
                className={`w-full p-3.5 rounded-xl text-sm font-bold text-left border transition-all ${
                  vehicleCCIndex === idx
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">{slab.ccRange}</div>
                <div className="text-xs opacity-80 mt-1">
                  {provinceConfig.authority} Tax: {formatPKR(slab.taxAmount)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Tax Calculation</h3>

          {/* Vehicle Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Vehicle Engine Capacity</div>
              <div className="text-2xl font-black text-slate-900">{selectedSlab.ccRange}</div>
            </div>
          </div>

          {/* Tax Amount Hero Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Annual Motor Vehicle Token Tax ({provinceConfig.authority})
            </span>
            <div className="text-3xl font-black font-mono">{formatPKR(selectedSlab.taxAmount)}</div>
            <div className="text-xs text-emerald-200">For {selectedSlab.ccRange} engines</div>
          </div>

          {/* Tax Slabs Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 mb-3">Complete Tax Slabs for {provinceConfig.authority}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-bold text-slate-700 py-2">Engine CC</th>
                    <th className="text-right font-bold text-slate-700 py-2">Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleSlabs.map((slab, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 ${
                        vehicleCCIndex === idx ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="font-bold text-slate-900 py-2">{slab.ccRange}</td>
                      <td className="text-right font-bold text-slate-900 font-mono py-2">
                        {formatPKR(slab.taxAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
            <p className="leading-relaxed">
              Motor Vehicle Token Tax is an annual excise tax levied by provincial authorities based on engine
              displacement (CC). Rates vary significantly by province and vehicle capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
