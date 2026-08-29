import React, { useState } from 'react';
import {
  RefreshCw,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Briefcase,
  Copy,
  Check,
  Building,
  FileText,
} from 'lucide-react';
import { CalculationPeriod, TaxpayerCategory, TaxYear } from '../types/tax';
import { calculateReverseTax, formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';
import { TAX_YEARS_CONFIG } from '../data/taxSlabs';

interface ReverseTaxCalculatorProps {
  taxYear: TaxYear;
  setTaxYear: (year: TaxYear) => void;
  taxpayerCategory: TaxpayerCategory;
  setTaxpayerCategory: (cat: TaxpayerCategory) => void;
  onOpenCertificate: () => void;
}

const NET_PRESETS = [75000, 100000, 150000, 200000, 300000, 500000, 1000000];

export const ReverseTaxCalculator: React.FC<ReverseTaxCalculatorProps> = ({
  taxYear,
  setTaxYear,
  taxpayerCategory,
  setTaxpayerCategory,
  onOpenCertificate,
}) => {
  const [period, setPeriod] = useState<CalculationPeriod>('monthly');
  const [targetNet, setTargetNet] = useState<number>(200000);
  const [copied, setCopied] = useState(false);

  const result = calculateReverseTax({
    targetNetTakeHome: targetNet,
    period,
    taxYear,
    taxpayerCategory,
  });

  const handleCopy = () => {
    const text = `--- Pak Reverse Tax Calculation (${TAX_YEARS_CONFIG[taxYear].label}) ---
Target Take-Home Net: ${formatPKR(period === 'monthly' ? targetNet : targetNet / 12)}/mo (${formatPKR(period === 'monthly' ? targetNet * 12 : targetNet)}/yr)
Required Gross Salary: ${formatPKR(result.requiredGrossMonthly)}/mo (${formatPKR(result.requiredGrossAnnual)}/yr)
FBR Tax Withholding: ${formatPKR(result.taxLiabilityMonthly)}/mo (${formatPKR(result.taxLiabilityAnnual)}/yr)
Effective Tax Rate: ${result.effectiveTaxRate.toFixed(2)}%
Calculated via Pak Tax Calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" />
            Net-to-Gross Salary Inverter
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Reverse Tax Calculator
          </h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Need a specific net in-hand salary? Determine the exact gross salary package required before FBR income tax deductions for job offers, HR negotiations, or contractor agreements.
          </p>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Target In-Hand Pay
            </h3>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  period === 'monthly'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('annually')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  period === 'annually'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Quick Net Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">
              Quick Take-Home Presets ({period}):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {NET_PRESETS.map((preset) => {
                const val = period === 'monthly' ? preset : preset * 12;
                const isSelected = targetNet === val;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetNet(val)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {formatPakistaniUnits(val)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="target-net-input" className="text-xs font-bold text-slate-800">
                Desired {period === 'monthly' ? 'Monthly' : 'Annual'} Net Take-Home (PKR)
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {formatPakistaniUnits(targetNet)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rs.
              </span>
              <input
                id="target-net-input"
                type="number"
                min="0"
                step="5000"
                value={targetNet || ''}
                onChange={(e) => setTargetNet(Math.max(0, Number(e.target.value)))}
                placeholder="Enter net pay (e.g. 200000)"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
              How Reverse Calculation Works
            </div>
            <p>
              Under progressive tax rates, salary increases move through higher marginal brackets. The reverse calculator solves the exact gross salary package using official FBR slabs for {TAX_YEARS_CONFIG[taxYear]?.label}.
            </p>
          </div>
        </div>

        {/* Right: Results Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Required Gross Salary Result
              </h3>
              <p className="text-xs text-slate-500">
                Exact compensation package to yield {formatPKR(targetNet)} net
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Primary Metric: Required Gross */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-xs">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Required Monthly Gross Salary
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-emerald-300">
              {formatPKR(result.requiredGrossMonthly)}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-medium">
              Annual Gross Package:{' '}
              <span className="font-mono font-bold text-white">{formatPKR(result.requiredGrossAnnual)}</span> ({formatPakistaniUnits(result.requiredGrossAnnual)})
            </div>
          </div>

          {/* Detailed Deductions Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-1">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                Estimated Tax Deduction (Monthly)
              </span>
              <div className="text-xl font-extrabold text-rose-700 font-mono">
                {formatPKR(result.taxLiabilityMonthly)}
              </div>
              <div className="text-[11px] text-rose-600 font-medium">
                Annual Tax: <span className="font-mono">{formatPKR(result.taxLiabilityAnnual)}</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Target Net Take-Home (Monthly)
              </span>
              <div className="text-xl font-extrabold text-emerald-900 font-mono">
                {formatPKR(period === 'monthly' ? targetNet : targetNet / 12)}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Annual Net:{' '}
                <span className="font-mono">
                  {formatPKR(period === 'monthly' ? targetNet * 12 : targetNet)}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Payslip Equivalent Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Standard Salary Package Breakdown
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Salary Component</th>
                    <th className="py-2 px-3 text-right">Monthly (PKR)</th>
                    <th className="py-2 px-3 text-right">Annual (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 text-slate-800">Basic Salary (~60%)</td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatPKR(result.requiredGrossMonthly * 0.6)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatPKR(result.requiredGrossAnnual * 0.6)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-800">House Rent Allowance (~25%)</td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatPKR(result.requiredGrossMonthly * 0.25)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatPKR(result.requiredGrossAnnual * 0.25)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-800">Medical & Other Allowances (~15%)</td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatPKR(result.requiredGrossMonthly * 0.15)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatPKR(result.requiredGrossAnnual * 0.15)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-2 px-3">Gross Salary Total</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-800">
                      {formatPKR(result.requiredGrossMonthly)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-800">
                      {formatPKR(result.requiredGrossAnnual)}
                    </td>
                  </tr>
                  <tr className="bg-rose-50/50 font-bold text-rose-800">
                    <td className="py-2 px-3">Less: Income Tax (WHT)</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-700">
                      -{formatPKR(result.taxLiabilityMonthly)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-rose-700">
                      -{formatPKR(result.taxLiabilityAnnual)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-100 font-extrabold text-emerald-950">
                    <td className="py-2.5 px-3">Net Take-Home Pay</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-900">
                      {formatPKR(result.requiredGrossMonthly - result.taxLiabilityMonthly)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-900">
                      {formatPKR(result.requiredGrossAnnual - result.taxLiabilityAnnual)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
