import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Percent,
  TrendingDown,
  Building,
  HelpCircle,
  FileText,
} from 'lucide-react';
import {
  CalculationPeriod,
  SalaryBreakdownInput,
  TaxCalculationResult,
  TaxpayerCategory,
  TaxYear,
} from '../types/tax';
import { calculateIncomeTax, formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';
import { TAX_YEARS_CONFIG } from '../data/taxSlabs';
import { SocialShareButtons } from './SocialShareButtons';

interface SalaryTaxCalculatorProps {
  taxYear: TaxYear;
  setTaxYear: (year: TaxYear) => void;
  taxpayerCategory: TaxpayerCategory;
  setTaxpayerCategory: (cat: TaxpayerCategory) => void;
  onOpenCertificate: () => void;
}

const PRESET_SALARIES_MONTHLY = [
  50000,
  100000,
  150000,
  200000,
  300000,
  500000,
  750000,
  1000000,
  2000000,
];

export const SalaryTaxCalculator: React.FC<SalaryTaxCalculatorProps> = ({
  taxYear,
  setTaxYear,
  taxpayerCategory,
  setTaxpayerCategory,
  onOpenCertificate,
}) => {
  const [period, setPeriod] = useState<CalculationPeriod>('monthly');
  const [useDetailedBreakdown, setUseDetailedBreakdown] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);
  const [itExportRate, setItExportRate] = useState<number>(0.0025); // 0.25% PSEB or 0.01
  const [copied, setCopied] = useState(false);

  // Form State
  const [inputState, setInputState] = useState<SalaryBreakdownInput>({
    period: 'monthly',
    grossSalary: 150000,
    useDetailedBreakdown: false,
    basicSalary: 90000,
    houseRentAllowance: 35000,
    medicalAllowance: 15000,
    isMedicalExemptAuto: true,
    conveyanceAllowance: 10000,
    specialAllowance: 0,
    bonus: 0,
    commission: 0,
    otherIncome: 0,
    charitableDonationsSec61: 0,
    vpsPensionContributionSec62: 0,
    healthInsuranceSec62A: 0,
    educationalExpensesSec60D: 0,
    advanceTaxDeducted: 0,
  });

  const handleInputChange = (field: keyof SalaryBreakdownInput, value: number | boolean) => {
    setInputState((prev) => {
      const next = { ...prev, [field]: value };
      if (next.useDetailedBreakdown && field !== 'grossSalary') {
        const sum =
          (Number(next.basicSalary) || 0) +
          (Number(next.houseRentAllowance) || 0) +
          (Number(next.medicalAllowance) || 0) +
          (Number(next.conveyanceAllowance) || 0) +
          (Number(next.specialAllowance) || 0) +
          (Number(next.bonus) || 0) +
          (Number(next.commission) || 0) +
          (Number(next.otherIncome) || 0);
        next.grossSalary = sum;
      }
      return next;
    });
  };

  const handlePresetSelect = (amount: number) => {
    const val = period === 'monthly' ? amount : amount * 12;
    setInputState((prev) => ({
      ...prev,
      grossSalary: val,
      basicSalary: val * 0.6,
      houseRentAllowance: val * 0.25,
      medicalAllowance: val * 0.1,
      conveyanceAllowance: val * 0.05,
    }));
  };

  // Perform calculation
  const result: TaxCalculationResult = calculateIncomeTax({
    taxYear,
    taxpayerCategory,
    period,
    input: {
      ...inputState,
      period,
      useDetailedBreakdown,
    },
    itExportRate,
  });

  // Calculate comparison with previous fiscal year (e.g. 2024-2025)
  const prevYear: TaxYear = taxYear === '2025-2026' ? '2024-2025' : '2023-2024';
  const prevResult: TaxCalculationResult = calculateIncomeTax({
    taxYear: prevYear,
    taxpayerCategory,
    period,
    input: {
      ...inputState,
      period,
      useDetailedBreakdown,
    },
    itExportRate,
  });

  const taxDifferenceAnnual = result.netTaxAnnual - prevResult.netTaxAnnual;
  const taxDifferenceMonthly = result.netTaxMonthly - prevResult.netTaxMonthly;

  const handleCopySummary = () => {
    const text = `--- Pak Tax Calculation (${TAX_YEARS_CONFIG[taxYear].label}) ---
Taxpayer Category: ${taxpayerCategory.toUpperCase()}
Gross Salary: ${formatPKR(result.grossSalaryMonthly)}/mo (${formatPKR(result.grossSalaryAnnual)}/yr)
Taxable Income: ${formatPKR(result.taxableIncomeAnnual)}/yr
Monthly Tax (WHT): ${formatPKR(result.netTaxMonthly)}
Annual Tax Liability: ${formatPKR(result.netTaxAnnual)}
Net Take-Home Salary: ${formatPKR(result.netTakeHomeMonthly)}/mo (${formatPKR(result.netTakeHomeAnnual)}/yr)
Effective Tax Rate: ${result.effectiveTaxRate.toFixed(2)}%
Marginal Slab Rate: ${result.marginalTaxRate.toFixed(2)}%
Calculated via Pak Tax Calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const takeHomePercentage = result.grossSalaryAnnual > 0 ? (result.netTakeHomeAnnual / result.grossSalaryAnnual) * 100 : 100;
  const taxPercentage = result.grossSalaryAnnual > 0 ? (result.netTaxAnnual / result.grossSalaryAnnual) * 100 : 0;
  const exemptionPercentage = result.grossSalaryAnnual > 0 ? (result.exemptionsAnnual / result.grossSalaryAnnual) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Category Notification Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-emerald-950">
                {TAX_YEARS_CONFIG[taxYear]?.label} &bull; {taxpayerCategory === 'salaried' ? 'Salaried Individuals' : taxpayerCategory === 'non_salaried' ? 'Business / Non-Salaried' : taxpayerCategory === 'it_freelance_export' ? 'IT / Software Exporters (Sec 154A)' : 'Association of Persons (AOP)'}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {taxYear === '2025-2026' ? 'Current Tax Year' : 'Historical Year'}
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              {taxpayerCategory === 'salaried'
                ? 'For employees whose salary constitutes more than 75% of their total taxable income.'
                : taxpayerCategory === 'it_freelance_export'
                ? 'Special Final Tax Regime (FTR) for IT, software exports and remote freelancing.'
                : 'Subject to standard progressive business / individual income tax slabs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onOpenCertificate}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            Salary Slip
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
        <span className="px-1 text-xs font-bold text-slate-600">Taxpayer type:</span>
        {([
          ['salaried', 'Salaried Individual'],
          ['non_salaried', 'Business / Non-Salaried'],
          ['aop', 'AOP'],
          ['it_freelance_export', 'IT / Freelancer Export'],
        ] as const).map(([category, label]) => (
          <button
            key={category}
            type="button"
            onClick={() => setTaxpayerCategory(category)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              taxpayerCategory === category
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Grid: Inputs Column vs Results Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inputs (5 Cols on large screens) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* Header & Period Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Income Details
              </h3>

              {/* Period Switcher */}
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

            {/* IT Export Option if Category is IT Export */}
            {taxpayerCategory === 'it_freelance_export' && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-2">
                <label className="text-xs font-bold text-teal-950 block">
                  IT Export Final Tax Regime (Section 154A)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setItExportRate(0.0025)}
                    className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                      itExportRate === 0.0025
                        ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-teal-200 hover:bg-teal-100/50'
                    }`}
                  >
                    <div className="font-bold">0.25% Rate</div>
                    <div className="text-[10px] opacity-90">PSEB / P@SHA Registered</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setItExportRate(0.01)}
                    className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                      itExportRate === 0.01
                        ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-teal-200 hover:bg-teal-100/50'
                    }`}
                  >
                    <div className="font-bold">1.00% Rate</div>
                    <div className="text-[10px] opacity-90">Standard / Unregistered</div>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500">Quick Salary Presets ({period}):</label>
                <span className="text-[11px] text-emerald-700 font-medium">Click to apply</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SALARIES_MONTHLY.map((preset) => {
                  const displayAmount = period === 'monthly' ? preset : preset * 12;
                  const isSelected = inputState.grossSalary === displayAmount;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {formatPakistaniUnits(displayAmount)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Gross Input */}
            {!useDetailedBreakdown ? (
              <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="mb-1 inline-flex items-center rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-900">
                      Enter your income
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {period === 'monthly' ? 'Monthly Gross Salary / Income' : 'Annual Gross Salary / Income'} (PKR)
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                    {formatPakistaniUnits(inputState.grossSalary)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-black text-base">
                    Rs.
                  </span>
                  <input
                    id="gross-salary-input"
                    type="number"
                    min="0"
                    step="1000"
                    value={inputState.grossSalary || ''}
                    onChange={(e) => handleInputChange('grossSalary', Math.max(0, Number(e.target.value)))}
                    placeholder="Enter amount (e.g. 150000)"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-emerald-300 rounded-xl text-lg font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-emerald-200 focus:border-emerald-600 transition-all font-mono shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-600">
                  Equivalent to {formatPKR(period === 'monthly' ? inputState.grossSalary * 12 : inputState.grossSalary / 12)} {period === 'monthly' ? 'per year' : 'per month'}
                </p>
              </div>
            ) : (
              /* Detailed Breakdown Inputs */
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Basic Salary ({period})</label>
                  <input
                    type="number"
                    min="0"
                    value={inputState.basicSalary || ''}
                    onChange={(e) => handleInputChange('basicSalary', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">House Rent Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={inputState.houseRentAllowance || ''}
                      onChange={(e) => handleInputChange('houseRentAllowance', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Medical Allowance</label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={inputState.medicalAllowance || ''}
                      onChange={(e) => handleInputChange('medicalAllowance', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>
                </div>

                {/* Medical Allowance Exemption Checkbox */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
                  <input
                    id="medical-exemption-checkbox"
                    type="checkbox"
                    checked={inputState.isMedicalExemptAuto}
                    onChange={(e) => handleInputChange('isMedicalExemptAuto', e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="medical-exemption-checkbox" className="text-[11px] text-emerald-900 leading-tight cursor-pointer">
                    <span className="font-bold">Auto 10% Medical Exemption u/s Clause (139):</span> Up to 10% of basic salary is exempt from tax if hospital/treatment is not reimbursed.
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Conveyance Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={inputState.conveyanceAllowance || ''}
                      onChange={(e) => handleInputChange('conveyanceAllowance', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Special / Other Allowances</label>
                    <input
                      type="number"
                      min="0"
                      value={inputState.specialAllowance || ''}
                      onChange={(e) => handleInputChange('specialAllowance', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Bonus / Commission</label>
                    <input
                      type="number"
                      min="0"
                      value={inputState.bonus || ''}
                      onChange={(e) => handleInputChange('bonus', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Other Taxable Income</label>
                    <input
                      type="number"
                      min="0"
                      value={inputState.otherIncome || ''}
                      onChange={(e) => handleInputChange('otherIncome', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Computed Total Gross:</span>
                  <span className="font-mono text-emerald-800">{formatPKR(inputState.grossSalary)}</span>
                </div>
              </div>
            )}

            {/* Toggle Detailed Breakdown Switch */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setUseDetailedBreakdown(!useDetailedBreakdown)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                {useDetailedBreakdown ? 'Switch to Simple Total Gross' : 'Specify Detailed Salary Allowances (Basic, Medical, Rent)'}
              </button>
            </div>

            {/* Tax Deductions & Credits Expandable Section */}
            <div className="border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setShowDeductions(!showDeductions)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 py-1 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tax Credits & Deductions (VPS, Donations, Advance Tax)
                </span>
                {showDeductions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDeductions && (
                <div className="mt-3 space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Voluntary Pension Scheme (VPS u/s 62)</label>
                      <span className="text-[10px] text-slate-500">Max 20% of Taxable Income</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 100000"
                      value={inputState.vpsPensionContributionSec62 || ''}
                      onChange={(e) => handleInputChange('vpsPensionContributionSec62', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Approved Donations (u/s 61)</label>
                      <span className="text-[10px] text-slate-500">Max 30% of Taxable Income</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 50000"
                      value={inputState.charitableDonationsSec61 || ''}
                      onChange={(e) => handleInputChange('charitableDonationsSec61', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Health Insurance Premium (u/s 62A)</label>
                      <span className="text-[10px] text-slate-500">Max 5% or Rs. 150,000</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 25000"
                      value={inputState.healthInsuranceSec62A || ''}
                      onChange={(e) => handleInputChange('healthInsuranceSec62A', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Advance Tax Deducted (Adjustable)</label>
                      <span className="text-[10px] text-slate-500">Direct Tax Offset</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 15000"
                      value={inputState.advanceTaxDeducted || ''}
                      onChange={(e) => handleInputChange('advanceTaxDeducted', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Calculation Results (7 Cols on large screens) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Results Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            {/* Header with Copy & Share */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Tax Calculation Summary
                </h3>
                <p className="text-xs text-slate-500">
                  {TAX_YEARS_CONFIG[taxYear]?.label} &bull; Applicable FBR Rates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Copy calculation summary"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>

            {/* Key Output Metrics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Monthly Net Take-Home (Primary Hero) */}
              <div className="sm:col-span-3 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                      Monthly Take-Home Salary (Net Pay)
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                      {formatPKR(result.netTakeHomeMonthly)}
                    </div>
                    <div className="text-xs text-emerald-200 mt-1 font-medium">
                      Annual Take-Home: <span className="font-mono font-bold">{formatPKR(result.netTakeHomeAnnual)}</span> ({formatPakistaniUnits(result.netTakeHomeAnnual)})
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-emerald-800/60 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-emerald-300 block">Effective Tax Rate</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-100">
                        {result.effectiveTaxRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-[10px] text-emerald-400 bg-emerald-800/80 px-2 py-0.5 rounded-md font-mono">
                        Marginal: {result.marginalTaxRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Gross Income */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Gross Income
                </span>
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  {formatPKR(result.grossSalaryMonthly)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Annual: <span className="font-mono">{formatPKR(result.grossSalaryAnnual)}</span>
                </div>
              </div>

              {/* Monthly Tax (WHT) */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Monthly Tax (WHT)
                </span>
                <div className="text-xl font-extrabold text-rose-700 font-mono">
                  {formatPKR(result.netTaxMonthly)}
                </div>
                <div className="text-[11px] text-rose-600 font-medium">
                  Annual Tax: <span className="font-mono">{formatPKR(result.netTaxAnnual)}</span>
                </div>
              </div>

              {/* Taxable Income After Exemptions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                  Taxable Income
                </span>
                <div className="text-xl font-extrabold text-blue-900 font-mono">
                  {formatPKR(result.taxableIncomeMonthly)}
                </div>
                <div className="text-[11px] text-blue-600 font-medium">
                  Exemptions: <span className="font-mono">{formatPKR(result.exemptionsAnnual / 12)}/mo</span>
                </div>
              </div>
            </div>

            {/* Visual Breakdown Stacked Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Salary Distribution</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {takeHomePercentage.toFixed(1)}% Take-Home &bull; {taxPercentage.toFixed(1)}% Tax
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div
                  style={{ width: `${takeHomePercentage}%` }}
                  className="bg-emerald-600 h-full transition-all duration-300"
                  title={`Take-Home: ${takeHomePercentage.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${taxPercentage}%` }}
                  className="bg-rose-500 h-full transition-all duration-300"
                  title={`Tax: ${taxPercentage.toFixed(1)}%`}
                />
                {exemptionPercentage > 0 && (
                  <div
                    style={{ width: `${exemptionPercentage}%` }}
                    className="bg-blue-400 h-full transition-all duration-300"
                    title={`Exemptions: ${exemptionPercentage.toFixed(1)}%`}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Net Take-Home ({takeHomePercentage.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Income Tax ({taxPercentage.toFixed(1)}%)</span>
                </div>
                {result.exemptionsAnnual > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Exemptions ({exemptionPercentage.toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Year-over-Year Tax Comparison Card */}
            {taxYear === '2025-2026' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />
                    Comparison with FY 2024-2025 (Previous Year)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    In FY 2025-26, lower tax rates (1% vs 5%) and broadened slabs offer tax relief.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {taxDifferenceAnnual < 0 ? (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Saving {formatPKR(Math.abs(taxDifferenceMonthly))}/mo ({formatPKR(Math.abs(taxDifferenceAnnual))}/yr)
                    </div>
                  ) : taxDifferenceAnnual > 0 ? (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                      Difference: +{formatPKR(taxDifferenceMonthly)}/mo
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-lg">
                      Same Tax Liability
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Slab Highlight Box */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-950">
                <span className="font-bold">Active Tax Slab ({TAX_YEARS_CONFIG[taxYear]?.label}):</span>{' '}
                {result.activeSlab.description} (Taxable Income: {formatPKR(result.taxableIncomeAnnual)}/year).
              </div>
            </div>

            {/* Progressive Step-by-Step Slab Calculation Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Progressive Tax Calculation Breakdown</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">FBR Progressive Slabs</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-2 px-3">Slab Range (PKR)</th>
                      <th className="py-2 px-3">Rate</th>
                      <th className="py-2 px-3">Taxable in Slab</th>
                      <th className="py-2 px-3 text-right">Tax (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.slabSteps.map((step, idx) => (
                      <tr
                        key={idx}
                        className={`${
                          step.isApplicable
                            ? 'bg-emerald-50/40 font-semibold text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono">
                          {formatPKR(step.min, { showPrefix: false })} -{' '}
                          {step.max !== null ? formatPKR(step.max, { showPrefix: false }) : 'Above'}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {(step.rate * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {step.taxableInThisSlab > 0 ? formatPKR(step.taxableInThisSlab) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {step.taxAmount > 0 ? formatPKR(step.taxAmount) : '0'}
                        </td>
                      </tr>
                    ))}
                    {result.surchargeAnnual > 0 && (
                      <tr className="bg-amber-50 font-bold text-amber-900">
                        <td colSpan={3} className="py-2 px-3">
                          10% Additional Surcharge (Taxable Income &gt; Rs. 10 Million)
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatPKR(result.surchargeAnnual)}
                        </td>
                      </tr>
                    )}
                    {result.taxCreditsAnnual > 0 && (
                      <tr className="bg-emerald-100/70 font-bold text-emerald-900">
                        <td colSpan={3} className="py-2 px-3">
                          Less: Approved Tax Credits (VPS / Donations / Health)
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-800">
                          -{formatPKR(result.taxCreditsAnnual)}
                        </td>
                      </tr>
                    )}
                    {result.advanceTaxAdjusted > 0 && (
                      <tr className="bg-teal-50 font-bold text-teal-900">
                        <td colSpan={3} className="py-2 px-3">
                          Less: Advance / Withholding Tax Adjusted
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-teal-800">
                          -{formatPKR(result.advanceTaxAdjusted)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-extrabold">
                      <td colSpan={3} className="py-2.5 px-3">
                        Total Annual Income Tax Liability
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-300 text-sm">
                        {formatPKR(result.netTaxAnnual)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onOpenCertificate}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                View & Print Salary Slip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Sharing Section */}
      <SocialShareButtons
        title="Pakistan Salary Tax Calculator"
        description={`My tax calculation for ${TAX_YEARS_CONFIG[taxYear]?.label}: Monthly take-home is ${formatPKR(result.netTakeHomeMonthly)}, Annual tax liability is ${formatPKR(result.netTaxAnnual)} at ${result.effectiveTaxRate.toFixed(2)}% effective rate.`}
        calculatorType="salary-tax"
        amount={`${formatPKR(result.netTakeHomeMonthly)}/month (${formatPKR(result.netTakeHomeAnnual)}/year)`}
      />
    </div>
  );
};

export default SalaryTaxCalculator;
