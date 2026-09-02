// Zakat Calculation Types and Logic
// Based on Islamic financing rules and FBR guidelines for Pakistan

export type AssetType = 'cash' | 'gold' | 'silver' | 'stocks' | 'business' | 'crypto' | 'receivables';

export interface ZakatAsset {
  type: AssetType;
  amount: number; // PKR value, except gold and silver which are entered in grams
  currency?: string; // 'PKR', 'USD', 'EUR', etc. for convertible
  purityPercentage?: number; // for gold/silver (0-100)
  unit?: 'grams' | 'tola' | 'troy-ounce' | 'kilogram';
  description?: string;
}

export interface ZakatInput {
  assets: ZakatAsset[];
  hawlStartDate: string; // ISO date (YYYY-MM-DD)
  currentDate: string; // ISO date (YYYY-MM-DD)
  debt: number; // total debt to deduct in PKR
  goldPricePerGram?: number; // in PKR
  silverPricePerGram?: number; // in PKR
}

export interface ZakatCalculationResult {
  totalAssets: number; // in PKR
  totalDebt: number; // in PKR
  zakatable: number; // assets - debt
  nisab: number; // in PKR
  isZakatDue: boolean;
  zakatAmount: number; // 2.5% of zakatable if due
  breakdown: {
    cash: number;
    gold: number;
    silver: number;
    stocks: number;
    business: number;
    crypto: number;
    receivables: number;
  };
  hawlComplete: boolean;
  daysSinceHawl: number;
}

// Nisab calculation (wealth threshold for Zakat)
// Hanafi School: Gold only threshold
// Current Nisab (2025-2026):
// - Gold: 87.48 grams (approximately)
// - Silver: 612.36 grams (approximately)
// Using historical average: 1 gram gold ≈ 12.5 grams silver in value

const NISAB_GOLD_GRAMS = 87.48; // standard nisab in grams
const NISAB_SILVER_GRAMS = 612.36; // silver nisab (approximately 1/10th of gold in value weight)

export function calculateNisab(goldPricePerGram: number, silverPricePerGram: number): number {
  // Nisab is the minimum of gold nisab or silver nisab
  const goldNisab = NISAB_GOLD_GRAMS * goldPricePerGram;
  const silverNisab = NISAB_SILVER_GRAMS * silverPricePerGram;
  
  // Return the lower amount (more restrictive)
  return Math.min(goldNisab, silverNisab);
}

export function calculateZakat(input: ZakatInput): ZakatCalculationResult {
  const { assets, hawlStartDate, currentDate, debt, goldPricePerGram = 15000, silverPricePerGram = 200 } = input;

  // Calculate days since Hawl started
  const hawlStart = new Date(hawlStartDate);
  const current = new Date(currentDate);
  const daysSinceHawl = Math.floor((current.getTime() - hawlStart.getTime()) / (1000 * 60 * 60 * 24));
  const hawlComplete = daysSinceHawl >= 354; // Islamic year (354-355 days)

  // Calculate breakdown by asset type
  const breakdown = {
    cash: 0,
    gold: 0,
    silver: 0,
    stocks: 0,
    business: 0,
    crypto: 0,
    receivables: 0,
  };

  let totalAssets = 0;

  for (const asset of assets) {
    let assetValuePKR = asset.amount;

    const gramsPerUnit = { grams: 1, tola: 11.6638, 'troy-ounce': 31.1035, kilogram: 1000 };
    const metalWeightInGrams = asset.amount * gramsPerUnit[asset.unit || 'grams'];
    if (asset.type === 'gold') {
      assetValuePKR = metalWeightInGrams * goldPricePerGram;
    } else if (asset.type === 'silver') {
      assetValuePKR = metalWeightInGrams * silverPricePerGram;
    }

    // Convert if different currency
    if (asset.type !== 'gold' && asset.type !== 'silver' && asset.currency && asset.currency !== 'PKR') {
      // Simple exchange rates (would use real API in production)
      const exchangeRates: { [key: string]: number } = {
        'USD': 278, // 1 USD = 278 PKR (approx)
        'EUR': 300, // 1 EUR = 300 PKR (approx)
        'GBP': 350, // 1 GBP = 350 PKR (approx)
        'AED': 75, // 1 AED = 75 PKR (approx)
      };
      assetValuePKR = asset.amount * (exchangeRates[asset.currency] || 1);
    }

    // Apply purity percentage if applicable
    if ((asset.type === 'gold' || asset.type === 'silver') && asset.purityPercentage) {
      assetValuePKR = assetValuePKR * (asset.purityPercentage / 100);
    }

    breakdown[asset.type] = assetValuePKR;
    totalAssets += assetValuePKR;
  }

  const nisab = calculateNisab(goldPricePerGram, silverPricePerGram);
  const zakatableAmount = Math.max(0, totalAssets - debt);
  const isZakatDue = zakatableAmount >= nisab && hawlComplete;
  const zakatAmount = isZakatDue ? zakatableAmount * 0.025 : 0; // 2.5%

  return {
    totalAssets,
    totalDebt: debt,
    zakatable: zakatableAmount,
    nisab,
    isZakatDue,
    zakatAmount: Math.round(zakatAmount * 100) / 100, // Round to 2 decimals
    breakdown,
    hawlComplete,
    daysSinceHawl,
  };
}

// Helper to format date for display
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to convert Gregorian to Hijri (approximate)
export function convertToHijri(gregorianDate: Date): { year: number; month: number; day: number } {
  // Simplified conversion (accurate enough for display)
  const jd = gregorianDate.getTime() / 86400000 + 2440587.5;
  const n = jd - 1948439.5;
  const q = Math.floor(n / 10631.5846);
  const r = n % 10631.5846;
  const a = Math.floor(r / 30.4368);
  const w = r % 30.4368;
  const d = Math.floor(w) + 1;

  const hijriYear = 1 + 30 * q + Math.floor(a / 11);
  const hijriMonth = Math.floor(a % 11) + 1;
  const hijriDay = d;

  return { year: hijriYear, month: hijriMonth, day: hijriDay };
}

export const ZAKAT_ASSET_TYPES: { value: AssetType; label: string; description: string }[] = [
  { value: 'cash', label: 'Cash & Bank', description: 'Cash in hand and bank balances' },
  { value: 'gold', label: 'Gold', description: 'Gold jewelry and bullion (in grams)' },
  { value: 'silver', label: 'Silver', description: 'Silver jewelry and bullion (in grams)' },
  { value: 'stocks', label: 'Stocks & Funds', description: 'Shares, mutual funds, securities' },
  { value: 'business', label: 'Business Assets', description: 'Inventory, equipment, receivables' },
  { value: 'crypto', label: 'Cryptocurrencies', description: 'Bitcoin, Ethereum, and other crypto' },
  { value: 'receivables', label: 'Receivables', description: 'Loans given to others' },
];
