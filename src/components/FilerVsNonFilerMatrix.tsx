import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { WHT_MATRIX, WhtMatrixItem } from '../data/taxSlabs';
import { formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';

export const FilerVsNonFilerMatrix: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Penalty Simulator state
  const [simulationType, setSimulationType] = useState<'property-buy' | 'property-sell' | 'vehicle' | 'cash-withdrawal' | 'dividends'>('property-buy');
  const [simAmount, setSimAmount] = useState<number>(15000000); // 1.5 Crore property

  const categories = ['All', 'Real Estate', 'Banking', 'Vehicles', 'Investments', 'Freelance & IT', 'Utilities'];

  const filteredItems = WHT_MATRIX.filter((item) => {
    const matchesSearch =
      item.transaction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate Penalty Simulator
  const calculateSimulation = () => {
    let filerRate = 0.03;
    let nonFilerRate = 0.12;
    let title = 'Property Purchase (Section 236K)';

    if (simulationType === 'property-buy') {
      filerRate = 0.03; // 3%
      nonFilerRate = 0.12; // 12%
      title = 'Property Purchase (Section 236K)';
    } else if (simulationType === 'property-sell') {
      filerRate = 0.03; // 3%
      nonFilerRate = 0.10; // 10%
      title = 'Property Sale (Section 236C)';
    } else if (simulationType === 'vehicle') {
      // rough approx for vehicle 50-100Lakh
      filerRate = 0.03;
      nonFilerRate = 0.09;
      title = 'Vehicle Registration (Section 231B)';
    } else if (simulationType === 'cash-withdrawal') {
      filerRate = 0;
      nonFilerRate = 0.006; // 0.6%
      title = 'Cash Withdrawal over 50k (Section 231AB)';
    } else if (simulationType === 'dividends') {
      filerRate = 0.15; // 15%
      nonFilerRate = 0.30; // 30%
      title = 'Dividend / Mutual Funds (Section 150)';
    }

    const filerTax = simAmount * filerRate;
    const nonFilerTax = simAmount * nonFilerRate;
    const penaltyLoss = nonFilerTax - filerTax;

    return { title, filerTax, nonFilerTax, penaltyLoss, filerRate, nonFilerRate };
  };

  const simResult = calculateSimulation();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active Taxpayer List (ATL) Rates
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Filer vs Non-Filer Withholding Tax Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Compare official withholding tax rates under Pakistan Income Tax Ordinance 2001. Filers enjoy standard rates & full adjustable credits, whereas Non-Filers face 2x to 4x penalty rates and non-adjustable deductions.
          </p>
        </div>
      </div>

      {/* Interactive Filer Penalty Simulator Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Non-Filer Penalty Surcharge Simulator
            </h3>
            <p className="text-xs text-slate-500">
              See how much money you save on high-value transactions by maintaining Active Filer status.
            </p>
          </div>

          {/* Preset Simulation Type */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setSimulationType('property-buy'); setSimAmount(15000000); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                simulationType === 'property-buy' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Property Buy
            </button>
            <button
              onClick={() => { setSimulationType('property-sell'); setSimAmount(15000000); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                simulationType === 'property-sell' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Property Sell
            </button>
            <button
              onClick={() => { setSimulationType('vehicle'); setSimAmount(5000000); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                simulationType === 'vehicle' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Car Buy
            </button>
            <button
              onClick={() => { setSimulationType('dividends'); setSimAmount(500000); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                simulationType === 'dividends' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dividends
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Amount input */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Transaction Value (PKR):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
              <input
                type="number"
                min="0"
                step="100000"
                value={simAmount || ''}
                onChange={(e) => setSimAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Equivalent: <span className="font-bold text-emerald-800">{formatPakistaniUnits(simAmount)}</span>
            </div>
          </div>

          {/* Results Comparison Bento */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active Filer Tax ({(simResult.filerRate * 100).toFixed(1)}%)
              </div>
              <div className="text-lg font-extrabold font-mono text-emerald-800">
                {formatPKR(simResult.filerTax)}
              </div>
              <div className="text-[10px] text-emerald-700">Adjustable in Return</div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1 text-xs font-bold text-rose-900">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Non-Filer Tax ({(simResult.nonFilerRate * 100).toFixed(1)}%)
              </div>
              <div className="text-lg font-extrabold font-mono text-rose-700">
                {formatPKR(simResult.nonFilerTax)}
              </div>
              <div className="text-[10px] text-rose-600">Extra Surcharge Paid</div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-1">
              <div className="text-xs font-bold text-emerald-300">
                Filer Savings
              </div>
              <div className="text-lg font-extrabold font-mono text-emerald-300">
                {formatPKR(simResult.penaltyLoss)}
              </div>
              <div className="text-[10px] text-slate-300">Direct Financial Benefit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search section or transaction (e.g. Property, Bank, 236K)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3.5">Section</th>
                <th className="py-2.5 px-3.5">Transaction Type</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5 text-emerald-800 bg-emerald-50/50">Active Filer Rate</th>
                <th className="py-2.5 px-3.5 text-amber-800 bg-amber-50/50">Late Filer Rate</th>
                <th className="py-2.5 px-3.5 text-rose-800 bg-rose-50/50">Non-Filer Rate</th>
                <th className="py-2.5 px-3.5">Statutory Rules & Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {item.section}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {item.transaction}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-700 bg-emerald-50/30 whitespace-nowrap">
                      {item.filerRate}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-semibold text-amber-700 bg-amber-50/30 whitespace-nowrap">
                      {item.lateFilerRate}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-rose-600 bg-rose-50/30 whitespace-nowrap">
                      {item.nonFilerRate}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-[11px] leading-snug">
                      {item.notes}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
