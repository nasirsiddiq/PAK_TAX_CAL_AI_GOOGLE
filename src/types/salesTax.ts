export type SalesTaxType = 'goods' | 'services_federal' | 'services_punjab' | 'services_sindh' | 'services_kpk' | 'services_balochistan' | 'services_ict';

export type SalesTaxProvince = 'federal' | 'punjab' | 'sindh' | 'kpk' | 'balochistan' | 'ict';

export interface SalesTaxRate {
  id: string;
  type: SalesTaxType;
  category: string;
  description: string;
  standardRate: number; // %
  zeroRated: boolean;
  exempted: boolean;
  province?: SalesTaxProvince;
  applicableFrom: string; // tax year
}

export interface SalesTaxInput {
  taxType: SalesTaxType;
  grossAmount: number;
  quantity?: number;
  category?: string;
}

export interface SalesTaxCalculationResult {
  taxType: SalesTaxType;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
  effectiveRate: number;
}

// Federal Sales Tax (GST) Rates 2025-26
export const GST_RATES_2025_2026: SalesTaxRate[] = [
  {
    id: 'gst-standard',
    type: 'goods',
    category: 'Standard Rate',
    description: 'Standard Rate on Most Goods',
    standardRate: 17,
    zeroRated: false,
    exempted: false,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-food',
    type: 'goods',
    category: 'Food Items',
    description: 'Food Items (Zero Rated)',
    standardRate: 0,
    zeroRated: true,
    exempted: false,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-edible-oil',
    type: 'goods',
    category: 'Edible Oil',
    description: 'Edible Oil (Exempt)',
    standardRate: 0,
    zeroRated: false,
    exempted: true,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-medicines',
    type: 'goods',
    category: 'Medicines',
    description: 'Essential Medicines (Zero Rated)',
    standardRate: 0,
    zeroRated: true,
    exempted: false,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-fertilizer',
    type: 'goods',
    category: 'Fertilizer',
    description: 'Fertilizer (Exempt)',
    standardRate: 0,
    zeroRated: false,
    exempted: true,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-books',
    type: 'goods',
    category: 'Books',
    description: 'Books & Educational Materials (Zero Rated)',
    standardRate: 0,
    zeroRated: true,
    exempted: false,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-electricity',
    type: 'goods',
    category: 'Utilities',
    description: 'Electricity - Domestic',
    standardRate: 0,
    zeroRated: false,
    exempted: true,
    applicableFrom: '2025-2026',
  },
  {
    id: 'gst-electricity-industrial',
    type: 'goods',
    category: 'Utilities',
    description: 'Electricity - Industrial',
    standardRate: 0,
    zeroRated: false,
    exempted: true,
    applicableFrom: '2025-2026',
  },
];

// Provincial Sales Tax on Services
export const PROVINCIAL_SERVICE_TAX_2025_2026: SalesTaxRate[] = [
  // Punjab (PRA)
  {
    id: 'pra-telecom',
    type: 'services_punjab',
    category: 'Telecom',
    description: 'Telecom Services (Punjab)',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'punjab',
    applicableFrom: '2025-2026',
  },
  {
    id: 'pra-hotel',
    type: 'services_punjab',
    category: 'Hotel',
    description: 'Hotel Services (Punjab) - 3-star & above',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'punjab',
    applicableFrom: '2025-2026',
  },
  {
    id: 'pra-restaurant',
    type: 'services_punjab',
    category: 'Restaurant',
    description: 'Restaurant Services (Punjab)',
    standardRate: 3,
    zeroRated: false,
    exempted: false,
    province: 'punjab',
    applicableFrom: '2025-2026',
  },
  {
    id: 'pra-advertising',
    type: 'services_punjab',
    category: 'Advertising',
    description: 'Advertising Services (Punjab)',
    standardRate: 3,
    zeroRated: false,
    exempted: false,
    province: 'punjab',
    applicableFrom: '2025-2026',
  },
  // Sindh (SRB)
  {
    id: 'srb-telecom',
    type: 'services_sindh',
    category: 'Telecom',
    description: 'Telecom Services (Sindh)',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'sindh',
    applicableFrom: '2025-2026',
  },
  {
    id: 'srb-hotel',
    type: 'services_sindh',
    category: 'Hotel',
    description: 'Hotel Services (Sindh)',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'sindh',
    applicableFrom: '2025-2026',
  },
  {
    id: 'srb-restaurant',
    type: 'services_sindh',
    category: 'Restaurant',
    description: 'Restaurant Services (Sindh)',
    standardRate: 2,
    zeroRated: false,
    exempted: false,
    province: 'sindh',
    applicableFrom: '2025-2026',
  },
  // KPK (KPRA)
  {
    id: 'kpra-telecom',
    type: 'services_kpk',
    category: 'Telecom',
    description: 'Telecom Services (KPK)',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'kpk',
    applicableFrom: '2025-2026',
  },
  {
    id: 'kpra-hotel',
    type: 'services_kpk',
    category: 'Hotel',
    description: 'Hotel Services (KPK)',
    standardRate: 2,
    zeroRated: false,
    exempted: false,
    province: 'kpk',
    applicableFrom: '2025-2026',
  },
  // Balochistan (BRA)
  {
    id: 'bra-telecom',
    type: 'services_balochistan',
    category: 'Telecom',
    description: 'Telecom Services (Balochistan)',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'balochistan',
    applicableFrom: '2025-2026',
  },
  {
    id: 'bra-hotel',
    type: 'services_balochistan',
    category: 'Hotel',
    description: 'Hotel Services (Balochistan)',
    standardRate: 2,
    zeroRated: false,
    exempted: false,
    province: 'balochistan',
    applicableFrom: '2025-2026',
  },
  // ICT
  {
    id: 'ict-telecom',
    type: 'services_ict',
    category: 'Telecom',
    description: 'Telecom Services (ICT)',
    standardRate: 3.5,
    zeroRated: false,
    exempted: false,
    province: 'ict',
    applicableFrom: '2025-2026',
  },
  {
    id: 'ict-hotel',
    type: 'services_ict',
    category: 'Hotel',
    description: 'Hotel Services (ICT)',
    standardRate: 2.5,
    zeroRated: false,
    exempted: false,
    province: 'ict',
    applicableFrom: '2025-2026',
  },
];

export function calculateSalesTax(input: SalesTaxInput): SalesTaxCalculationResult {
  let rate = 0;

  if (input.taxType === 'goods') {
    // Check GST rates
    const gstRate = GST_RATES_2025_2026.find((r) => r.category === input.category);
    if (gstRate) {
      rate = gstRate.standardRate;
    } else {
      rate = 17; // default GST
    }
  } else {
    // Provincial service tax
    const provincialRate = PROVINCIAL_SERVICE_TAX_2025_2026.find(
      (r) => r.type === input.taxType && r.category === input.category
    );
    if (provincialRate) {
      rate = provincialRate.standardRate;
    }
  }

  const taxAmount = (input.grossAmount * rate) / 100;
  const totalWithTax = input.grossAmount + taxAmount;

  return {
    taxType: input.taxType,
    grossAmount: input.grossAmount,
    taxRate: rate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalWithTax: Math.round(totalWithTax * 100) / 100,
    effectiveRate: rate,
  };
}

// Helper function to get tax description
export function getTaxDescription(taxType: SalesTaxType, category?: string): string {
  if (taxType === 'goods') {
    const rate = GST_RATES_2025_2026.find((r) => r.category === category);
    return rate ? rate.description : 'Standard GST Rate (17%)';
  } else {
    const rate = PROVINCIAL_SERVICE_TAX_2025_2026.find(
      (r) => r.type === taxType && r.category === category
    );
    return rate ? rate.description : 'Service Tax';
  }
}
