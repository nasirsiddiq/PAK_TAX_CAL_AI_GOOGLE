import React, { useState } from 'react';
import {
  Landmark,
  Building,
  Receipt,
  Wheat,
  Car,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Percent,
  Calculator,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  CreditCard,
} from 'lucide-react';
import {
  Province,
  ProvincialAuthority,
  ProvincialModule,
} from '../types/provincialTax';
import {
  PROVINCES_CONFIG,
  PROVINCIAL_SERVICES_CATALOG,
  AGRI_LAND_SLABS,
  AGRI_INCOME_SLABS,
  PROVINCIAL_PROPERTY_RATES,
  VEHICLE_TOKEN_SLABS,
  PUNJAB_PROFESSIONAL_TAX_SLABS,
} from '../data/provincialTaxData';
import { formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';

export const ProvincialTaxCalculator: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province>('punjab');
  const [activeModule, setActiveModule] = useState<ProvincialModule>('services-tax');

  // --- Module 1: Services Sales Tax State ---
  const currentServicesList = PROVINCIAL_SERVICES_CATALOG[selectedProvince] || [];
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    currentServicesList[0]?.id || 'general-consulting'
  );
  const [invoiceAmount, setInvoiceAmount] = useState<number>(100000); // 1 Lakh
  const [isDigitalPayment, setIsDigitalPayment] = useState<boolean>(true);
  const [isWithholdingAgent, setIsWithholdingAgent] = useState<boolean>(false);
  const [inputTaxAmount, setInputTaxAmount] = useState<number>(0);

  // --- Module 2: Agricultural Income Tax State ---
  const [agriAssessmentMode, setAgriAssessmentMode] = useState<'acreage' | 'income'>('acreage');
  const [landAcres, setLandAcres] = useState<number>(35); // 35 acres
  const [landType, setLandType] = useState<'irrigated' | 'barani'>('irrigated');
  const [agriAnnualIncome, setAgriAnnualIncome] = useState<number>(2500000); // 25 Lakhs
  const [agriExpenses, setAgriExpenses] = useState<number>(800000); // 8 Lakhs

  // --- Module 3: Property Transfer & Stamp Duty State ---
  const [propertyDCValue, setPropertyDCValue] = useState<number>(15000000); // 1.5 Crore
  const [isFilerBuyer, setIsFilerBuyer] = useState<boolean>(true);

  // --- Module 4: Motor Vehicle Token Tax State ---
  const [vehicleCCIndex, setVehicleCCIndex] = useState<number>(2); // 1301 - 1600cc

  // --- Module 5: Professional Tax State ---
  const [profTaxCategory, setProfTaxCategory] = useState<'salaried' | 'business' | 'company'>('salaried');
  const [monthlyGrossSalary, setMonthlyGrossSalary] = useState<number>(250000);

  const provinceConfig = PROVINCES_CONFIG[selectedProvince];
  const activeService =
    currentServicesList.find((s) => s.id === selectedServiceId) || currentServicesList[0];

  // Helper 1: Calculate Provincial Services Tax
  const calculateServicesTax = () => {
    if (!activeService) return { rate: 0.16, taxAmount: 0, whtAmount: 0, netToVendor: 0, finalRatePercent: 16 };

    let effectiveRate = activeService.standardRate;

    // Check for concessionary rate or digital POS rate
    if (isDigitalPayment && activeService.digitalPaymentRate !== undefined) {
      effectiveRate = activeService.digitalPaymentRate;
    } else if (activeService.concessionaryRate !== undefined) {
      effectiveRate = activeService.concessionaryRate;
    }

    const outputTax = invoiceAmount * effectiveRate;
    const netTaxPayableToAuthority = Math.max(0, outputTax - inputTaxAmount);
    const totalInvoiceWithTax = invoiceAmount + outputTax;

    // Withholding deduction
    const whtRate = activeService.withholdingRate || effectiveRate;
    const whtDeduction = isWithholdingAgent ? invoiceAmount * whtRate : 0;
    const netPaymentToVendor = totalInvoiceWithTax - whtDeduction;

    return {
      rate: effectiveRate,
      finalRatePercent: effectiveRate * 100,
      outputTax,
      inputTaxAmount,
      netTaxPayableToAuthority,
      totalInvoiceWithTax,
      whtDeduction,
      netPaymentToVendor,
    };
  };

  // Helper 2: Calculate Agricultural Income Tax
  const calculateAgriTax = () => {
    if (agriAssessmentMode === 'acreage') {
      const landSlabs = AGRI_LAND_SLABS[selectedProvince] || AGRI_LAND_SLABS.punjab;
      let totalLandTax = 0;

      // Tiered / Marginal calculation on land acreage
      for (const slab of landSlabs) {
        if (landAcres > slab.minAcres) {
          const taxableAcresInSlab = slab.maxAcres
            ? Math.min(landAcres, slab.maxAcres) - slab.minAcres
            : landAcres - slab.minAcres;
          const slabRate = landType === 'irrigated' ? slab.ratePerAcreIrrigated : slab.ratePerAcreBarani;
          totalLandTax += taxableAcresInSlab * slabRate;
        }
      }

      return {
        mode: 'acreage',
        totalTax: totalLandTax,
        rateDesc: `Land holding of ${landAcres} acres (${landType === 'irrigated' ? 'Irrigated / Canal' : 'Barani / Rain-fed'})`,
      };
    } else {
      // Net farm income basis
      const netTaxableAgriIncome = Math.max(0, agriAnnualIncome - agriExpenses);
      const incomeSlabs = AGRI_INCOME_SLABS[selectedProvince] || AGRI_INCOME_SLABS.punjab;
      let totalIncomeTax = 0;
      let activeSlabDesc = '';

      for (const slab of incomeSlabs) {
        if (netTaxableAgriIncome > slab.minIncome) {
          if (slab.maxIncome === null || netTaxableAgriIncome <= slab.maxIncome) {
            const excess = netTaxableAgriIncome - slab.minIncome;
            totalIncomeTax = slab.baseTax + excess * slab.rate;
            activeSlabDesc = slab.description;
            break;
          }
        }
      }

      return {
        mode: 'income',
        netTaxableAgriIncome,
        totalTax: totalIncomeTax,
        rateDesc: activeSlabDesc,
      };
    }
  };

  // Helper 3: Calculate Property Transfer Costs
  const calculatePropertyTransfer = () => {
    const rates = PROVINCIAL_PROPERTY_RATES[selectedProvince] || PROVINCIAL_PROPERTY_RATES.punjab;
    const stampDuty = propertyDCValue * rates.stampDutyRate;
    const cvt = propertyDCValue * rates.cvtRate;
    const tmaTax = propertyDCValue * rates.tmaTownTaxRate;
    const regFee = rates.registrationFeeFixedOrRate.includes('1%')
      ? propertyDCValue * 0.01
      : 1500;

    const totalProvincial = stampDuty + cvt + tmaTax + regFee;
    const federalWHTRate = isFilerBuyer ? 0.03 : 0.12; // 236K Advance Tax
    const federalWHT = propertyDCValue * federalWHTRate;
    const grandTotal = totalProvincial + federalWHT;

    return {
      stampDuty,
      cvt,
      tmaTax,
      regFee,
      totalProvincial,
      federalWHT,
      grandTotal,
      rates,
    };
  };

  const servicesResult = calculateServicesTax();
  const agriResult = calculateAgriTax();
  const propertyResult = calculatePropertyTransfer();
  const selectedVehicleSlab = VEHICLE_TOKEN_SLABS[vehicleCCIndex];

  return (
    <div className="space-y-6">
      {/* Top Provincial Authority Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-700/50">
              <Landmark className="w-3.5 h-3.5" />
              Pakistan Provincial Revenue Engine
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Provincial Tax Calculator ({provinceConfig.authority} &bull; {provinceConfig.name})
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Calculate official taxes levied by Provincial Revenue Authorities (PRA Punjab, SRB Sindh, KPRA Khyber Pakhtunkhwa, BRA Balochistan, and ICT Islamabad) — including Sales Tax on Services, Agricultural Income Tax, Stamp Duty & CVT, Vehicle Token Tax, and Professional Tax.
            </p>
          </div>

          {/* Quick Authority Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px] space-y-1.5">
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
              Active Provincial Authority
            </span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              {provinceConfig.authority} ({provinceConfig.name})
            </div>
            <div className="text-xs text-slate-300">
              Standard Services Tax: <span className="font-bold text-emerald-300">{(provinceConfig.standardServicesRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Province Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>Select Province / Territory:</span>
          </div>

          {/* Province Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(PROVINCES_CONFIG) as Province[]).map((provKey) => {
              const p = PROVINCES_CONFIG[provKey];
              const isSelected = selectedProvince === provKey;
              return (
                <button
                  key={provKey}
                  type="button"
                  onClick={() => setSelectedProvince(provKey)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-600/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] opacity-75 uppercase font-bold">{p.authority}</span>
                  <span className="text-xs font-extrabold mt-0.5">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Provincial Tax Module Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80">
        <button
          onClick={() => setActiveModule('services-tax')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModule === 'services-tax'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-600" />
          <span>1. Sales Tax on Services ({provinceConfig.authority})</span>
        </button>

        <button
          onClick={() => setActiveModule('agricultural-tax')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModule === 'agricultural-tax'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wheat className="w-4 h-4 text-emerald-600" />
          <span>2. Agricultural Income Tax (AIT)</span>
        </button>

        <button
          onClick={() => setActiveModule('property-stamp-duty')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModule === 'property-stamp-duty'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-600" />
          <span>3. Property Stamp Duty & CVT</span>
        </button>

        <button
          onClick={() => setActiveModule('vehicle-token-tax')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModule === 'vehicle-token-tax'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4 text-emerald-600" />
          <span>4. Vehicle Token Tax (Excise)</span>
        </button>

        <button
          onClick={() => setActiveModule('professional-tax')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeModule === 'professional-tax'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>5. Professional Tax</span>
        </button>
      </div>

      {/* ========================================================
          1. PROVINCIAL SALES TAX ON SERVICES (PRA, SRB, KPRA, BRA, ICT)
          ======================================================== */}
      {activeModule === 'services-tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Invoice & Service Config */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                {provinceConfig.authority} Services Tax Invoice Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Calculate provincial sales tax, reduced concessionary rates for digital/card payments, and withholding tax obligations.
              </p>
            </div>

            {/* Service Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Service Classification / Sector:
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {currentServicesList.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name} ({svc.code}) - {(svc.standardRate * 100).toFixed(0)}%
                  </option>
                ))}
              </select>
              {activeService && (
                <p className="text-[11px] text-slate-500 italic mt-1">
                  {activeService.description}
                </p>
              )}
            </div>

            {/* Invoice Amount Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Gross Value of Service Rendered (PKR):
                </label>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {formatPakistaniUnits(invoiceAmount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={invoiceAmount || ''}
                  onChange={(e) => setInvoiceAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Payment Method / POS Digital Rate */}
            {activeService?.digitalPaymentRate !== undefined && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  Payment Channel (Reduced POS Rate Available):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDigitalPayment(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isDigitalPayment
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-white text-slate-700 border-emerald-200'
                    }`}
                  >
                    Digital POS / Card ({(activeService.digitalPaymentRate * 100).toFixed(0)}%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDigitalPayment(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      !isDigitalPayment
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-white text-slate-700 border-emerald-200'
                    }`}
                  >
                    Cash ({(activeService.standardRate * 100).toFixed(0)}%)
                  </button>
                </div>
              </div>
            )}

            {/* Input Tax Credit (for registered businesses) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Input Sales Tax Credit Deductible (if any):</span>
                <span className="font-mono text-emerald-700 font-bold">{formatPKR(inputTaxAmount)}</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputTaxAmount || ''}
                onChange={(e) => setInputTaxAmount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            {/* Withholding Agent Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
              <input
                id="wht-agent-checkbox"
                type="checkbox"
                checked={isWithholdingAgent}
                onChange={(e) => setIsWithholdingAgent(e.target.checked)}
                className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="wht-agent-checkbox" className="text-xs text-slate-700 cursor-pointer leading-tight">
                <span className="font-bold text-slate-900">Buyer is a Provincial Withholding Agent:</span> Deduct sales tax at source under {provinceConfig.authority} Withholding Rules (e.g. Government, Large Corporate, or Public Company).
              </label>
            </div>
          </div>

          {/* Right Card: Provincial Tax Summary */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              {provinceConfig.authority} Tax Liability Summary
            </h4>

            {/* Hero Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Total Invoice Value (Including {servicesResult.finalRatePercent.toFixed(1)}% Sales Tax)
              </span>
              <div className="text-3xl font-black font-mono text-white">
                {formatPKR(servicesResult.totalInvoiceWithTax)}
              </div>
              <div className="text-xs text-emerald-200">
                Sales Tax Charged: <span className="font-bold text-white font-mono">{formatPKR(servicesResult.outputTax)}</span> &bull; {provinceConfig.authorityFullName}
              </div>
            </div>

            {/* Calculation Grid Breakdown */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">Base Value</span>
                <div className="text-base font-bold text-slate-900">{formatPKR(invoiceAmount)}</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-emerald-800 uppercase block">
                  Tax Rate Applied
                </span>
                <div className="text-base font-bold text-emerald-900">{servicesResult.finalRatePercent.toFixed(1)}%</div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-rose-800 uppercase block">
                  Withholding Tax u/s WHT Rules
                </span>
                <div className="text-base font-bold text-rose-700">{formatPKR(servicesResult.whtDeduction)}</div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-emerald-300 uppercase block">
                  Net Transferred to Vendor
                </span>
                <div className="text-base font-bold text-emerald-300">{formatPKR(servicesResult.netPaymentToVendor)}</div>
              </div>
            </div>

            {/* Statutory Notes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {provinceConfig.authority} Statutory Compliance Rules:
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {activeService?.notes}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Official E-Filing Portal:</span>
                <a
                  href={provinceConfig.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  {provinceConfig.authority} Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. AGRICULTURAL INCOME TAX (AIT)
          ======================================================== */}
      {activeModule === 'agricultural-tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-600" />
                {provinceConfig.name} Agricultural Income Tax (AIT)
              </h3>
              <p className="text-xs text-slate-500">
                Agricultural income is exempt from Federal FBR income tax under Section 41, but subject to Provincial Agricultural Income Tax.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Assessment Calculation Method:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAgriAssessmentMode('acreage')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    agriAssessmentMode === 'acreage'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Land Acreage Basis (Per Acre)
                </button>
                <button
                  type="button"
                  onClick={() => setAgriAssessmentMode('income')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    agriAssessmentMode === 'income'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Net Farm Income Slabs
                </button>
              </div>
            </div>

            {/* Acreage Mode Controls */}
            {agriAssessmentMode === 'acreage' ? (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Total Cultivated Land Holding (Acres):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={landAcres || ''}
                    onChange={(e) => setLandAcres(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="text-[11px] text-slate-500">
                    Up to 12.5 acres is completely exempt from land revenue tax.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Irrigation Classification:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLandType('irrigated')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        landType === 'irrigated'
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Irrigated / Canal (Nehri / Chahi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLandType('barani')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        landType === 'barani'
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Barani / Rain-Fed (Un-irrigated)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Income Mode Controls */
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Gross Annual Farm Receipts / Crop Sales (PKR):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={agriAnnualIncome || ''}
                    onChange={(e) => setAgriAnnualIncome(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="text-xs text-emerald-800 font-bold font-mono">
                    {formatPakistaniUnits(agriAnnualIncome)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Allowable Farming Expenses (Seeds, Fertilizer, Diesel, Labor) (PKR):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={agriExpenses || ''}
                    onChange={(e) => setAgriExpenses(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Provincial Agricultural Tax Result
            </h4>

            <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                Annual Agricultural Income Tax Payable
              </span>
              <div className="text-3xl font-black font-mono text-white">
                {formatPKR(agriResult.totalTax)}
              </div>
              <div className="text-xs text-teal-200">
                Assessment Basis: <span className="font-bold text-white">{agriResult.rateDesc}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Federal vs Provincial Tax Status:
              </div>
              <p className="leading-relaxed text-[11px] text-slate-600">
                Under Section 41 of the Federal Income Tax Ordinance 2001, agricultural income is 100% exempt from Federal FBR income tax. However, paying your Provincial Agricultural Tax and obtaining the Provincial Challan receipt is required to legally document your agricultural earnings in your annual wealth statement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. PROPERTY TRANSFER, STAMP DUTY & CVT
          ======================================================== */}
      {activeModule === 'property-stamp-duty' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                {provinceConfig.name} Property Stamp Duty & Transfer Charges
              </h3>
              <p className="text-xs text-slate-500">
                Calculate official provincial charges (Stamp Duty, CVT, TMA Town Tax, Registration Fee) alongside Federal Advance Tax.
              </p>
            </div>

            {/* Property Value Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  DC Valuation or Agreement Value (PKR):
                </label>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {formatPakistaniUnits(propertyDCValue)}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="500000"
                value={propertyDCValue || ''}
                onChange={(e) => setPropertyDCValue(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Buyer Filer Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Buyer ATL Status (for Federal WHT u/s 236K):</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilerBuyer(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isFilerBuyer
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Active Filer (3% Federal WHT)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilerBuyer(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !isFilerBuyer
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Non-Filer (12% Federal WHT)
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Total Property Transfer Breakdown ({provinceConfig.name})
            </h4>

            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Total Combined Taxes at Registration
              </span>
              <div className="text-3xl font-black font-mono text-emerald-300">
                {formatPKR(propertyResult.grandTotal)}
              </div>
              <div className="text-xs text-slate-300">
                Provincial Charges: <span className="text-white font-bold">{formatPKR(propertyResult.totalProvincial)}</span> + Federal WHT: <span className="text-white font-bold">{formatPKR(propertyResult.federalWHT)}</span>
              </div>
            </div>

            {/* Provincial Itemized List */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs font-mono">
              <div className="flex justify-between p-3 bg-slate-50 font-sans font-bold text-slate-800">
                <span>PROVINCIAL HEAD</span>
                <span>RATE & AMOUNT (PKR)</span>
              </div>
              <div className="flex justify-between p-3">
                <span className="font-sans text-slate-700">Provincial Stamp Duty (e-Stamping)</span>
                <span className="font-bold text-slate-900">
                  {(propertyResult.rates.stampDutyRate * 100).toFixed(1)}% &bull; {formatPKR(propertyResult.stampDuty)}
                </span>
              </div>
              <div className="flex justify-between p-3">
                <span className="font-sans text-slate-700">Capital Value Tax (CVT)</span>
                <span className="font-bold text-slate-900">
                  {(propertyResult.rates.cvtRate * 100).toFixed(2)}% &bull; {formatPKR(propertyResult.cvt)}
                </span>
              </div>
              <div className="flex justify-between p-3">
                <span className="font-sans text-slate-700">TMA / Town / Municipal Tax</span>
                <span className="font-bold text-slate-900">
                  {(propertyResult.rates.tmaTownTaxRate * 100).toFixed(1)}% &bull; {formatPKR(propertyResult.tmaTax)}
                </span>
              </div>
              <div className="flex justify-between p-3">
                <span className="font-sans text-slate-700">Registration / Sub-Registrar Fee</span>
                <span className="font-bold text-slate-900">{formatPKR(propertyResult.regFee)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. MOTOR VEHICLE TOKEN TAX (EXCISE)
          ======================================================== */}
      {activeModule === 'vehicle-token-tax' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" />
              Provincial Motor Vehicle Token Tax Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Compare annual and lifetime motor vehicle road token taxes across Punjab Excise, Sindh Excise, KP Excise, and Islamabad Excise departments.
            </p>
          </div>

          {/* Engine Capacity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {VEHICLE_TOKEN_SLABS.map((slab, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setVehicleCCIndex(idx)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  vehicleCCIndex === idx
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase font-bold opacity-80">Tier {idx + 1}</div>
                <div className="text-xs font-bold leading-tight mt-0.5">{slab.engineCCRange}</div>
              </button>
            ))}
          </div>

          {/* Comparison Cards across Provinces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase block">Punjab Excise</span>
              <div className="text-2xl font-black font-mono text-emerald-800">
                {selectedVehicleSlab.annualTokenPunjab === 0
                  ? 'Lifetime'
                  : formatPKR(selectedVehicleSlab.annualTokenPunjab)}
              </div>
              <div className="text-[11px] text-slate-600">
                {selectedVehicleSlab.annualTokenPunjab === 0 ? 'Paid one-time' : 'Per Year Annual Token'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase block">Sindh Excise</span>
              <div className="text-2xl font-black font-mono text-blue-800">
                {formatPKR(selectedVehicleSlab.annualTokenSindh)}
              </div>
              <div className="text-[11px] text-slate-600">Per Year Annual Token</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase block">KP Excise</span>
              <div className="text-2xl font-black font-mono text-teal-800">
                {formatPKR(selectedVehicleSlab.annualTokenKP)}
              </div>
              <div className="text-[11px] text-slate-600">Per Year Annual Token</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase block">Islamabad (ICT)</span>
              <div className="text-2xl font-black font-mono text-indigo-800">
                {formatPKR(selectedVehicleSlab.annualTokenICT)}
              </div>
              <div className="text-[11px] text-slate-600">Per Year Annual Token</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
            <span className="font-bold text-slate-800">Note:</span> {selectedVehicleSlab.notes} {selectedVehicleSlab.lifetimeTokenRate && `(${selectedVehicleSlab.lifetimeTokenRate})`}
          </div>
        </div>
      )}

      {/* ========================================================
          5. PROVINCIAL PROFESSIONAL TAX
          ======================================================== */}
      {activeModule === 'professional-tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                {provinceConfig.name} Professional Tax Slabs
              </h3>
              <p className="text-xs text-slate-500">
                Annual professional tax levied on salaried employees, doctors, lawyers, contractors, and registered companies.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Taxpayer Professional Status:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProfTaxCategory('salaried')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    profTaxCategory === 'salaried'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Salaried Individual
                </button>
                <button
                  type="button"
                  onClick={() => setProfTaxCategory('business')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    profTaxCategory === 'business'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Trader / Sole Prop
                </button>
                <button
                  type="button"
                  onClick={() => setProfTaxCategory('company')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    profTaxCategory === 'company'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Corporate Company
                </button>
              </div>
            </div>

            {/* Monthly Salary if Salaried */}
            {profTaxCategory === 'salaried' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Monthly Gross Salary (PKR):</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={monthlyGrossSalary || ''}
                  onChange={(e) => setMonthlyGrossSalary(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Professional Tax Assessment
            </h4>

            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Annual Provincial Professional Tax
              </span>
              <div className="text-3xl font-black font-mono text-white">
                {profTaxCategory === 'salaried'
                  ? monthlyGrossSalary > 500000
                    ? 'Rs. 1,000 / year'
                    : monthlyGrossSalary > 200000
                    ? 'Rs. 500 / year'
                    : monthlyGrossSalary > 100000
                    ? 'Rs. 200 / year'
                    : 'Rs. 0 (Nil)'
                  : profTaxCategory === 'business'
                  ? 'Rs. 2,500 - 5,000 / year'
                  : 'Rs. 10,000 - 50,000 / year'}
              </div>
              <div className="text-xs text-slate-300">
                Paid annually to the Excise, Taxation & Narcotics Control Department.
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Salary / Category Tier</th>
                    <th className="p-3 text-right">Annual Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PUNJAB_PROFESSIONAL_TAX_SLABS.map((slab, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-800">{slab.description}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatPKR(slab.taxAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
