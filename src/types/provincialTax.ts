export type Province = 'punjab' | 'sindh' | 'kpk' | 'balochistan' | 'ict';

export type ProvincialAuthority = 'PRA' | 'SRB' | 'KPRA' | 'BRA' | 'ICT';

export type ProvincialModule = 'services-tax' | 'agricultural-tax' | 'property-stamp-duty' | 'vehicle-token-tax' | 'professional-tax';

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  standardRate: number; // percentage, e.g. 0.16
  concessionaryRate?: number; // e.g. 0.05
  digitalPaymentRate?: number; // e.g. 0.05 for POS
  withholdingRate: number; // WHT rate on services
  notes: string;
}

export interface ProvinceInfo {
  id: Province;
  name: string;
  shortName: string;
  authority: ProvincialAuthority;
  authorityFullName: string;
  standardServicesRate: number;
  portalUrl: string;
  badgeColor: string;
  description: string;
}

export interface AgriLandSlab {
  minAcres: number;
  maxAcres: number | null;
  ratePerAcreIrrigated: number;
  ratePerAcreBarani: number; // Un-irrigated
  description: string;
}

export interface AgriIncomeSlab {
  minIncome: number;
  maxIncome: number | null;
  baseTax: number;
  rate: number;
  description: string;
}

export interface PropertyTransferRates {
  province: Province;
  stampDutyRate: number; // e.g. 0.01 to 0.03
  cvtRate: number; // 0.01 to 0.02
  tmaTownTaxRate: number; // 0.01
  registrationFeeFixedOrRate: string;
  totalEstimatedTransferRate: number;
  notes: string;
}

export interface VehicleTokenRate {
  engineCCRange: string;
  minCC: number;
  maxCC: number;
  annualTokenPunjab: number;
  annualTokenSindh: number;
  annualTokenKP: number;
  annualTokenICT: number;
  lifetimeTokenRate?: string;
  notes: string;
}

export interface ProfessionalTaxSlab {
  category: 'salaried' | 'business' | 'company';
  minThreshold: number;
  maxThreshold: number | null;
  taxAmount: number;
  description: string;
}
