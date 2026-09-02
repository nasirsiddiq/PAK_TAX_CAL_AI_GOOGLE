import React, { useState } from 'react';
import { TrendingDown, HelpCircle, Copy } from 'lucide-react';
import {
  WHTMainCategory,
  WHTCalculationResult,
  calculateWHT,
  getWHTMainCategories,
  getWHTSubCategories,
  getWHTSubCategory,
} from '../types/wht';
import { formatPKR } from '../utils/taxCalculator';

export function WithholdingTaxCalculator() {
  const mainCategories = getWHTMainCategories();
  const firstCategory = mainCategories[0].id as WHTMainCategory;
  const firstSubcategory = getWHTSubCategories(firstCategory)[0]?.id || '';

  const [selectedCategory, setSelectedCategory] = useState<WHTMainCategory>(firstCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(firstSubcategory);
  const [amount, setAmount] = useState(1000000);
  const [isFiler, setIsFiler] = useState(true);
  const [result, setResult] = useState<WHTCalculationResult | null>(null);

  const handleCategoryChange = (newCategory: WHTMainCategory) => {
    setSelectedCategory(newCategory);
    const subCats = getWHTSubCategories(newCategory);
    if (subCats.length > 0) {
      setSelectedSubcategory(subCats[0].id);
    }
  };

  const handleCalculate = () => {
    try {
      const calculation = calculateWHT({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        amount: parseFloat(amount.toString()),
        isFiler,
      });
      setResult(calculation);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleCopy = () => {
    if (result) {
      const text = `WHT Calculation - ${result.subcategoryName}
Gross Amount: ${formatPKR(result.grossAmount)}
WHT Rate: ${result.whtRate}%
WHT Amount: ${formatPKR(result.whtAmount)}
Net Amount After WHT: ${formatPKR(result.netAmount)}`;
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const currentSubcategory = getWHTSubCategory(selectedCategory, selectedSubcategory);
  const subcategoriesForSelected = getWHTSubCategories(selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Withholding Tax (WHT) Calculator</h2>
            <p className="text-slate-600">
              Calculate WHT deductions on commissions, services, contractors, and other business payments per FBR regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">WHT Calculation Input</h3>

        <div className="space-y-4">
          {/* Main Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as WHTMainCategory)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sub-category
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {subcategoriesForSelected.map((subCat) => (
                <option key={subCat.id} value={subCat.id}>
                  {subCat.name} ({subCat.section})
                </option>
              ))}
            </select>
            {currentSubcategory?.minAmount && (
              <p className="text-xs text-amber-600 mt-1">
                ℹ️ Minimum threshold: {formatPKR(currentSubcategory.minAmount)}
              </p>
            )}
          </div>

          {/* Gross Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gross Amount (Before WHT)
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-700">
                  PKR
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-emerald-300 rounded-lg font-semibold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {/* Formatted display with separators */}
              <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-xs text-emerald-700 font-semibold">Formatted:</span>
                <span className="text-lg font-bold text-emerald-900 font-mono">{formatPKR(amount)}</span>
              </div>
            </div>
          </div>

          {/* Filer Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tax Filing Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isFiler}
                  onChange={() => setIsFiler(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Filer (Registered with FBR)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isFiler}
                  onChange={() => setIsFiler(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Non-Filer
                </span>
              </label>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Calculate WHT
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-emerald-900">WHT Calculation Result</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Copy size={16} />
                <span className="text-sm font-medium">Copy</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Gross Amount */}
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Gross Amount</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatPKR(result.grossAmount, { decimals: 0 })}
              </p>
            </div>

            {/* WHT Rate */}
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">WHT Rate</p>
              <p className="text-2xl font-bold text-emerald-700">{result.whtRate}%</p>
            </div>

            {/* WHT Amount */}
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">WHT Deduction</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPKR(result.whtAmount, { decimals: 0 })}
              </p>
            </div>

            {/* Net Amount */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200 ring-2 ring-emerald-300">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Net Amount (After WHT)</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatPKR(result.netAmount, { decimals: 0 })}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg p-4 space-y-2">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Category:</span> {mainCategories.find((c) => c.id === selectedCategory)?.name}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Sub-category:</span> {result.subcategoryName}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Status:</span> {isFiler ? 'Filer (FBR Registered)' : 'Non-Filer'}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Effective Rate:</span> {result.whtRate}%
            </p>
            {result.belowMinimumThreshold && (
              <p className="text-xs text-amber-600 italic">
                ⚠️ Amount is below minimum threshold (Rs. {formatPKR(result.minAmount || 0)}). WHT not applicable.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3 mb-4">
          <HelpCircle size={24} className="text-blue-600 flex-shrink-0" />
          <h3 className="text-lg font-bold text-blue-900">WHT Information & Regulations</h3>
        </div>
        <div className="space-y-3 text-sm text-blue-900">
          <p>
            <strong>What is WHT?</strong> Withholding Tax is a tax deducted at source on certain payments per FBR Order. It's applicable on commissions, services, contractors, and various business transactions.
          </p>
          <p>
            <strong>Filer vs Non-Filer:</strong> Registered taxpayers (Filers) enjoy lower WHT rates compared to non-filers. Non-filers face higher rates to encourage formal registration.
          </p>
          <p>
            <strong>Minimum Threshold:</strong> Some transactions (like utilities, contractors) have minimum amount thresholds. WHT is not applicable below these limits.
          </p>
          <p>
            <strong>WHT Certificate:</strong> The person deducting WHT must issue a certificate to the recipient for their tax records and credit purposes.
          </p>
          <p className="text-xs text-slate-600 italic">
            ℹ️ Rates are based on 2025-26 tax year per latest FBR regulations. For official guidance, consult a certified tax professional.
          </p>
        </div>
      </div>

      {/* WHT Rates Reference Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">WHT Rates Table - Tax Year 2025-26 (All Categories)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Category / Sub-category</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Section</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Filer Rate</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Non-Filer Rate</th>
              </tr>
            </thead>
            <tbody>
              {mainCategories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className="bg-emerald-50 border-b border-emerald-100">
                    <td className="py-3 px-4 font-bold text-emerald-900">{category.name}</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  {category.subcategories.map((subCat) => (
                    <tr key={subCat.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 pl-8">{subCat.name}</td>
                      <td className="py-3 px-4 text-center text-xs text-slate-600">{subCat.section}</td>
                      <td className="text-right py-3 px-4 font-semibold text-emerald-700">
                        {subCat.filerRate}%
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-red-600">
                        {subCat.nonFilerRate}%
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
