// Comprehensive WHT (Withholding Tax) Types with Hierarchical Categories
// Based on Income Tax Ordinance 2001 - Section 147 onwards
// Updated for Tax Year 2025-2026

export type WHTMainCategory = 
  | 'goods'
  | 'services'
  | 'contracts'
  | 'ecommerce'
  | 'dividends'
  | 'non_residents'
  | 'property_rent'
  | 'imports'
  | 'exports'
  | 'prizes'
  | 'cash_withdrawal'
  | 'brokerage'
  | 'property_transactions'
  | 'foreign_workers';

export interface WHTSubCategory {
  id: string;
  name: string;
  section: string;
  description: string;
  filerRate: number;
  nonFilerRate: number;
  minAmount?: number;
}

export interface WHTCategoryGroup {
  id: WHTMainCategory;
  name: string;
  subcategories: WHTSubCategory[];
}

export interface WHTCalculationInput {
  category: WHTMainCategory;
  subcategory: string;
  amount: number;
  isFiler: boolean;
}

export interface WHTCalculationResult {
  category: WHTMainCategory;
  subcategory: string;
  subcategoryName: string;
  grossAmount: number;
  whtRate: number;
  whtAmount: number;
  netAmount: number;
  taxYear: string;
  belowMinimumThreshold?: boolean;
  minAmount?: number;
}

// Complete WHT Rates Structure 2025-2026
export const WHT_CATEGORIES_2025_2026: WHTCategoryGroup[] = [
  {
    id: 'goods',
    name: 'Goods (Sec 153)',
    subcategories: [
      {
        id: 'goods_rice_oil',
        name: 'Rice, cotton-seed or edible oils',
        section: 'Sec 153',
        description: 'Sale of rice, cotton-seed, edible oils',
        filerRate: 2,
        nonFilerRate: 3,
        minAmount: 500000,
      },
      {
        id: 'goods_company_sale',
        name: 'Sale of goods – company',
        section: 'Sec 153',
        description: 'Sale of goods by company/corporate entity',
        filerRate: 1.5,
        nonFilerRate: 3,
        minAmount: 1000000,
      },
      {
        id: 'goods_noncorp_sale',
        name: 'Sale of goods – other than company',
        section: 'Sec 153',
        description: 'Sale of goods by individual/partnership',
        filerRate: 2,
        nonFilerRate: 3.5,
        minAmount: 500000,
      },
      {
        id: 'goods_toll_company',
        name: 'Toll manufacturing – company',
        section: 'Sec 153',
        description: 'Toll manufacturing by company',
        filerRate: 1.5,
        nonFilerRate: 2.5,
        minAmount: 500000,
      },
      {
        id: 'goods_toll_noncorp',
        name: 'Toll manufacturing – other than company',
        section: 'Sec 153',
        description: 'Toll manufacturing by individual/partnership',
        filerRate: 2,
        nonFilerRate: 3,
        minAmount: 500000,
      },
    ],
  },
  {
    id: 'services',
    name: 'Services (Sec 153)',
    subcategories: [
      {
        id: 'services_telecommunication',
        name: 'Telecommunication services',
        section: 'Sec 153',
        description: 'Telecom, internet, mobile services',
        filerRate: 3,
        nonFilerRate: 5,
        minAmount: 50000,
      },
      {
        id: 'services_transport',
        name: 'Transport & shipping',
        section: 'Sec 153',
        description: 'Transport, shipping, cargo services',
        filerRate: 3.5,
        nonFilerRate: 5,
        minAmount: 50000,
      },
      {
        id: 'services_hotel',
        name: 'Hotel & restaurant services',
        section: 'Sec 153',
        description: 'Hotel, restaurant, catering services',
        filerRate: 3,
        nonFilerRate: 5,
        minAmount: 50000,
      },
      {
        id: 'services_bank',
        name: 'Banking & financial services',
        section: 'Sec 153',
        description: 'Bank fees, financial charges, commissions',
        filerRate: 2,
        nonFilerRate: 4,
      },
      {
        id: 'services_utility',
        name: 'Utility services (Electricity, Gas, Water)',
        section: 'Sec 153',
        description: 'Electricity, gas, water charges',
        filerRate: 2.5,
        nonFilerRate: 4,
        minAmount: 50000,
      },
      {
        id: 'services_professional',
        name: 'Professional services',
        section: 'Sec 153',
        description: 'Legal, accounting, consulting services',
        filerRate: 3,
        nonFilerRate: 5,
        minAmount: 50000,
      },
    ],
  },
  {
    id: 'contracts',
    name: 'Contracts (Sec 153)',
    subcategories: [
      {
        id: 'contracts_construction',
        name: 'Construction contracts',
        section: 'Sec 153',
        description: 'Construction, building, infrastructure contracts',
        filerRate: 3,
        nonFilerRate: 5,
        minAmount: 500000,
      },
      {
        id: 'contracts_supply',
        name: 'Supply contracts',
        section: 'Sec 153',
        description: 'Supply and provision contracts',
        filerRate: 3,
        nonFilerRate: 5,
        minAmount: 500000,
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce (Sec 153(2A))',
    subcategories: [
      {
        id: 'ecommerce_platform',
        name: 'E-commerce platform transactions',
        section: 'Sec 153(2A)',
        description: 'Online marketplace, digital store sales',
        filerRate: 3,
        nonFilerRate: 5,
        minAmount: 100000,
      },
      {
        id: 'ecommerce_digital',
        name: 'Digital goods & services',
        section: 'Sec 153(2A)',
        description: 'Digital products, software, apps, subscriptions',
        filerRate: 5,
        nonFilerRate: 8,
        minAmount: 50000,
      },
    ],
  },
  {
    id: 'dividends',
    name: 'Dividend, Sukuk & Profit on Debt (Sec 150/150A/151)',
    subcategories: [
      {
        id: 'dividends_filer',
        name: 'Dividend to Filer',
        section: 'Sec 150',
        description: 'Dividend payment to registered taxpayer',
        filerRate: 5,
        nonFilerRate: 15,
      },
      {
        id: 'sukuk_profit',
        name: 'Sukuk & Islamic profit distribution',
        section: 'Sec 150A',
        description: 'Sukuk returns and Islamic profit shares',
        filerRate: 5,
        nonFilerRate: 15,
      },
      {
        id: 'profit_debt',
        name: 'Profit on debt / interest',
        section: 'Sec 151',
        description: 'Interest, profit on loans and advances',
        filerRate: 10,
        nonFilerRate: 15,
      },
    ],
  },
  {
    id: 'non_residents',
    name: 'Payments to Non-Residents (Sec 152)',
    subcategories: [
      {
        id: 'nonres_royalty',
        name: 'Royalty payments',
        section: 'Sec 152',
        description: 'Royalty for patents, copyrights, trademarks',
        filerRate: 10,
        nonFilerRate: 15,
      },
      {
        id: 'nonres_fees',
        name: 'Professional & technical fees',
        section: 'Sec 152',
        description: 'Consultant fees, technical support charges',
        filerRate: 10,
        nonFilerRate: 15,
      },
    ],
  },
  {
    id: 'property_rent',
    name: 'Rent of Property (Sec 155)',
    subcategories: [
      {
        id: 'rent_residential',
        name: 'Residential property rent',
        section: 'Sec 155',
        description: 'Rent on residential buildings/apartments',
        filerRate: 5,
        nonFilerRate: 10,
        minAmount: 50000,
      },
      {
        id: 'rent_commercial',
        name: 'Commercial property rent',
        section: 'Sec 155',
        description: 'Rent on shops, offices, warehouses',
        filerRate: 5,
        nonFilerRate: 10,
        minAmount: 50000,
      },
    ],
  },
  {
    id: 'imports',
    name: 'Imports (Sec 148)',
    subcategories: [
      {
        id: 'imports_raw_materials',
        name: 'Raw materials & components',
        section: 'Sec 148',
        description: 'Import of raw materials, components',
        filerRate: 1.5,
        nonFilerRate: 2,
        minAmount: 500000,
      },
      {
        id: 'imports_finished_goods',
        name: 'Finished goods',
        section: 'Sec 148',
        description: 'Import of finished/ready goods',
        filerRate: 2,
        nonFilerRate: 3,
        minAmount: 500000,
      },
    ],
  },
  {
    id: 'exports',
    name: 'Exports & Digital Receipts (Sec 154/154A/154B)',
    subcategories: [
      {
        id: 'exports_goods',
        name: 'Export of goods',
        section: 'Sec 154',
        description: 'Export of manufactured/processed goods',
        filerRate: 0,
        nonFilerRate: 0,
      },
      {
        id: 'exports_services',
        name: 'Export of services',
        section: 'Sec 154A',
        description: 'Export of services, professional services',
        filerRate: 0,
        nonFilerRate: 6,
        minAmount: 50000,
      },
    ],
  },
  {
    id: 'prizes',
    name: 'Prizes, Winnings & Insurance (Sec 156/156A/151B)',
    subcategories: [
      {
        id: 'prizes_lottery',
        name: 'Lottery & sweepstakes prizes',
        section: 'Sec 156',
        description: 'Lottery winnings, sweepstakes prizes',
        filerRate: 10,
        nonFilerRate: 20,
      },
      {
        id: 'insurance_proceeds',
        name: 'Insurance claim proceeds',
        section: 'Sec 151B',
        description: 'Insurance payouts, claim settlements',
        filerRate: 0,
        nonFilerRate: 0,
      },
    ],
  },
  {
    id: 'cash_withdrawal',
    name: 'Cash Withdrawal & Motor Vehicles (Sec 231AB/231B)',
    subcategories: [
      {
        id: 'cash_withdrawal_cheque',
        name: 'Cash withdrawal against cheque',
        section: 'Sec 231AB',
        description: 'Cash withdrawal from bank via cheque',
        filerRate: 0.3,
        nonFilerRate: 1,
        minAmount: 500000,
      },
      {
        id: 'motor_vehicles',
        name: 'Motor vehicles purchase/sale',
        section: 'Sec 231B',
        description: 'Purchase/sale of motor vehicles',
        filerRate: 1,
        nonFilerRate: 2.5,
        minAmount: 500000,
      },
    ],
  },
  {
    id: 'brokerage',
    name: 'Brokerage & Commission (Sec 233)',
    subcategories: [
      {
        id: 'brokerage_stock',
        name: 'Stock exchange brokerage',
        section: 'Sec 233',
        description: 'Brokerage on stock market transactions',
        filerRate: 0.6,
        nonFilerRate: 1,
      },
      {
        id: 'commission_insurance',
        name: 'Insurance commission',
        section: 'Sec 233',
        description: 'Insurance broker/agent commission',
        filerRate: 3,
        nonFilerRate: 5,
      },
    ],
  },
  {
    id: 'property_transactions',
    name: 'Property Transactions (Sec 236A/C/K)',
    subcategories: [
      {
        id: 'property_sale',
        name: 'Property sale',
        section: 'Sec 236A',
        description: 'Sale of immovable property',
        filerRate: 0.5,
        nonFilerRate: 1.5,
        minAmount: 500000,
      },
      {
        id: 'property_purchase',
        name: 'Property purchase',
        section: 'Sec 236C',
        description: 'Purchase of immovable property',
        filerRate: 0.5,
        nonFilerRate: 1.5,
        minAmount: 500000,
      },
      {
        id: 'vehicle_purchase',
        name: 'Vehicle purchase',
        section: 'Sec 236K',
        description: 'Purchase of vehicles/machinery',
        filerRate: 1,
        nonFilerRate: 2.5,
        minAmount: 500000,
      },
    ],
  },
];

/**
 * Get a specific subcategory by ID and main category
 */
export function getWHTSubCategory(
  category: WHTMainCategory,
  subcategoryId: string
): WHTSubCategory | null {
  const categoryGroup = WHT_CATEGORIES_2025_2026.find((g) => g.id === category);
  if (!categoryGroup) return null;
  return categoryGroup.subcategories.find((s) => s.id === subcategoryId) || null;
}

/**
 * Calculate WHT with hierarchical category structure
 */
export function calculateWHT(input: WHTCalculationInput): WHTCalculationResult {
  const subcategory = getWHTSubCategory(input.category, input.subcategory);

  if (!subcategory) {
    throw new Error(`Invalid WHT category/subcategory: ${input.category}/${input.subcategory}`);
  }

  // Check minimum threshold
  if (subcategory.minAmount && input.amount < subcategory.minAmount) {
    return {
      category: input.category,
      subcategory: input.subcategory,
      subcategoryName: subcategory.name,
      grossAmount: input.amount,
      whtRate: 0,
      whtAmount: 0,
      netAmount: input.amount,
      taxYear: '2025-2026',
      belowMinimumThreshold: true,
      minAmount: subcategory.minAmount,
    };
  }

  const whtRate = input.isFiler ? subcategory.filerRate : subcategory.nonFilerRate;
  const whtAmount = (input.amount * whtRate) / 100;
  const netAmount = input.amount - whtAmount;

  return {
    category: input.category,
    subcategory: input.subcategory,
    subcategoryName: subcategory.name,
    grossAmount: input.amount,
    whtRate,
    whtAmount: Math.round(whtAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    taxYear: '2025-2026',
    belowMinimumThreshold: false,
  };
}

/**
 * Get all subcategories for a main category
 */
export function getWHTSubCategories(category: WHTMainCategory): WHTSubCategory[] {
  const categoryGroup = WHT_CATEGORIES_2025_2026.find((g) => g.id === category);
  return categoryGroup?.subcategories || [];
}

/**
 * Get all main categories
 */
export function getWHTMainCategories(): WHTCategoryGroup[] {
  return WHT_CATEGORIES_2025_2026;
}
