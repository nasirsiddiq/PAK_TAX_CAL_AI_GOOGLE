import React, { useState } from 'react';
import {
  Building,
  Receipt,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  ArrowDown,
} from 'lucide-react';
import { Province, ServiceCategory } from '../types/provincialTax';
import { PROVINCES_CONFIG, PROVINCIAL_SERVICES_CATALOG } from '../data/provincialTaxData';
import { formatPKR, formatPakistaniUnits } from '../utils/taxCalculator';

export const ProvincialServicesTaxCalculator: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province>('sindh');
  const [servicesTab, setServicesTab] = useState<'supplier' | 'customer'>('supplier');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('telecom');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(100000);
  const [isDigitalPayment, setIsDigitalPayment] = useState<boolean>(true);
  const [isWithholdingAgent, setIsWithholdingAgent] = useState<boolean>(false);
  const [isSupplierRegistered, setIsSupplierRegistered] = useState<boolean>(true);
  const [inputTaxAmount, setInputTaxAmount] = useState<number>(0);

  const provinceConfig = PROVINCES_CONFIG[selectedProvince];
  const currentServicesList = PROVINCIAL_SERVICES_CATALOG[selectedProvince] || [];
  const activeService =
    currentServicesList.find((s) => s.id === selectedServiceId) || currentServicesList[0];

  // Helper 1: Calculate Provincial Services Tax (SUPPLIER TAB)
  const calculateServicesTax = () => {
    if (!activeService) return { rate: 0.16, taxAmount: 0, whtAmount: 0, netToVendor: 0, finalRatePercent: 16 };

    let effectiveRate = activeService.standardRate;

    if (isDigitalPayment && activeService.digitalPaymentRate !== undefined) {
      effectiveRate = activeService.digitalPaymentRate;
    } else if (activeService.concessionaryRate !== undefined) {
      effectiveRate = activeService.concessionaryRate;
    }

    const outputTax = invoiceAmount * effectiveRate;
    const netTaxPayableToAuthority = Math.max(0, outputTax - inputTaxAmount);
    const totalInvoiceWithTax = invoiceAmount + outputTax;

    const whtRateOnTax = isSupplierRegistered ? 0.2 : 1.0;
    const whtDeduction = isWithholdingAgent ? outputTax * whtRateOnTax : 0;
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
      whtRatePercent: whtRateOnTax * 100,
      inputIsBase: true,
    };
  };

  // Helper 1B: Calculate Withholding Tax for Customer (CUSTOMER TAB)
  const calculateCustomerWithholding = () => {
    if (!activeService) return { rate: 0.16, taxAmount: 0, whtAmount: 0, netToVendor: 0, finalRatePercent: 16 };

    let effectiveRate = activeService.standardRate;

    if (isDigitalPayment && activeService.digitalPaymentRate !== undefined) {
      effectiveRate = activeService.digitalPaymentRate;
    } else if (activeService.concessionaryRate !== undefined) {
      effectiveRate = activeService.concessionaryRate;
    }

    let baseAmount: number;
    let outputTax: number;
    let totalInvoiceWithTax: number;

    if (isSupplierRegistered) {
      baseAmount = invoiceAmount;
      outputTax = baseAmount * effectiveRate;
      totalInvoiceWithTax = baseAmount + outputTax;
    } else {
      totalInvoiceWithTax = invoiceAmount;
      baseAmount = totalInvoiceWithTax / (1 + effectiveRate);
      outputTax = totalInvoiceWithTax - baseAmount;
    }

    const whtRateOnTax = isSupplierRegistered ? 0.2 : 1.0;
    const whtDeduction = outputTax * whtRateOnTax;
    const netPaymentToVendor = totalInvoiceWithTax - whtDeduction;

    return {
      rate: effectiveRate,
      finalRatePercent: effectiveRate * 100,
      baseAmount,
      outputTax,
      totalInvoiceWithTax,
      whtDeduction,
      netPaymentToVendor,
      whtRatePercent: whtRateOnTax * 100,
      inputIsBase: isSupplierRegistered,
    };
  };

  const servicesResult = calculateServicesTax();

  return (
    <div className="space-y-6">
      {/* Province Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-600" />
          Provincial Sales Tax on Services Calculator
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(PROVINCES_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedProvince(key as Province)}
              className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                selectedProvince === key
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {config.authority}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier vs Customer Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex gap-3 border-b border-slate-200">
          <button
            onClick={() => setServicesTab('supplier')}
            className={`px-5 py-3 font-bold text-sm transition-all border-b-2 ${
              servicesTab === 'supplier'
                ? 'text-emerald-700 border-b-emerald-600'
                : 'text-slate-600 border-b-transparent hover:text-slate-900'
            }`}
          >
            📤 Supplier View
          </button>
          <button
            onClick={() => setServicesTab('customer')}
            className={`px-5 py-3 font-bold text-sm transition-all border-b-2 ${
              servicesTab === 'customer'
                ? 'text-emerald-700 border-b-emerald-600'
                : 'text-slate-600 border-b-transparent hover:text-slate-900'
            }`}
          >
            📥 Customer/Buyer View
          </button>
        </div>
      </div>

      {/* ==================== SUPPLIER TAB ==================== */}
      {servicesTab === 'supplier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Invoice & Service Config */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                {provinceConfig.authority} Services Tax Invoice Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Calculate provincial sales tax, concessionary rates, and withholding obligations.
              </p>
            </div>

            {/* Service Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Service Classification / Sector:</label>
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
                <p className="text-[11px] text-slate-500 italic mt-1">{activeService.description}</p>
              )}
            </div>

            {/* Invoice Amount Input */}
            <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-800 block">
                    Enter service amount
                  </label>
                  <div className="mt-1 text-sm font-bold text-slate-800">Gross Value of Service Rendered (PKR)</div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                  {formatPakistaniUnits(invoiceAmount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-black text-sm">
                  PKR
                </span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={invoiceAmount || ''}
                  onChange={(e) => setInvoiceAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="1,000,000"
                  className="w-full pl-14 pr-3 py-3.5 bg-white border-2 border-emerald-300 rounded-xl text-lg font-black text-slate-900 font-mono focus:bg-white focus:ring-4 focus:ring-emerald-200 focus:border-emerald-600 text-right shadow-sm"
                />
              </div>
              <p className="text-[11px] text-slate-600">Display: {formatPKR(invoiceAmount)}</p>
            </div>

            {/* Payment Method / Digital Rate */}
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

            {/* Input Tax Credit */}
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
                <span className="font-bold text-slate-900">Buyer is a Withholding Agent:</span> Deduct tax at source
                under {provinceConfig.authority} rules.
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
                Sales Tax Charged: <span className="font-bold text-white font-mono">{formatPKR(servicesResult.outputTax)}</span>
              </div>
            </div>

            {/* Calculation Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">Base Value</span>
                <div className="text-base font-bold text-slate-900">{formatPKR(invoiceAmount)}</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-emerald-800 uppercase block">Tax Rate Applied</span>
                <div className="text-base font-bold text-emerald-900">{servicesResult.finalRatePercent.toFixed(1)}%</div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-sans font-bold text-rose-800 uppercase block">
                  {isWithholdingAgent ? `Withholding (${servicesResult.whtRatePercent}% of tax)` : 'No Withholding'}
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
              <p className="text-[11px] leading-relaxed text-slate-600">{activeService?.notes}</p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Official Portal:</span>
                <a
                  href={provinceConfig.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  {provinceConfig.authority} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CUSTOMER TAB ==================== */}
      {servicesTab === 'customer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Withholding Calculation Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-emerald-600" />
                Withholding Tax as Buyer/Withholding Agent
              </h3>
              <p className="text-xs text-slate-500">
                Calculate withholding tax based on supplier's registration status.
              </p>
            </div>

            {/* Service Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Service Classification:</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {currentServicesList.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name} - {(svc.standardRate * 100).toFixed(0)}%
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Amount */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  {calculateCustomerWithholding().inputIsBase
                    ? 'Invoice Base Amount (Excl. Tax) - PKR:'
                    : 'Invoice Total Amount (Incl. Tax) - PKR:'}
                </label>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {formatPakistaniUnits(invoiceAmount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">PKR</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={invoiceAmount || ''}
                  onChange={(e) => setInvoiceAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="1,000,000"
                  className="w-full pl-14 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 text-right"
                />
              </div>
              <p className="text-[11px] text-slate-500 italic pt-1">
                {calculateCustomerWithholding().inputIsBase
                  ? 'Enter amount BEFORE tax (tax will be calculated)'
                  : 'Enter amount AFTER tax included (tax will be extracted)'}
              </p>
            </div>

            {/* Supplier Registration Status */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
              <label className="text-xs font-bold text-emerald-900 block">Supplier's Tax Registration Status:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-emerald-100 transition-all">
                  <input
                    type="radio"
                    checked={isSupplierRegistered}
                    onChange={() => setIsSupplierRegistered(true)}
                    className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-emerald-900 block">Registered / Active Taxpayer (ATL)</span>
                    <span className="text-[11px] text-emerald-700">Withhold 1/5th (20%) of the sales tax shown</span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-emerald-100 transition-all">
                  <input
                    type="radio"
                    checked={!isSupplierRegistered}
                    onChange={() => setIsSupplierRegistered(false)}
                    className="rounded-full text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-emerald-900 block">Unregistered Supplier</span>
                    <span className="text-[11px] text-emerald-700">Withhold 100% of the sales tax shown</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Withholding Summary */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Withholding Tax Calculation Breakdown
            </h4>

            {/* Invoice Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">
                    {calculateCustomerWithholding().inputIsBase ? 'Base Amount (Ex. Tax)' : 'Total Amount (Inc. Tax)'}
                  </span>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">{formatPKR(invoiceAmount)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block">Tax Rate</span>
                  <div className="text-lg font-bold text-emerald-700 font-mono mt-1">
                    {calculateCustomerWithholding().finalRatePercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Sales Tax Shown on Invoice:</span>
                  <span className="font-bold font-mono text-slate-900">{formatPKR(calculateCustomerWithholding().outputTax)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Gross Invoice Total:</span>
                  <span className="font-bold font-mono text-slate-900">{formatPKR(calculateCustomerWithholding().totalInvoiceWithTax)}</span>
                </div>
              </div>
            </div>

            {/* Withholding Hero Card */}
            <div className={`rounded-xl p-5 shadow-xs space-y-2 ${
              isSupplierRegistered
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
                : 'bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200'
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isSupplierRegistered ? 'text-blue-800' : 'text-rose-800'
              }`}>
                {isSupplierRegistered ? '✓ Registered Supplier' : '✗ Unregistered Supplier'}
              </span>
              <div className="text-3xl font-black font-mono">{formatPKR(calculateCustomerWithholding().whtDeduction)}</div>
              <div className={`text-xs font-semibold ${
                isSupplierRegistered ? 'text-blue-700' : 'text-rose-700'
              }`}>
                Withholding Tax You Must Deduct
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Amount You Pay to Supplier
              </span>
              <div className="text-2xl font-black font-mono text-emerald-300">
                {formatPKR(calculateCustomerWithholding().netPaymentToVendor)}
              </div>
              <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-700">
                = Invoice {formatPKR(calculateCustomerWithholding().totalInvoiceWithTax)} − Withholding{' '}
                {formatPKR(calculateCustomerWithholding().whtDeduction)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
