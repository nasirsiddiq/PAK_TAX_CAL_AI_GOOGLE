import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Percent,
  CheckCircle2,
  DollarSign,
  Heart,
  Briefcase,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { calculateIncomeTax, formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';
import { TaxYear, TaxpayerCategory } from '../types/tax';

interface TaxSavingsOptimizerProps {
  taxYear: TaxYear;
  taxpayerCategory: TaxpayerCategory;
  onApplyToMainCalculator?: (vps: number, donations: number) => void;
}

export const TaxSavingsOptimizer: React.FC<TaxSavingsOptimizerProps> = ({
  taxYear,
  taxpayerCategory,
  onApplyToMainCalculator,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(250000); // 2.5 Lakh / month = 30 Lakh / year
  const [vpsInvestment, setVpsInvestment] = useState<number>(300000); // 3 Lakh VPS contribution
  const [charityDonation, setCharityDonation] = useState<number>(100000); // 1 Lakh donation
  const [healthInsurance, setHealthInsurance] = useState<number>(35000); // 35k insurance

  // Base Calculation without any credits
  const baseResult = calculateIncomeTax({
    taxYear,
    taxpayerCategory,
    period: 'monthly',
    input: {
      period: 'monthly',
      grossSalary: monthlyIncome,
      useDetailedBreakdown: false,
      basicSalary: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      isMedicalExemptAuto: false,
      conveyanceAllowance: 0,
      specialAllowance: 0,
      bonus: 0,
      commission: 0,
      otherIncome: 0,
      charitableDonationsSec61: 0,
      vpsPensionContributionSec62: 0,
      healthInsuranceSec62A: 0,
      educationalExpensesSec60D: 0,
      advanceTaxDeducted: 0,
    },
  });

  // Optimized Calculation with Credits
  const optimizedResult = calculateIncomeTax({
    taxYear,
    taxpayerCategory,
    period: 'monthly',
    input: {
      period: 'monthly',
      grossSalary: monthlyIncome,
      useDetailedBreakdown: false,
      basicSalary: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      isMedicalExemptAuto: false,
      conveyanceAllowance: 0,
      specialAllowance: 0,
      bonus: 0,
      commission: 0,
      otherIncome: 0,
      charitableDonationsSec61: charityDonation / 12,
      vpsPensionContributionSec62: vpsInvestment / 12,
      healthInsuranceSec62A: healthInsurance / 12,
      educationalExpensesSec60D: 0,
      advanceTaxDeducted: 0,
    },
  });

  const totalTaxSavedAnnual = Math.max(0, baseResult.netTaxAnnual - optimizedResult.netTaxAnnual);
  const totalTaxSavedMonthly = totalTaxSavedAnnual / 12;
  const maxAllowedVPS = baseResult.taxableIncomeAnnual * 0.20;
  const maxAllowedDonations = baseResult.taxableIncomeAnnual * 0.30;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Legal Tax Planning Guide
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Pakistan Tax Savings & Deductions Optimizer
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Learn how to legally slash your annual income tax liability under the provisions of the Pakistan Income Tax Ordinance 2001 by utilizing approved Voluntary Pension Schemes (VPS), charitable donations, and health insurance tax credits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Simulator */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Your Income & Investment Inputs
          </h3>

          {/* Monthly Gross */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Monthly Gross Income (PKR)
              </label>
              <span className="text-xs font-bold text-emerald-800 font-mono">
                {formatPakistaniUnits(monthlyIncome)}/mo
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="10000"
              value={monthlyIncome || ''}
              onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
            <div className="text-[11px] text-slate-500">
              Taxable Annual Income: <span className="font-mono font-bold">{formatPKR(monthlyIncome * 12)}</span>
            </div>
          </div>

          {/* VPS Pension Slider / Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  Voluntary Pension Scheme (VPS u/s 62)
                </label>
                <span className="text-[10px] text-slate-500">
                  Max allowable: {formatPKR(maxAllowedVPS)} (20% of income)
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {formatPKR(vpsInvestment)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(100000, maxAllowedVPS)}
              step="10000"
              value={vpsInvestment}
              onChange={(e) => setVpsInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Rs.</span>
              <input
                type="number"
                min="0"
                value={vpsInvestment}
                onChange={(e) => setVpsInvestment(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Donations Slider / Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  Approved Charitable Donations (u/s 61)
                </label>
                <span className="text-[10px] text-slate-500">
                  Max allowable: {formatPKR(maxAllowedDonations)} (30% of income)
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {formatPKR(charityDonation)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(50000, maxAllowedDonations)}
              step="10000"
              value={charityDonation}
              onChange={(e) => setCharityDonation(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Rs.</span>
              <input
                type="number"
                min="0"
                value={charityDonation}
                onChange={(e) => setCharityDonation(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right: Optimization Results */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Estimated Tax Savings Overview
          </h3>

          {/* Hero Savings Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-xl p-5 shadow-xs">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              Total Annual Tax Saved (Direct Tax Credit)
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              {formatPKR(totalTaxSavedAnnual)}
            </div>
            <div className="text-xs text-emerald-100 mt-1">
              Monthly Tax Reduction: <span className="font-mono font-bold text-emerald-300">{formatPKR(totalTaxSavedMonthly)}/mo</span>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Original Tax</span>
              <div className="text-lg font-bold font-mono text-slate-800">
                {formatPKR(baseResult.netTaxAnnual)}
              </div>
              <div className="text-[11px] text-slate-500">
                Rate: {baseResult.effectiveTaxRate.toFixed(1)}%
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase">Optimized Tax</span>
              <div className="text-lg font-extrabold font-mono text-emerald-900">
                {formatPKR(optimizedResult.netTaxAnnual)}
              </div>
              <div className="text-[11px] text-emerald-700">
                Rate: {optimizedResult.effectiveTaxRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Educational Insights Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              How the FBR Tax Credit Formula Works:
            </div>
            <p className="leading-relaxed">
              Under Section 62 & 61 of the Income Tax Ordinance 2001, your tax credit is computed as:
              <br />
              <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200 inline-block my-1 text-slate-900">
                Tax Credit = (Total Tax / Taxable Income) &times; Eligible Investment
              </span>
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li>VPS investments in SECP-regulated pension funds build your retirement corpus tax-free.</li>
              <li>Donations must be made via crossed cheque/banking channel to approved Section 61 institutions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
