import React, { useState } from 'react';
import { ShoppingCart, HelpCircle } from 'lucide-react';
import {
  SalesTaxType,
  GST_RATES_2025_2026,
  PROVINCIAL_SERVICE_TAX_2025_2026,
  calculateSalesTax,
  SalesTaxCalculationResult,
  getTaxDescription,
} from '../types/salesTax';
import { formatPKR } from '../utils/taxCalculator';

export function SalesTaxCalculator() {
  const [taxType, setTaxType] = useState<SalesTaxType>('goods');
  const [amount, setAmount] = useState(100000);
  const [category, setCategory] = useState('Standard Rate');
  const [result, setResult] = useState<SalesTaxCalculationResult | null>(null);

  const handleCalculate = () => {
    try {
      const calculation = calculateSalesTax({
        taxType,
        grossAmount: parseFloat(amount.toString()),
        category,
      });
      setResult(calculation);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  // Get categories based on tax type
  const getCategories = () => {
    if (taxType === 'goods') {
      return Array.from(new Set(GST_RATES_2025_2026.map((r) => r.category)));
    } else {
      const provincialRates = PROVINCIAL_SERVICE_TAX_2025_2026.filter((r) => r.type === taxType);
      return Array.from(new Set(provincialRates.map((r) => r.category)));
    }
  };

  const categories = getCategories();
  if (!categories.includes(category)) {
    setCategory(categories[0] || '');
  }

  const currentDescription = getTaxDescription(taxType, category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Sales Tax Calculator</h2>
            <p className="text-slate-600">
              Calculate Federal GST on goods and Provincial sales tax on services per FBR & provincial authority regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Sales Tax Calculation Input</h3>

        <div className="space-y-4">
          {/* Tax Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tax Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors" style={{ borderColor: taxType === 'goods' ? '#b45309' : undefined, backgroundColor: taxType === 'goods' ? '#fffbeb' : undefined }}>
                <input
                  type="radio"
                  checked={taxType === 'goods'}
                  onChange={() => {
                    setTaxType('goods');
                    setCategory('Standard Rate');
                  }}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Federal Sales Tax (GST)</p>
                  <p className="text-xs text-slate-500">On goods & commodities</p>
                </div>
              </label>
            </div>
          </div>

          {/* Category/Item Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {taxType === 'goods' ? 'Goods Category' : 'Service Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">{currentDescription}</p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gross Amount (Before Tax)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-700">
                PKR
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={Number.isFinite(amount) ? amount.toLocaleString('en-US') : '0'}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '');
                  const numericValue = Number(rawValue);
                  setAmount(Number.isFinite(numericValue) ? numericValue : 0);
                }}
                className="w-full pl-16 pr-4 py-3 border-2 border-amber-300 rounded-lg font-semibold text-amber-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Calculate Sales Tax
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-4">Tax Calculation Result</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Gross Amount */}
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Gross Amount</p>
              <p className="text-2xl font-bold text-amber-700">
                {formatPKR(result.grossAmount, { decimals: 0 })}
              </p>
            </div>

            {/* Tax Rate */}
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Tax Rate</p>
              <p className="text-2xl font-bold text-amber-700">{result.taxRate}%</p>
            </div>

            {/* Tax Amount */}
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Tax Amount</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPKR(result.taxAmount, { decimals: 0 })}
              </p>
            </div>

            {/* Total with Tax */}
            <div className="bg-white rounded-lg p-4 border border-amber-200 ring-2 ring-amber-300">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total (With Tax)</p>
              <p className="text-2xl font-bold text-amber-700">
                {formatPKR(result.totalWithTax, { decimals: 0 })}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg p-4 space-y-2">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Item/Service:</span> {currentDescription}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Effective Rate:</span> {result.effectiveRate}%
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Tax Payable:</span> {formatPKR(result.taxAmount)}
            </p>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3 mb-4">
          <HelpCircle size={24} className="text-blue-600 flex-shrink-0" />
          <h3 className="text-lg font-bold text-blue-900">Sales Tax Information</h3>
        </div>
        <div className="space-y-3 text-sm text-blue-900">
          <p>
            <strong>Federal Sales Tax (GST):</strong> Charged by FBR on goods at the standard rate of 17%. Many food items, medicines, and agricultural products are zero-rated or exempt.
          </p>
          <p>
            <strong>Zero-Rated vs Exempt:</strong> Zero-rated items allow tax credit recovery, while exempt items do not. This distinction matters for registered businesses.
          </p>
          <p>
            <strong>Input Tax Credit:</strong> Registered businesses can claim input tax (tax paid on purchases) as credit against their output tax (tax collected from customers).
          </p>
          <p className="text-xs text-slate-600 italic">
            ℹ️ Rates are based on 2025-26 regulations. Consult FBR or provincial tax authorities for official guidance.
          </p>
        </div>
      </div>

      {/* GST Rates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Federal GST Rates - Tax Year 2025-26</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {GST_RATES_2025_2026.map((rate) => (
                <tr key={rate.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">{rate.description}</td>
                  <td className="text-right py-3 px-4 font-semibold text-amber-700">
                    {rate.standardRate}%
                  </td>
                  <td className="py-3 px-4">
                    {rate.exempted && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Exempt</span>}
                    {rate.zeroRated && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Zero Rated</span>}
                    {!rate.exempted && !rate.zeroRated && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Standard</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
