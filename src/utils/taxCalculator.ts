import { TAX_YEARS_CONFIG } from '../data/taxSlabs';
import {
  CalculationPeriod,
  ReverseCalculationResult,
  SalaryBreakdownInput,
  SlabCalculationStep,
  TaxCalculationResult,
  TaxSlab,
  TaxpayerCategory,
  TaxYear,
} from '../types/tax';

/**
 * Format numeric value into standard Pakistani Rupee representation
 */
export function formatPKR(val: number, options?: { showPrefix?: boolean; decimals?: number }): string {
  const showPrefix = options?.showPrefix ?? true;
  const decimals = options?.decimals ?? 0;
  
  if (isNaN(val) || val === null || val === undefined) {
    return showPrefix ? 'PKR 0' : '0';
  }

  const rounded = Number(val.toFixed(decimals));
  const parts = rounded.toString().split('.');
  
  // Format whole number in South Asian / Pakistani numbering system (e.g. 1,00,00,000) or standard comma
  // Standard formatted with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = parts.join('.');
  
  return showPrefix ? `PKR ${formatted}` : formatted;
}

/**
 * Converts PKR to Pakistani natural language units (Thousands, Lakhs, Crores, Arbas)
 */
export function formatPakistaniUnits(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return '0 PKR';
  
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1000000000) {
    const val = (abs / 1000000000).toFixed(2).replace(/\.00$/, '');
    return `${sign}${val} Arab`;
  }
  if (abs >= 10000000) {
    const val = (abs / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${sign}${val} Crore`;
  }
  if (abs >= 100000) {
    const val = (abs / 100000).toFixed(2).replace(/\.00$/, '');
    return `${sign}${val} Lakh`;
  }
  if (abs >= 1000) {
    const val = (abs / 1000).toFixed(1).replace(/\.0$/, '');
    return `${sign}${val} Thousand`;
  }

  return `${sign}${formatPKR(abs)}`;
}

/**
 * Calculate Progressive Income Tax
 */
export function calculateIncomeTax(params: {
  taxYear: TaxYear;
  taxpayerCategory: TaxpayerCategory;
  period: CalculationPeriod;
  input: SalaryBreakdownInput;
  itExportRate?: number; // 0.0025 for PSEB or 0.01 standard
}): TaxCalculationResult {
  const { taxYear, taxpayerCategory, period, input, itExportRate = 0.0025 } = params;
  const config = TAX_YEARS_CONFIG[taxYear] || TAX_YEARS_CONFIG['2026-2027'];
  const multiplier = period === 'monthly' ? 12 : 1;

  let grossSalaryAnnual = 0;
  let basicAnnual = 0;
  let allowancesAnnual = 0;
  let bonusCommissionAnnual = 0;
  let otherAnnual = 0;
  let exemptionsAnnual = 0;

  if (input.useDetailedBreakdown) {
    basicAnnual = (Number(input.basicSalary) || 0) * multiplier;
    const houseRentAnnual = (Number(input.houseRentAllowance) || 0) * multiplier;
    const medicalAnnual = (Number(input.medicalAllowance) || 0) * multiplier;
    const conveyanceAnnual = (Number(input.conveyanceAllowance) || 0) * multiplier;
    const specialAnnual = (Number(input.specialAllowance) || 0) * multiplier;
    
    allowancesAnnual = houseRentAnnual + medicalAnnual + conveyanceAnnual + specialAnnual;
    bonusCommissionAnnual = ((Number(input.bonus) || 0) + (Number(input.commission) || 0)) * multiplier;
    otherAnnual = (Number(input.otherIncome) || 0) * multiplier;

    grossSalaryAnnual = basicAnnual + allowancesAnnual + bonusCommissionAnnual + otherAnnual;

    // Automatic medical allowance exemption: up to 10% of basic salary u/s Clause (139) Part I Second Schedule
    if (input.isMedicalExemptAuto && basicAnnual > 0 && medicalAnnual > 0) {
      const maxMedicalExemption = basicAnnual * 0.10;
      exemptionsAnnual += Math.min(medicalAnnual, maxMedicalExemption);
    }
  } else {
    grossSalaryAnnual = (Number(input.grossSalary) || 0) * multiplier;
    basicAnnual = grossSalaryAnnual * 0.60; // Standard 60% estimated basic
    allowancesAnnual = grossSalaryAnnual * 0.40;
  }

  const grossSalaryMonthly = grossSalaryAnnual / 12;
  const taxableIncomeAnnual = Math.max(0, grossSalaryAnnual - exemptionsAnnual);
  const taxableIncomeMonthly = taxableIncomeAnnual / 12;

  let baseTaxAnnual = 0;
  let marginalTaxRate = 0;
  const slabSteps: SlabCalculationStep[] = [];

  let slabs: TaxSlab[] = config.salariedSlabs;
  if (taxpayerCategory === 'non_salaried' || taxpayerCategory === 'aop') {
    slabs = config.nonSalariedSlabs;
  }

  let activeSlab: TaxSlab = slabs[0];

  if (taxpayerCategory === 'it_freelance_export') {
    // IT Export Services Final Tax Regime u/s 154A
    baseTaxAnnual = taxableIncomeAnnual * itExportRate;
    marginalTaxRate = itExportRate * 100;
    activeSlab = {
      min: 0,
      max: null,
      baseTax: 0,
      rate: itExportRate,
      description: `Final Tax Regime u/s 154A @ ${(itExportRate * 100).toFixed(2)}%`,
    };
    slabSteps.push({
      slabIndex: 1,
      min: 0,
      max: null,
      taxableInThisSlab: taxableIncomeAnnual,
      rate: itExportRate,
      taxAmount: baseTaxAnnual,
      isApplicable: true,
    });
  } else {
    // Find active slab
    for (let i = 0; i < slabs.length; i++) {
      const slab = slabs[i];
      const isLastSlab = slab.max === null;
      const isCurrentSlab = taxableIncomeAnnual > slab.min && (isLastSlab || taxableIncomeAnnual <= slab.max!);

      if (isCurrentSlab || (taxableIncomeAnnual <= slab.min && i === 0)) {
        activeSlab = slab;
        marginalTaxRate = slab.rate * 100;
        
        if (taxableIncomeAnnual > slab.min) {
          const excess = taxableIncomeAnnual - slab.min;
          baseTaxAnnual = slab.baseTax + excess * slab.rate;
        } else {
          baseTaxAnnual = 0;
        }
      }
    }

    // Build progressive breakdown for clarity
    for (let i = 0; i < slabs.length; i++) {
      const slab = slabs[i];
      const prevMin = slab.min;
      const slabLimit = slab.max ?? Infinity;

      if (taxableIncomeAnnual <= prevMin) {
        slabSteps.push({
          slabIndex: i + 1,
          min: slab.min,
          max: slab.max,
          taxableInThisSlab: 0,
          rate: slab.rate,
          taxAmount: 0,
          isApplicable: false,
        });
      } else {
        const taxableAmount = Math.min(taxableIncomeAnnual, slabLimit) - prevMin;
        const taxInSlab = taxableAmount * slab.rate;
        slabSteps.push({
          slabIndex: i + 1,
          min: slab.min,
          max: slab.max,
          taxableInThisSlab: taxableAmount,
          rate: slab.rate,
          taxAmount: taxInSlab,
          isApplicable: true,
        });
      }
    }
  }

  // Surcharge calculation
  let surchargeAnnual = 0;
  if (
    config.surchargeThreshold &&
    config.surchargeRate &&
    taxableIncomeAnnual > config.surchargeThreshold &&
    taxpayerCategory !== 'it_freelance_export'
  ) {
    surchargeAnnual = baseTaxAnnual * config.surchargeRate;
  }

  const grossTaxAnnual = baseTaxAnnual + surchargeAnnual;

  // Tax credits
  let taxCreditsAnnual = 0;
  if (taxableIncomeAnnual > 0 && grossTaxAnnual > 0) {
    const avgTaxRate = grossTaxAnnual / taxableIncomeAnnual;

    // 1. VPS Pension Scheme u/s 62: Max 20% of taxable income
    const vpsAnnual = (Number(input.vpsPensionContributionSec62) || 0) * multiplier;
    if (vpsAnnual > 0) {
      const maxEligibleVPS = taxableIncomeAnnual * 0.20;
      const eligibleVPS = Math.min(vpsAnnual, maxEligibleVPS);
      taxCreditsAnnual += eligibleVPS * avgTaxRate;
    }

    // 2. Charitable Donations u/s 61: Max 30% of taxable income
    const donationsAnnual = (Number(input.charitableDonationsSec61) || 0) * multiplier;
    if (donationsAnnual > 0) {
      const maxEligibleDonation = taxableIncomeAnnual * 0.30;
      const eligibleDonation = Math.min(donationsAnnual, maxEligibleDonation);
      taxCreditsAnnual += eligibleDonation * avgTaxRate;
    }

    // 3. Health Insurance u/s 62A: Max 5% of taxable income or Rs. 150,000
    const healthAnnual = (Number(input.healthInsuranceSec62A) || 0) * multiplier;
    if (healthAnnual > 0) {
      const maxEligibleHealth = Math.min(150000, taxableIncomeAnnual * 0.05);
      const eligibleHealth = Math.min(healthAnnual, maxEligibleHealth);
      taxCreditsAnnual += eligibleHealth * avgTaxRate;
    }
  }

  const advanceTaxAnnual = (Number(input.advanceTaxDeducted) || 0) * multiplier;
  
  const netTaxAnnual = Math.max(0, grossTaxAnnual - taxCreditsAnnual - advanceTaxAnnual);
  const netTaxMonthly = netTaxAnnual / 12;

  const netTakeHomeAnnual = Math.max(0, grossSalaryAnnual - netTaxAnnual);
  const netTakeHomeMonthly = netTakeHomeAnnual / 12;

  const effectiveTaxRate = grossSalaryAnnual > 0 ? (netTaxAnnual / grossSalaryAnnual) * 100 : 0;

  return {
    taxYear,
    taxpayerCategory,
    period,
    grossSalaryMonthly,
    grossSalaryAnnual,
    exemptionsAnnual,
    taxableIncomeAnnual,
    taxableIncomeMonthly,
    baseTaxAnnual,
    surchargeAnnual,
    grossTaxAnnual,
    taxCreditsAnnual,
    advanceTaxAdjusted: advanceTaxAnnual,
    netTaxAnnual,
    netTaxMonthly,
    netTakeHomeAnnual,
    netTakeHomeMonthly,
    effectiveTaxRate,
    marginalTaxRate,
    slabSteps,
    activeSlab,
    breakdown: {
      basicAnnual,
      allowancesAnnual,
      bonusCommissionAnnual,
      otherAnnual,
    },
  };
}

/**
 * Reverse Tax Calculator: Determine required Gross Salary from Desired Take-Home Pay
 */
export function calculateReverseTax(params: {
  targetNetTakeHome: number;
  period: CalculationPeriod;
  taxYear: TaxYear;
  taxpayerCategory: TaxpayerCategory;
  itExportRate?: number;
}): ReverseCalculationResult {
  const { targetNetTakeHome, period, taxYear, taxpayerCategory, itExportRate = 0.0025 } = params;
  const annualTargetNet = period === 'monthly' ? targetNetTakeHome * 12 : targetNetTakeHome;

  if (annualTargetNet <= 0) {
    return {
      targetNetTakeHome,
      period,
      requiredGrossMonthly: 0,
      requiredGrossAnnual: 0,
      taxLiabilityAnnual: 0,
      taxLiabilityMonthly: 0,
      effectiveTaxRate: 0,
    };
  }

  if (taxpayerCategory === 'it_freelance_export') {
    const requiredGrossAnnual = annualTargetNet / (1 - itExportRate);
    const taxLiabilityAnnual = requiredGrossAnnual * itExportRate;
    return {
      targetNetTakeHome,
      period,
      requiredGrossMonthly: requiredGrossAnnual / 12,
      requiredGrossAnnual,
      taxLiabilityAnnual,
      taxLiabilityMonthly: taxLiabilityAnnual / 12,
      effectiveTaxRate: itExportRate * 100,
    };
  }

  // Binary search for exact gross salary matching the target net
  let low = annualTargetNet;
  let high = annualTargetNet * 2.5 + 5000000;
  let bestGross = annualTargetNet;

  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    const calc = calculateIncomeTax({
      taxYear,
      taxpayerCategory,
      period: 'annually',
      input: {
        period: 'annually',
        grossSalary: mid,
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

    const netResult = calc.netTakeHomeAnnual;
    const diff = netResult - annualTargetNet;

    if (Math.abs(diff) < 0.5) {
      bestGross = mid;
      break;
    }

    if (diff < 0) {
      low = mid;
    } else {
      high = mid;
    }
    bestGross = mid;
  }

  const finalCalc = calculateIncomeTax({
    taxYear,
    taxpayerCategory,
    period: 'annually',
    input: {
      period: 'annually',
      grossSalary: bestGross,
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

  return {
    targetNetTakeHome,
    period,
    requiredGrossMonthly: finalCalc.grossSalaryMonthly,
    requiredGrossAnnual: finalCalc.grossSalaryAnnual,
    taxLiabilityAnnual: finalCalc.netTaxAnnual,
    taxLiabilityMonthly: finalCalc.netTaxMonthly,
    effectiveTaxRate: finalCalc.effectiveTaxRate,
  };
}
