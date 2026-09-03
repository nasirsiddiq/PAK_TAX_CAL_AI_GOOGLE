import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileText,
  Globe2,
  Info,
  Landmark,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
  Wheat,
  X,
} from 'lucide-react';
import { TAX_YEARS_CONFIG } from '../data/taxSlabs';
import type { TaxSlab, TaxYear } from '../types/tax';
import { formatPKR } from '../utils/taxCalculator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IncomeKey =
  | 'salary'
  | 'property'
  | 'business'
  | 'capitalGain'
  | 'otherSources'
  | 'foreignSources'
  | 'agriculture';

type StepId =
  | 'intro'
  | 'declaration'
  | 'sources'
  | 'income'
  | 'taxChargeable'
  | 'wealth'
  | 'review'
  | 'receipt';

type HoldingPeriod = '<=1' | '1-2' | '2-3' | '3-4' | '>4';

interface IncomeSourceMeta {
  key: IncomeKey;
  label: string;
  shortLabel: string;
  icon: typeof Briefcase;
  hint: string;
}

const INCOME_SOURCES: IncomeSourceMeta[] = [
  { key: 'salary', label: 'Salary', shortLabel: 'Salary', icon: Briefcase, hint: 'Income from employment' },
  { key: 'property', label: 'Property / Rental Income', shortLabel: 'Property', icon: Building2, hint: 'Rent received from immovable property' },
  { key: 'business', label: 'Income from Business', shortLabel: 'Business', icon: Coins, hint: 'Trading, manufacturing or services profit' },
  { key: 'capitalGain', label: 'Capital Gain', shortLabel: 'Capital Gain', icon: ArrowRight, hint: 'Gain on sale of securities, property or other capital assets' },
  { key: 'otherSources', label: 'Income from Other Sources', shortLabel: 'Other Sources', icon: Wallet, hint: 'Profit on debt, prizes, and other miscellaneous income' },
  { key: 'foreignSources', label: 'Foreign Sources and Assets', shortLabel: 'Foreign Sources', icon: Globe2, hint: 'Income earned outside Pakistan' },
  { key: 'agriculture', label: 'Agricultural Income', shortLabel: 'Agriculture', icon: Wheat, hint: 'Exempt from federal tax, still declared for wealth reconciliation' },
];

const STEPS: { id: Exclude<StepId, 'intro' | 'receipt'>; label: string; icon: typeof Briefcase }[] = [
  { id: 'declaration', label: 'Declaration', icon: User },
  { id: 'sources', label: 'Income Sources', icon: FileText },
  { id: 'income', label: 'Income Details', icon: Coins },
  { id: 'taxChargeable', label: 'Tax Chargeable', icon: Calculator },
  { id: 'wealth', label: 'Wealth Statement', icon: Wallet },
  { id: 'review', label: 'Verify & Submit', icon: ShieldCheck },
];

const TAX_YEAR_OPTIONS: TaxYear[] = ['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'];

// Section 37(1A)-style holding-period reduction on immovable property gains.
// Simplified for practice purposes — confirm the exact schedule for your
// asset type and filing year before using it for a real return.
const HOLDING_PERIOD_OPTIONS: { value: HoldingPeriod; label: string; pct: number }[] = [
  { value: '<=1', label: 'Up to 1 year', pct: 1 },
  { value: '1-2', label: '1 – 2 years', pct: 0.75 },
  { value: '2-3', label: '2 – 3 years', pct: 0.5 },
  { value: '3-4', label: '3 – 4 years', pct: 0.25 },
  { value: '>4', label: 'More than 4 years', pct: 0 },
];
const HOLDING_PERIOD_PCT: Record<HoldingPeriod, number> = HOLDING_PERIOD_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.pct }),
  {} as Record<HoldingPeriod, number>,
);

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-1">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">PKR</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
          placeholder="0"
          className="w-full pl-11 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-medium text-slate-800"
        />
      </div>
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

function ReadRow({ label, value, emphasis }: { label: string; value: string; emphasis?: 'positive' | 'negative' | 'bold' | 'muted' }) {
  const valueClass =
    emphasis === 'positive'
      ? 'text-emerald-700'
      : emphasis === 'negative'
      ? 'text-red-600'
      : emphasis === 'bold'
      ? 'text-slate-900'
      : emphasis === 'muted'
      ? 'text-slate-400'
      : 'text-slate-700';
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Briefcase; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4.5 h-4.5 text-emerald-700" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tax computation (mirrors the credit / slab logic in utils/taxCalculator.ts,
// extended across multiple income sources and modeled on the real IRIS
// 114(1) Return / 116 Wealth Statement structure rather than salary alone)
// ---------------------------------------------------------------------------

function computeSlabTax(taxableIncome: number, slabs: TaxSlab[]) {
  let tax = 0;
  let marginalRate = 0;
  let activeSlab: TaxSlab = slabs[0];
  for (const slab of slabs) {
    const isLast = slab.max === null;
    if (taxableIncome > slab.min && (isLast || taxableIncome <= (slab.max as number))) {
      activeSlab = slab;
      marginalRate = slab.rate * 100;
      tax = slab.baseTax + (taxableIncome - slab.min) * slab.rate;
    }
  }
  return { tax, marginalRate, activeSlab };
}

function creditFor(amount: number, taxableIncome: number, avgRate: number, capFraction: number, absoluteCap?: number): number {
  if (amount <= 0 || taxableIncome <= 0 || avgRate <= 0) return 0;
  let cap = taxableIncome * capFraction;
  if (absoluteCap !== undefined) cap = Math.min(cap, absoluteCap);
  const eligible = Math.min(amount, cap);
  return eligible * avgRate;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface IrisPracticeSimulatorProps {
  /** Called when the user wants to leave the simulator and return to the main site. The site header and other chrome are hidden while this component is mounted, so it needs its own way back. */
  onExit?: () => void;
}

export default function IrisPracticeSimulator({ onExit }: IrisPracticeSimulatorProps) {
  const [step, setStep] = useState<StepId>('intro');

  // Declaration
  const [name, setName] = useState('');
  const [taxYear, setTaxYear] = useState<TaxYear>('2026-2027');
  const [residency, setResidency] = useState<'resident' | 'non-resident'>('resident');

  // Income sources
  const [selectedSources, setSelectedSources] = useState<Record<IncomeKey, boolean>>({
    salary: true,
    property: false,
    business: false,
    capitalGain: false,
    otherSources: false,
    foreignSources: false,
    agriculture: false,
  });
  const [noIncomeDeclared, setNoIncomeDeclared] = useState(false);
  const [activeIncomeTab, setActiveIncomeTab] = useState<IncomeKey>('salary');

  // Per-source income entry
  const [salary, setSalary] = useState({ basic: 0, allowances: 0, bonus: 0 });
  const [property, setProperty] = useState({ grossRent: 0, propertyTax: 0, insurance: 0, groundRent: 0, profitOnDebt: 0 });
  const [business, setBusiness] = useState({
    sales: 0,
    openingStock: 0,
    purchases: 0,
    closingStock: 0,
    adminSellingExpenses: 0,
    financialExpenses: 0,
    otherBusinessIncome: 0,
  });
  const [capitalGain, setCapitalGain] = useState({
    immovablePropertyGain: 0,
    holdingPeriod: '<=1' as HoldingPeriod,
    securitiesGain: 0,
    otherCapitalAssetsGain: 0,
  });
  const [otherSources, setOtherSources] = useState({
    profitOnDebt: 0,
    royalty: 0,
    groundRentSubLease: 0,
    otherIncome: 0,
    dividendIncome: 0,
    prizeWinnings: 0,
  });
  const [foreignSources, setForeignSources] = useState({ income: 0, taxPaid: 0 });
  const [agriculture, setAgriculture] = useState({ income: 0 });

  // Tax chargeable & payments
  const [zakatPaid, setZakatPaid] = useState(0);
  const [isTeacherResearcher, setIsTeacherResearcher] = useState(false);
  const [donationsSec61, setDonationsSec61] = useState(0);
  const [pensionSec62, setPensionSec62] = useState(0);
  const [healthSec62A, setHealthSec62A] = useState(0);
  const [adjustableTax, setAdjustableTax] = useState(0);
  const [finalTax, setFinalTax] = useState(0);
  const [minimumTax, setMinimumTax] = useState(0);

  // Wealth statement
  const [openingNetAssets, setOpeningNetAssets] = useState(0);
  const [foreignImmovableProperty, setForeignImmovableProperty] = useState(0);
  const [foreignBankAccounts, setForeignBankAccounts] = useState(0);
  const [foreignInvestments, setForeignInvestments] = useState(0);
  const [foreignOtherAssets, setForeignOtherAssets] = useState(0);
  const [foreignLiabilities, setForeignLiabilities] = useState(0);
  const [propertyPK, setPropertyPK] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [vehicles, setVehicles] = useState(0);
  const [preciousPossessions, setPreciousPossessions] = useState(0);
  const [cashInHand, setCashInHand] = useState(0);
  const [cashAtBank, setCashAtBank] = useState(0);
  const [otherAssets, setOtherAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [personalExpenses, setPersonalExpenses] = useState(0);
  const [otherInflows, setOtherInflows] = useState(0);
  const [otherOutflows, setOtherOutflows] = useState(0);

  // Submission
  const [ackNumber, setAckNumber] = useState('');
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const activeStepIds: StepId[] = useMemo(() => {
    const base: StepId[] = ['intro', 'declaration', 'sources'];
    if (!noIncomeDeclared) base.push('income');
    base.push('taxChargeable', 'wealth', 'review', 'receipt');
    return base;
  }, [noIncomeDeclared]);

  const selectedKeys = (Object.keys(selectedSources) as IncomeKey[]).filter((k) => selectedSources[k]);

  // -------------------------------------------------------------------------
  // Computation
  // -------------------------------------------------------------------------

  const calc = useMemo(() => {
    const config = TAX_YEARS_CONFIG[taxYear] || TAX_YEARS_CONFIG['2026-2027'];

    // --- Salary ---
    const salaryTaxable = selectedSources.salary
      ? Math.max(0, Number(salary.basic || 0) + Number(salary.allowances || 0) + Number(salary.bonus || 0))
      : 0;

    // --- Property (Sections 15/16 style: rent less repair allowance,
    //     collection charges, tax/insurance/ground rent and loan markup) ---
    const repairAllowance = selectedSources.property ? Number(property.grossRent || 0) * 0.2 : 0;
    const collectionCharges = selectedSources.property ? Number(property.grossRent || 0) * 0.06 : 0;
    const propertyTaxable = selectedSources.property
      ? Math.max(
          0,
          Number(property.grossRent || 0) -
            repairAllowance -
            collectionCharges -
            Number(property.propertyTax || 0) -
            Number(property.insurance || 0) -
            Number(property.groundRent || 0) -
            Number(property.profitOnDebt || 0),
        )
      : 0;

    // --- Business (Trading/Manufacturing account -> P&L) ---
    const costOfGoodsSold = selectedSources.business
      ? Math.max(0, Number(business.openingStock || 0) + Number(business.purchases || 0) - Number(business.closingStock || 0))
      : 0;
    const grossProfit = selectedSources.business ? Number(business.sales || 0) - costOfGoodsSold : 0;
    const businessNetProfit = selectedSources.business
      ? grossProfit - Number(business.adminSellingExpenses || 0) - Number(business.financialExpenses || 0) + Number(business.otherBusinessIncome || 0)
      : 0;
    const businessTaxable = Math.max(0, businessNetProfit);

    // --- Capital Gain (immovable property w/ holding-period reduction,
    //     securities taxed separately u/s 37A, other assets at normal rates) ---
    const immovableGainFull = selectedSources.capitalGain ? Number(capitalGain.immovablePropertyGain || 0) : 0;
    const immovableGainTaxablePct = HOLDING_PERIOD_PCT[capitalGain.holdingPeriod] ?? 1;
    const immovableGainTaxable = immovableGainFull * immovableGainTaxablePct;
    const otherCapitalGainTaxable = selectedSources.capitalGain ? Math.max(0, Number(capitalGain.otherCapitalAssetsGain || 0)) : 0;
    const capitalGainTaxable = Math.max(0, immovableGainTaxable + otherCapitalGainTaxable);
    const securitiesGain = selectedSources.capitalGain ? Number(capitalGain.securitiesGain || 0) : 0;

    // --- Other Sources (profit on debt/royalty/ground rent/misc at normal
    //     rates; dividend & prize winnings sit in their own final-tax block) ---
    const otherTaxable = selectedSources.otherSources
      ? Math.max(
          0,
          Number(otherSources.profitOnDebt || 0) +
            Number(otherSources.royalty || 0) +
            Number(otherSources.groundRentSubLease || 0) +
            Number(otherSources.otherIncome || 0),
        )
      : 0;
    const dividendIncome = selectedSources.otherSources ? Number(otherSources.dividendIncome || 0) : 0;
    const prizeWinnings = selectedSources.otherSources ? Number(otherSources.prizeWinnings || 0) : 0;

    // --- Foreign & Agriculture ---
    const foreignTaxable = selectedSources.foreignSources ? Math.max(0, Number(foreignSources.income || 0)) : 0;
    const agricultureIncome = selectedSources.agriculture ? Math.max(0, Number(agriculture.income || 0)) : 0;

    const totalIncomeBeforeAllowances =
      salaryTaxable + propertyTaxable + businessTaxable + capitalGainTaxable + otherTaxable + foreignTaxable;

    // Deductible Allowance: Zakat paid u/s 60 comes straight off taxable
    // income (it is not a tax credit).
    const deductibleAllowances = Math.min(Number(zakatPaid || 0), totalIncomeBeforeAllowances);
    const totalTaxableIncome = Math.max(0, totalIncomeBeforeAllowances - deductibleAllowances);

    // FBR treats a return as "salary" for slab purposes when salary is the
    // dominant source (broadly, >75% of taxable income). Simplified here:
    // salaried slabs apply whenever salary was declared and is the largest
    // single source; otherwise non-salaried/AOP slabs apply.
    const usesSalariedSlabs =
      selectedSources.salary && salaryTaxable >= Math.max(propertyTaxable, businessTaxable, capitalGainTaxable, otherTaxable, foreignTaxable);
    const slabs = usesSalariedSlabs ? config.salariedSlabs : config.nonSalariedSlabs;

    const { tax: baseTax, marginalRate, activeSlab } = computeSlabTax(totalTaxableIncome, slabs);

    let surcharge = 0;
    if (config.surchargeThreshold && config.surchargeRate && totalTaxableIncome > config.surchargeThreshold) {
      surcharge = baseTax * config.surchargeRate;
    }
    const taxChargeable = baseTax + surcharge;

    // Tax Reduction: full-time teachers/researchers get a 25% reduction, but
    // only on the tax attributable to their salary income.
    const salaryProportion = totalTaxableIncome > 0 ? salaryTaxable / totalTaxableIncome : 0;
    const teacherResearcherReduction = isTeacherResearcher ? taxChargeable * salaryProportion * 0.25 : 0;
    const taxAfterReductions = Math.max(0, taxChargeable - teacherResearcherReduction);

    const avgRate = totalTaxableIncome > 0 ? taxAfterReductions / totalTaxableIncome : 0;

    const donationCredit = creditFor(donationsSec61, totalTaxableIncome, avgRate, 0.3);
    const pensionCredit = creditFor(pensionSec62, totalTaxableIncome, avgRate, 0.2);
    const healthCredit = creditFor(healthSec62A, totalTaxableIncome, avgRate, 0.05, 150000);
    const foreignTaxCredit = selectedSources.foreignSources
      ? Math.min(Number(foreignSources.taxPaid || 0), foreignTaxable * avgRate)
      : 0;

    const totalReductionsAndCredits = teacherResearcherReduction + donationCredit + pensionCredit + healthCredit + foreignTaxCredit;
    const netNormalTax = Math.max(0, taxChargeable - totalReductionsAndCredits);

    // Minimum tax regime: the higher of net normal tax or minimum tax
    // chargeable applies; final/fixed tax is a separate additive block that
    // already discharges liability for its own income.
    const totalTaxChargeableFinal = Math.max(netNormalTax, Number(minimumTax || 0)) + Number(finalTax || 0);
    const netPosition = totalTaxChargeableFinal - Number(adjustableTax || 0);
    const totalTaxPaidAllRegimes = Number(adjustableTax || 0) + Number(finalTax || 0) + Number(minimumTax || 0);

    // --- Wealth reconciliation ---
    const totalForeignAssets = foreignImmovableProperty + foreignBankAccounts + foreignInvestments + foreignOtherAssets;
    const netForeignPosition = totalForeignAssets - foreignLiabilities;
    const totalPersonalAssets = propertyPK + investments + vehicles + preciousPossessions + cashInHand + cashAtBank + otherAssets;
    const netPersonalPosition = totalPersonalAssets - liabilities;
    const closingNetAssets = netForeignPosition + netPersonalPosition;

    // Reconciliation uses the full cash-value of income (capital gain before
    // any holding-period tax relief, since the relief only reduces tax, not
    // the cash actually received) plus the separately-taxed items.
    const grossIncomeForYear =
      salaryTaxable +
      propertyTaxable +
      businessTaxable +
      immovableGainFull +
      otherCapitalGainTaxable +
      securitiesGain +
      otherTaxable +
      dividendIncome +
      prizeWinnings +
      foreignTaxable +
      agricultureIncome;

    const totalOutflows = totalTaxChargeableFinal + personalExpenses + deductibleAllowances + Number(otherOutflows || 0);
    const expectedClosing = openingNetAssets + grossIncomeForYear + Number(otherInflows || 0) - totalOutflows;
    const reconciliationDifference = closingNetAssets - expectedClosing;

    return {
      salaryTaxable,
      repairAllowance,
      collectionCharges,
      propertyTaxable,
      costOfGoodsSold,
      grossProfit,
      businessNetProfit,
      businessTaxable,
      immovableGainFull,
      immovableGainTaxablePct,
      immovableGainTaxable,
      otherCapitalGainTaxable,
      capitalGainTaxable,
      securitiesGain,
      otherTaxable,
      dividendIncome,
      prizeWinnings,
      foreignTaxable,
      agricultureIncome,
      totalIncomeBeforeAllowances,
      deductibleAllowances,
      totalTaxableIncome,
      usesSalariedSlabs,
      baseTax,
      surcharge,
      taxChargeable,
      teacherResearcherReduction,
      taxAfterReductions,
      marginalRate,
      activeSlab,
      avgRate,
      donationCredit,
      pensionCredit,
      healthCredit,
      foreignTaxCredit,
      totalReductionsAndCredits,
      netNormalTax,
      totalTaxChargeableFinal,
      netPosition,
      totalTaxPaidAllRegimes,
      totalForeignAssets,
      netForeignPosition,
      totalPersonalAssets,
      netPersonalPosition,
      closingNetAssets,
      grossIncomeForYear,
      totalOutflows,
      expectedClosing,
      reconciliationDifference,
    };
  }, [
    taxYear,
    selectedSources,
    salary,
    property,
    business,
    capitalGain,
    otherSources,
    foreignSources,
    agriculture,
    zakatPaid,
    isTeacherResearcher,
    donationsSec61,
    pensionSec62,
    healthSec62A,
    adjustableTax,
    finalTax,
    minimumTax,
    openingNetAssets,
    foreignImmovableProperty,
    foreignBankAccounts,
    foreignInvestments,
    foreignOtherAssets,
    foreignLiabilities,
    propertyPK,
    investments,
    vehicles,
    preciousPossessions,
    cashInHand,
    cashAtBank,
    otherAssets,
    liabilities,
    personalExpenses,
    otherInflows,
    otherOutflows,
  ]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  const stepIndex = activeStepIds.indexOf(step);
  const canGoNext = useMemo(() => {
    if (step === 'sources') return noIncomeDeclared || selectedKeys.length > 0;
    return true;
  }, [step, noIncomeDeclared, selectedKeys.length]);

  function goNext() {
    if (step === 'review') {
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      setAckNumber(`PRACTICE-${taxYear.replace('-', '')}-${rand}`);
      setSubmittedAt(new Date());
      setStep('receipt');
      return;
    }
    const next = activeStepIds[stepIndex + 1];
    if (next) {
      if (next === 'income' && !selectedSources[activeIncomeTab]) {
        const firstSelected = selectedKeys[0];
        if (firstSelected) setActiveIncomeTab(firstSelected);
      }
      setStep(next);
      window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    }
  }

  function goBack() {
    const prev = activeStepIds[stepIndex - 1];
    if (prev) setStep(prev);
  }

  function resetAll() {
    setStep('intro');
    setName('');
    setTaxYear('2026-2027');
    setResidency('resident');
    setSelectedSources({
      salary: true,
      property: false,
      business: false,
      capitalGain: false,
      otherSources: false,
      foreignSources: false,
      agriculture: false,
    });
    setNoIncomeDeclared(false);
    setActiveIncomeTab('salary');
    setSalary({ basic: 0, allowances: 0, bonus: 0 });
    setProperty({ grossRent: 0, propertyTax: 0, insurance: 0, groundRent: 0, profitOnDebt: 0 });
    setBusiness({ sales: 0, openingStock: 0, purchases: 0, closingStock: 0, adminSellingExpenses: 0, financialExpenses: 0, otherBusinessIncome: 0 });
    setCapitalGain({ immovablePropertyGain: 0, holdingPeriod: '<=1', securitiesGain: 0, otherCapitalAssetsGain: 0 });
    setOtherSources({ profitOnDebt: 0, royalty: 0, groundRentSubLease: 0, otherIncome: 0, dividendIncome: 0, prizeWinnings: 0 });
    setForeignSources({ income: 0, taxPaid: 0 });
    setAgriculture({ income: 0 });
    setZakatPaid(0);
    setIsTeacherResearcher(false);
    setDonationsSec61(0);
    setPensionSec62(0);
    setHealthSec62A(0);
    setAdjustableTax(0);
    setFinalTax(0);
    setMinimumTax(0);
    setOpeningNetAssets(0);
    setForeignImmovableProperty(0);
    setForeignBankAccounts(0);
    setForeignInvestments(0);
    setForeignOtherAssets(0);
    setForeignLiabilities(0);
    setPropertyPK(0);
    setInvestments(0);
    setVehicles(0);
    setPreciousPossessions(0);
    setCashInHand(0);
    setCashAtBank(0);
    setOtherAssets(0);
    setLiabilities(0);
    setPersonalExpenses(0);
    setOtherInflows(0);
    setOtherOutflows(0);
    setAckNumber('');
    setSubmittedAt(null);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const disclaimerBanner = (
    <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-2.5">
      <Info className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800 leading-relaxed">
        <strong>This is an independent practice simulator, not the real FBR IRIS system.</strong> Nothing you type
        here is saved, transmitted, or sent to FBR — it stays in your browser for this session only. There's no
        login, so use round-figure practice numbers rather than your real financial details. When you're ready to
        file for real, go to <strong>iris.fbr.gov.pk</strong>.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Standing in for the site header, which is hidden while the simulator is
          open so this practice environment feels focused and distraction-free. */}
      <div className="bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-4.5 h-4.5 text-emerald-300" />
            <span className="text-sm font-bold">Pak Tax Calculator</span>
            <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">— Practice Mode</span>
          </div>
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Exit Practice Mode
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
          <h1 className="text-2xl font-extrabold text-slate-900">IRIS Practice Simulator</h1>
        </div>
        <p className="text-sm text-slate-600">
          Practice filing a Pakistan income tax return before doing the real thing on FBR IRIS.
        </p>
      </div>

      {step !== 'intro' && step !== 'receipt' && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max pb-1">
            {STEPS.map((s, i) => {
              const idx = activeStepIds.indexOf(s.id);
              const isSkipped = idx === -1;
              if (isSkipped) return null;
              const isActive = s.id === step;
              const isDone = idx !== -1 && idx < stepIndex;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    <span>
                      {i + 1}. {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className="w-3 h-px bg-slate-300 mx-0.5" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6">
        {step === 'intro' && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Practice your annual return, risk-free</h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Walk through income declaration, tax computation and wealth statement steps modeled on FBR's real
                114(1) Return of Income and 116 Wealth Statement — so the real IRIS portal feels familiar when you
                file for real.
              </p>
            </div>
            {disclaimerBanner}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: FileText, text: 'Declare income across up to 7 source categories' },
                { icon: Calculator, text: 'See tax chargeable, credits and withholding, computed live' },
                { icon: Wallet, text: 'Full Wealth Statement with automatic reconciliation check' },
                { icon: ShieldCheck, text: 'No login, CNIC or password needed — just start practicing' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white rounded-lg border border-slate-200 px-3 py-2.5">
                  <f.icon className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-700">{f.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('declaration')}
              className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Start Your Tax Return Practice <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'declaration' && (
          <div className="space-y-4">
            <SectionCard title="Taxpayer Declaration" icon={User}>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-1">Full Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="For your practice receipt only"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-1">Tax Year</span>
                  <select
                    value={taxYear}
                    onChange={(e) => setTaxYear(e.target.value as TaxYear)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white"
                  >
                    {TAX_YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {TAX_YEARS_CONFIG[y]?.label || y}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="block text-sm font-semibold text-slate-700 mb-1">Residency Status</span>
                  <div className="flex gap-2">
                    {(['resident', 'non-resident'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResidency(r)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                          residency === r
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {r === 'resident' ? 'Resident' : 'Non-Resident'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-500">
              Return Type: <strong className="text-slate-700">Normal Return u/s 114(1)</strong> — for practice purposes only.
            </div>
          </div>
        )}

        {step === 'sources' && (
          <div className="space-y-4">
            <SectionCard title="Add Income Sources" icon={FileText}>
              <p className="text-xs text-slate-500 mb-3">Select every source of income you'd like to practice declaring.</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {INCOME_SOURCES.map((src) => {
                  const Icon = src.icon;
                  const checked = selectedSources[src.key];
                  return (
                    <label
                      key={src.key}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                        noIncomeDeclared
                          ? 'opacity-40 pointer-events-none border-slate-200'
                          : checked
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setSelectedSources((prev) => ({ ...prev, [src.key]: e.target.checked }))}
                        className="mt-0.5 accent-emerald-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-sm font-bold text-slate-800">{src.label}</span>
                        </div>
                        <span className="text-xs text-slate-500">{src.hint}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </SectionCard>
            <label className="flex items-center gap-2.5 bg-white rounded-lg border border-slate-200 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={noIncomeDeclared}
                onChange={(e) => setNoIncomeDeclared(e.target.checked)}
                className="accent-emerald-700"
              />
              <span className="text-sm font-semibold text-slate-700">I have no income from any source to declare</span>
            </label>
            {!noIncomeDeclared && selectedKeys.length === 0 && (
              <p className="text-xs text-red-600 font-semibold">Select at least one income source to continue.</p>
            )}
          </div>
        )}

        {step === 'income' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {selectedKeys.map((key) => {
                const meta = INCOME_SOURCES.find((s) => s.key === key)!;
                const Icon = meta.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveIncomeTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      activeIncomeTab === key ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {meta.shortLabel}
                  </button>
                );
              })}
            </div>

            {activeIncomeTab === 'salary' && selectedSources.salary && (
              <SectionCard title="Employment / Salary Income" icon={Briefcase}>
                <div className="grid sm:grid-cols-3 gap-4">
                  <NumberField label="Basic Salary (Annual)" value={salary.basic} onChange={(v) => setSalary((p) => ({ ...p, basic: v }))} />
                  <NumberField
                    label="Allowances (Annual)"
                    value={salary.allowances}
                    onChange={(v) => setSalary((p) => ({ ...p, allowances: v }))}
                    hint="House rent, medical, conveyance etc."
                  />
                  <NumberField label="Bonus / Commission (Annual)" value={salary.bonus} onChange={(v) => setSalary((p) => ({ ...p, bonus: v }))} />
                </div>
              </SectionCard>
            )}

            {activeIncomeTab === 'property' && selectedSources.property && (
              <SectionCard title="Income from Property" icon={Building2}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Rent Received / Receivable (Annual)"
                    value={property.grossRent}
                    onChange={(v) => setProperty((p) => ({ ...p, grossRent: v }))}
                  />
                  <NumberField
                    label="Property / Local Tax Paid (Annual)"
                    value={property.propertyTax}
                    onChange={(v) => setProperty((p) => ({ ...p, propertyTax: v }))}
                  />
                  <NumberField
                    label="Insurance Premium (Annual)"
                    value={property.insurance}
                    onChange={(v) => setProperty((p) => ({ ...p, insurance: v }))}
                  />
                  <NumberField
                    label="Ground Rent (Annual)"
                    value={property.groundRent}
                    onChange={(v) => setProperty((p) => ({ ...p, groundRent: v }))}
                  />
                  <NumberField
                    label="Profit on Debt (loan for acquiring/constructing the property)"
                    value={property.profitOnDebt}
                    onChange={(v) => setProperty((p) => ({ ...p, profitOnDebt: v }))}
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  <ReadRow label="1/5th Repair Allowance (auto)" value={formatPKR(calc.repairAllowance)} emphasis="muted" />
                  <ReadRow label="Collection Charges, 6% cap (auto)" value={formatPKR(calc.collectionCharges)} emphasis="muted" />
                  <ReadRow label="Taxable Property Income" value={formatPKR(calc.propertyTaxable)} emphasis="bold" />
                </div>
              </SectionCard>
            )}

            {activeIncomeTab === 'business' && selectedSources.business && (
              <SectionCard title="Income from Business" icon={Coins}>
                <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Trading / Manufacturing Account</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField label="Sales / Turnover (Annual)" value={business.sales} onChange={(v) => setBusiness((p) => ({ ...p, sales: v }))} />
                  <NumberField label="Opening Stock (Annual)" value={business.openingStock} onChange={(v) => setBusiness((p) => ({ ...p, openingStock: v }))} />
                  <NumberField label="Purchases (Annual)" value={business.purchases} onChange={(v) => setBusiness((p) => ({ ...p, purchases: v }))} />
                  <NumberField label="Closing Stock (Annual)" value={business.closingStock} onChange={(v) => setBusiness((p) => ({ ...p, closingStock: v }))} />
                </div>
                <div className="mt-3 space-y-1">
                  <ReadRow label="Cost of Goods Sold (auto)" value={formatPKR(calc.costOfGoodsSold)} emphasis="muted" />
                  <ReadRow label="Gross Profit (auto)" value={formatPKR(calc.grossProfit)} emphasis="muted" />
                </div>

                <p className="text-xs text-slate-500 mt-5 mb-3 font-semibold uppercase tracking-wide">Profit & Loss Account</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Administrative & Selling Expenses (Annual)"
                    value={business.adminSellingExpenses}
                    onChange={(v) => setBusiness((p) => ({ ...p, adminSellingExpenses: v }))}
                  />
                  <NumberField
                    label="Financial Expenses (Annual)"
                    value={business.financialExpenses}
                    onChange={(v) => setBusiness((p) => ({ ...p, financialExpenses: v }))}
                    hint="Bank markup and similar finance costs"
                  />
                  <NumberField
                    label="Other Business Income (Annual)"
                    value={business.otherBusinessIncome}
                    onChange={(v) => setBusiness((p) => ({ ...p, otherBusinessIncome: v }))}
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <ReadRow label="Net Profit (auto)" value={formatPKR(calc.businessNetProfit)} emphasis="bold" />
                  {calc.businessNetProfit < 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      This shows as a business loss — real returns can carry a loss forward, which this practice tool doesn't model.
                    </p>
                  )}
                </div>
              </SectionCard>
            )}

            {activeIncomeTab === 'capitalGain' && selectedSources.capitalGain && (
              <SectionCard title="Capital Gain" icon={ArrowRight}>
                <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Gain on Immovable Property</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Gain on Immovable Property (Annual)"
                    value={capitalGain.immovablePropertyGain}
                    onChange={(v) => setCapitalGain((p) => ({ ...p, immovablePropertyGain: v }))}
                  />
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-1">Holding Period</span>
                    <select
                      value={capitalGain.holdingPeriod}
                      onChange={(e) => setCapitalGain((p) => ({ ...p, holdingPeriod: e.target.value as HoldingPeriod }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white"
                    >
                      {HOLDING_PERIOD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label} ({(o.pct * 100).toFixed(0)}% taxable)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <ReadRow label="Taxable Portion (auto)" value={formatPKR(calc.immovableGainTaxable)} emphasis="muted" />

                <p className="text-xs text-slate-500 mt-5 mb-3 font-semibold uppercase tracking-wide">Other Capital Gains</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Gain on Listed Securities / PSX (Annual)"
                    value={capitalGain.securitiesGain}
                    onChange={(v) => setCapitalGain((p) => ({ ...p, securitiesGain: v }))}
                    hint="Taxed separately under Section 37A — shown informationally, not mixed into the normal-rate computation below"
                  />
                  <NumberField
                    label="Gain on Other Capital Assets (Annual)"
                    value={capitalGain.otherCapitalAssetsGain}
                    onChange={(v) => setCapitalGain((p) => ({ ...p, otherCapitalAssetsGain: v }))}
                    hint="Fully taxable at normal rates"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Real holding-period percentages and separate-block rates vary by asset type and filing year — confirm the exact figures before using this for a real return.
                </p>
              </SectionCard>
            )}

            {activeIncomeTab === 'otherSources' && selectedSources.otherSources && (
              <SectionCard title="Income from Other Sources" icon={Wallet}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Profit on Debt / Bank Profit (Annual)"
                    value={otherSources.profitOnDebt}
                    onChange={(v) => setOtherSources((p) => ({ ...p, profitOnDebt: v }))}
                  />
                  <NumberField label="Royalty (Annual)" value={otherSources.royalty} onChange={(v) => setOtherSources((p) => ({ ...p, royalty: v }))} />
                  <NumberField
                    label="Ground Rent / Rent from Sub-Lease (Annual)"
                    value={otherSources.groundRentSubLease}
                    onChange={(v) => setOtherSources((p) => ({ ...p, groundRentSubLease: v }))}
                  />
                  <NumberField
                    label="Other Income Not Falling Under Any Other Head (Annual)"
                    value={otherSources.otherIncome}
                    onChange={(v) => setOtherSources((p) => ({ ...p, otherIncome: v }))}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-5 mb-3 font-semibold uppercase tracking-wide">Taxed Separately (informational)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Dividend Income (Annual)"
                    value={otherSources.dividendIncome}
                    onChange={(v) => setOtherSources((p) => ({ ...p, dividendIncome: v }))}
                    hint="Taxed separately under Section 5 — not mixed into the normal-rate computation below"
                  />
                  <NumberField
                    label="Prize on Prize Bonds / Lottery / Crossword (Annual)"
                    value={otherSources.prizeWinnings}
                    onChange={(v) => setOtherSources((p) => ({ ...p, prizeWinnings: v }))}
                    hint="Final tax regime — withheld at source"
                  />
                </div>
              </SectionCard>
            )}

            {activeIncomeTab === 'foreignSources' && selectedSources.foreignSources && (
              <SectionCard title="Income from Foreign Sources and Assets" icon={Globe2}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <NumberField
                    label="Foreign Income (Annual, PKR equivalent)"
                    value={foreignSources.income}
                    onChange={(v) => setForeignSources((p) => ({ ...p, income: v }))}
                  />
                  <NumberField
                    label="Foreign Tax Already Paid (Annual, PKR equivalent)"
                    value={foreignSources.taxPaid}
                    onChange={(v) => setForeignSources((p) => ({ ...p, taxPaid: v }))}
                    hint="Creditable against your Pakistan tax on this income"
                  />
                </div>
              </SectionCard>
            )}

            {activeIncomeTab === 'agriculture' && selectedSources.agriculture && (
              <SectionCard title="Agricultural Income" icon={Wheat}>
                <NumberField
                  label="Agricultural Income (Annual)"
                  value={agriculture.income}
                  onChange={(v) => setAgriculture({ income: v })}
                />
                <p className="text-xs text-slate-500 mt-3">
                  Exempt from federal income tax (may attract provincial agricultural income tax). It's still declared
                  here so your Wealth Statement reconciliation below balances correctly.
                </p>
              </SectionCard>
            )}
          </div>
        )}

        {step === 'taxChargeable' && (
          <div className="space-y-4">
            <SectionCard title="Deductible Allowances" icon={Wallet}>
              <NumberField
                label="Zakat Paid (Annual, u/s 60)"
                value={zakatPaid}
                onChange={setZakatPaid}
                hint="Deducted directly from taxable income — not a tax credit"
              />
            </SectionCard>

            <SectionCard title="Tax Reductions" icon={ShieldCheck}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTeacherResearcher}
                  onChange={(e) => setIsTeacherResearcher(e.target.checked)}
                  className="accent-emerald-700"
                />
                <span className="text-sm font-semibold text-slate-700">
                  I am a full-time Teacher or Researcher (25% reduction on the tax attributable to salary income)
                </span>
              </label>
            </SectionCard>

            <SectionCard title="Tax Credits" icon={Calculator}>
              <div className="grid sm:grid-cols-3 gap-4">
                <NumberField label="Charitable Donations (u/s 61)" value={donationsSec61} onChange={setDonationsSec61} hint="Capped at 30% of taxable income" />
                <NumberField label="VPS Pension Contribution (u/s 62)" value={pensionSec62} onChange={setPensionSec62} hint="Capped at 20% of taxable income" />
                <NumberField label="Health Insurance Premium (u/s 62A)" value={healthSec62A} onChange={setHealthSec62A} hint="Capped at 5% of taxable income or Rs. 150,000" />
              </div>
            </SectionCard>

            <SectionCard title="Withholding & Advance Tax Paid" icon={Landmark}>
              <div className="grid sm:grid-cols-3 gap-4">
                <NumberField label="Adjustable Tax Withheld" value={adjustableTax} onChange={setAdjustableTax} hint="Adjusted against your net tax chargeable below" />
                <NumberField label="Final Tax Withheld" value={finalTax} onChange={setFinalTax} hint="Discharges liability for that income — added on top" />
                <NumberField label="Minimum Tax Withheld" value={minimumTax} onChange={setMinimumTax} hint="Compared with normal tax; higher of the two applies" />
              </div>
            </SectionCard>

            <SectionCard title="Computations" icon={Calculator}>
              <ReadRow label="Total Income (all sources)" value={formatPKR(calc.totalIncomeBeforeAllowances)} />
              <ReadRow label="Less: Deductible Allowances (Zakat)" value={`- ${formatPKR(calc.deductibleAllowances)}`} emphasis="positive" />
              <ReadRow label="Taxable Income" value={formatPKR(calc.totalTaxableIncome)} emphasis="bold" />
              <ReadRow label="Slab Applied" value={calc.usesSalariedSlabs ? 'Salaried Individual' : 'Non-Salaried / AOP'} />
              <ReadRow label={`Marginal Rate (${calc.activeSlab.rate * 100}%)`} value={`${calc.marginalRate.toFixed(0)}%`} />
              <div className="h-px bg-slate-200 my-2" />
              <ReadRow label="Tax Chargeable on Taxable Income" value={formatPKR(calc.baseTax)} />
              {calc.surcharge > 0 && <ReadRow label="Surcharge" value={formatPKR(calc.surcharge)} />}
              {calc.teacherResearcherReduction > 0 && (
                <ReadRow label="Less: Tax Reduction (Teacher/Researcher)" value={`- ${formatPKR(calc.teacherResearcherReduction)}`} emphasis="positive" />
              )}
              <ReadRow
                label="Less: Tax Credits (donations, pension, health, foreign)"
                value={`- ${formatPKR(calc.totalReductionsAndCredits - calc.teacherResearcherReduction)}`}
                emphasis="positive"
              />
              <ReadRow label="Net Tax Chargeable (normal)" value={formatPKR(calc.netNormalTax)} emphasis="bold" />
              {minimumTax > calc.netNormalTax && (
                <ReadRow label="Minimum Tax Chargeable applies instead" value={formatPKR(minimumTax)} emphasis="negative" />
              )}
              {finalTax > 0 && <ReadRow label="Plus: Final / Fixed Tax (separate block)" value={`+ ${formatPKR(finalTax)}`} />}
              <ReadRow label="Total Tax Chargeable" value={formatPKR(calc.totalTaxChargeableFinal)} emphasis="bold" />
              <ReadRow label="Less: Adjustable Tax Paid" value={`- ${formatPKR(adjustableTax)}`} emphasis="positive" />
              <div className="h-px bg-slate-200 my-2" />
              <ReadRow
                label={calc.netPosition >= 0 ? 'Tax Payable' : 'Refundable'}
                value={formatPKR(Math.abs(calc.netPosition))}
                emphasis={calc.netPosition >= 0 ? 'negative' : 'positive'}
              />
              {(calc.securitiesGain > 0 || calc.dividendIncome > 0 || calc.prizeWinnings > 0) && (
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  Not included above — taxed separately: securities gain {formatPKR(calc.securitiesGain)}, dividend income{' '}
                  {formatPKR(calc.dividendIncome)}, prize winnings {formatPKR(calc.prizeWinnings)}.
                </p>
              )}
            </SectionCard>
          </div>
        )}

        {step === 'wealth' && (
          <div className="space-y-4">
            <SectionCard title="116A — Foreign Assets & Liabilities" icon={Globe2}>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumberField label="Foreign Immovable Property" value={foreignImmovableProperty} onChange={setForeignImmovableProperty} />
                <NumberField label="Foreign Bank Accounts" value={foreignBankAccounts} onChange={setForeignBankAccounts} />
                <NumberField label="Foreign Investments / Securities" value={foreignInvestments} onChange={setForeignInvestments} />
                <NumberField label="Other Foreign Assets" value={foreignOtherAssets} onChange={setForeignOtherAssets} />
                <NumberField label="Foreign Liabilities (loans payable)" value={foreignLiabilities} onChange={setForeignLiabilities} />
              </div>
              <ReadRow label="Total Foreign Assets (auto)" value={formatPKR(calc.totalForeignAssets)} emphasis="muted" />
            </SectionCard>

            <SectionCard title="Personal Assets (Pakistan)" icon={Wallet}>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumberField label="Immovable Property" value={propertyPK} onChange={setPropertyPK} />
                <NumberField label="Investments / Securities / Insurance" value={investments} onChange={setInvestments} />
                <NumberField label="Motor Vehicles" value={vehicles} onChange={setVehicles} />
                <NumberField label="Precious Possessions (Jewelry / Gold)" value={preciousPossessions} onChange={setPreciousPossessions} />
                <NumberField label="Cash in Hand" value={cashInHand} onChange={setCashInHand} />
                <NumberField label="Cash at Bank" value={cashAtBank} onChange={setCashAtBank} />
                <NumberField label="Other Assets" value={otherAssets} onChange={setOtherAssets} />
                <NumberField label="Personal Liabilities (loans, payables)" value={liabilities} onChange={setLiabilities} />
              </div>
              <ReadRow label="Total Personal Assets (auto)" value={formatPKR(calc.totalPersonalAssets)} emphasis="muted" />
            </SectionCard>

            <SectionCard title="Personal Expenses, Other Flows & Opening Position" icon={Coins}>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumberField label="Personal / Household Expenses (Annual)" value={personalExpenses} onChange={setPersonalExpenses} />
                <NumberField
                  label="Opening Net Assets (Last Year's Closing)"
                  value={openingNetAssets}
                  onChange={setOpeningNetAssets}
                />
                <NumberField
                  label="Other Inflows (Annual)"
                  value={otherInflows}
                  onChange={setOtherInflows}
                  hint="Gifts, loans or inheritance received, foreign remittances"
                />
                <NumberField
                  label="Other Outflows (Annual)"
                  value={otherOutflows}
                  onChange={setOtherOutflows}
                  hint="Gifts or loans given, other payments not claimed as a credit above"
                />
              </div>
            </SectionCard>

            <SectionCard title="Reconciliation of Net Assets" icon={ShieldCheck}>
              <ReadRow label="Opening Net Assets" value={formatPKR(openingNetAssets)} />
              <ReadRow label="Income for the Year (incl. exempt & separately-taxed)" value={`+ ${formatPKR(calc.grossIncomeForYear)}`} emphasis="positive" />
              <ReadRow label="Other Inflows" value={`+ ${formatPKR(otherInflows)}`} emphasis="positive" />
              <ReadRow label="Total Tax Chargeable" value={`- ${formatPKR(calc.totalTaxChargeableFinal)}`} emphasis="negative" />
              <ReadRow label="Zakat Paid" value={`- ${formatPKR(calc.deductibleAllowances)}`} emphasis="negative" />
              <ReadRow label="Personal Expenses" value={`- ${formatPKR(personalExpenses)}`} emphasis="negative" />
              <ReadRow label="Other Outflows" value={`- ${formatPKR(otherOutflows)}`} emphasis="negative" />
              <div className="h-px bg-slate-200 my-2" />
              <ReadRow label="Expected Closing Net Assets" value={formatPKR(calc.expectedClosing)} />
              <ReadRow label="Actual Closing Net Assets (from Assets/Liabilities above)" value={formatPKR(calc.closingNetAssets)} emphasis="bold" />
              <ReadRow
                label="Reconciliation Difference"
                value={formatPKR(calc.reconciliationDifference)}
                emphasis={calc.reconciliationDifference < 0 ? 'negative' : 'positive'}
              />

              {calc.reconciliationDifference < 0 ? (
                <div className="mt-3 bg-red-50 border border-red-300 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-800 leading-relaxed">
                    <strong>Negative:</strong> Probably you have
                    <br />• Under Declared Your Assets And Expenses.
                    <br />• Overdeclared Your Income.
                    <br />
                    <span className="text-red-600">(This mirrors the warning IRIS shows for real returns — try adjusting your entries.)</span>
                  </p>
                </div>
              ) : (
                <div className="mt-3 bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">Your Wealth Statement reconciles.</p>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            {disclaimerBanner}
            <SectionCard title="Declaration Summary" icon={User}>
              <ReadRow label="Name" value={name || 'Practice User'} />
              <ReadRow label="Tax Year" value={TAX_YEARS_CONFIG[taxYear]?.label || taxYear} />
              <ReadRow label="Residency" value={residency === 'resident' ? 'Resident' : 'Non-Resident'} />
              <ReadRow
                label="Income Sources"
                value={
                  noIncomeDeclared
                    ? 'No income declared'
                    : selectedKeys.map((k) => INCOME_SOURCES.find((s) => s.key === k)!.shortLabel).join(', ') || '—'
                }
              />
            </SectionCard>
            <SectionCard title="Tax Chargeable & Payments" icon={Calculator}>
              <ReadRow label="Taxable Income" value={formatPKR(calc.totalTaxableIncome)} />
              <ReadRow label="Tax Chargeable (before reductions/credits)" value={formatPKR(calc.taxChargeable)} />
              <ReadRow label="Total Reductions & Credits" value={formatPKR(calc.totalReductionsAndCredits)} />
              <ReadRow label="Total Tax Chargeable (incl. final/minimum tax)" value={formatPKR(calc.totalTaxChargeableFinal)} />
              <ReadRow
                label={calc.netPosition >= 0 ? 'Tax Payable' : 'Refundable'}
                value={formatPKR(Math.abs(calc.netPosition))}
                emphasis={calc.netPosition >= 0 ? 'negative' : 'positive'}
              />
            </SectionCard>
            <SectionCard title="Wealth Statement" icon={Wallet}>
              <ReadRow label="Closing Net Assets" value={formatPKR(calc.closingNetAssets)} />
              <ReadRow
                label="Reconciliation Status"
                value={calc.reconciliationDifference < 0 ? 'Not Reconciled' : 'Reconciled'}
                emphasis={calc.reconciliationDifference < 0 ? 'negative' : 'positive'}
              />
            </SectionCard>
          </div>
        )}

        {step === 'receipt' && (
          <div className="max-w-md mx-auto text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Practice Return Submitted</h2>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1">Practice Only — Not Filed With FBR</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-left space-y-1.5">
              <ReadRow label="Practice Ack. No." value={ackNumber} emphasis="bold" />
              <ReadRow label="Filed By" value={name || 'Practice User'} />
              <ReadRow label="Tax Year" value={TAX_YEARS_CONFIG[taxYear]?.label || taxYear} />
              <ReadRow label="Date & Time" value={submittedAt ? submittedAt.toLocaleString('en-PK') : ''} />
              <div className="h-px bg-slate-200 my-2" />
              <ReadRow label="Taxable Income" value={formatPKR(calc.totalTaxableIncome)} />
              <ReadRow
                label={calc.netPosition >= 0 ? 'Tax Payable' : 'Refundable'}
                value={formatPKR(Math.abs(calc.netPosition))}
                emphasis={calc.netPosition >= 0 ? 'negative' : 'positive'}
              />
            </div>
            <p className="text-xs text-slate-500">
              Nice work — you've walked through the full flow. When you're ready to file your real return, head to{' '}
              <a
                href="https://iris.fbr.gov.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold underline"
              >
                iris.fbr.gov.pk
              </a>
              .
            </p>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Start New Practice Return
            </button>
          </div>
        )}
      </div>

      {step !== 'intro' && step !== 'receipt' && (
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={goBack}
            disabled={stepIndex <= 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 disabled:hover:bg-emerald-800 transition-colors"
          >
            {step === 'review' ? 'Submit Practice Return' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
