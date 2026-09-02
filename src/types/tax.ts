export type TaxYear = '2026-2027' | '2025-2026' | '2024-2025' | '2023-2024' | '2022-2023';

export type TaxpayerCategory = 'salaried' | 'non_salaried' | 'aop' | 'it_freelance_export';

export type CalculationPeriod = 'monthly' | 'annually';

export interface TaxSlab {
  min: number;
  max: number | null;
  baseTax: number;
  rate: number; // percentage, e.g. 0.05 for 5%
  description: string;
}

export interface TaxYearConfig {
  year: TaxYear;
  label: string;
  sublabel: string;
  isCurrent: boolean;
  salariedSlabs: TaxSlab[];
  nonSalariedSlabs: TaxSlab[];
  surchargeThreshold?: number; // e.g. 10,000,000 for 10% surcharge
  surchargeRate?: number; // 0.10
}

export interface SalaryBreakdownInput {
  period: CalculationPeriod;
  grossSalary: number; // total or computed from below
  useDetailedBreakdown: boolean;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  isMedicalExemptAuto: boolean; // Up to 10% of basic is exempt
  conveyanceAllowance: number;
  specialAllowance: number;
  bonus: number;
  commission: number;
  otherIncome: number;
  
  // Tax credits & deductions
  charitableDonationsSec61: number;
  vpsPensionContributionSec62: number;
  healthInsuranceSec62A: number;
  educationalExpensesSec60D: number;
  advanceTaxDeducted: number; // e.g. on vehicle/cash/electricity
}

export interface SlabCalculationStep {
  slabIndex: number;
  min: number;
  max: number | null;
  taxableInThisSlab: number;
  rate: number;
  taxAmount: number;
  isApplicable: boolean;
}

export interface TaxCalculationResult {
  taxYear: TaxYear;
  taxpayerCategory: TaxpayerCategory;
  period: CalculationPeriod;
  
  grossSalaryMonthly: number;
  grossSalaryAnnual: number;
  
  exemptionsAnnual: number;
  taxableIncomeAnnual: number;
  taxableIncomeMonthly: number;
  
  baseTaxAnnual: number;
  surchargeAnnual: number;
  grossTaxAnnual: number;
  
  taxCreditsAnnual: number;
  advanceTaxAdjusted: number;
  netTaxAnnual: number;
  netTaxMonthly: number;
  
  netTakeHomeAnnual: number;
  netTakeHomeMonthly: number;
  
  effectiveTaxRate: number; // percentage
  marginalTaxRate: number; // percentage
  
  slabSteps: SlabCalculationStep[];
  activeSlab: TaxSlab;
  
  breakdown: {
    basicAnnual: number;
    allowancesAnnual: number;
    bonusCommissionAnnual: number;
    otherAnnual: number;
  };
}

export interface ReverseCalculationResult {
  targetNetTakeHome: number;
  period: CalculationPeriod;
  requiredGrossMonthly: number;
  requiredGrossAnnual: number;
  taxLiabilityAnnual: number;
  taxLiabilityMonthly: number;
  effectiveTaxRate: number;
}
