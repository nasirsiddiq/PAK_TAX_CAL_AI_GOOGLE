import React, { useState } from 'react';
import {
  Printer,
  X,
  Building,
  CheckCircle2,
  FileCheck,
  Download,
  Share2,
} from 'lucide-react';
import { TaxYear, TaxpayerCategory } from '../types/tax';
import { formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';

interface PayslipTaxCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxYear: TaxYear;
  taxpayerCategory: TaxpayerCategory;
  monthlyGross: number;
  monthlyTax: number;
  monthlyTakeHome: number;
  annualGross: number;
  annualTax: number;
  taxableIncomeAnnual: number;
}

export const PayslipTaxCertificateModal: React.FC<PayslipTaxCertificateModalProps> = ({
  isOpen,
  onClose,
  taxYear,
  taxpayerCategory,
  monthlyGross,
  monthlyTax,
  monthlyTakeHome,
  annualGross,
  annualTax,
  taxableIncomeAnnual,
}) => {
  const [employeeName, setEmployeeName] = useState('Muhammad Ali');
  const [designation, setDesignation] = useState('Senior Software Engineer');
  const [companyName, setCompanyName] = useState('Tech Solutions Pvt Ltd');
  const [cnicNumber, setCnicNumber] = useState('42101-1234567-1');
  const [ntnNumber, setNtnNumber] = useState('1234567-8');
  const [payMonth, setPayMonth] = useState('July 2025');

  if (!isOpen) return null;

  const basicSalary = monthlyGross * 0.6;
  const houseRent = monthlyGross * 0.25;
  const medicalAllowance = monthlyGross * 0.1;
  const conveyance = monthlyGross * 0.05;
  const eobiDeduction = 800; // standard EOBI deduction

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between p-4 bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">
              Printable Salary Slip & Tax Certificate Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 bg-white" id="printable-payslip">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                {companyName}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pakistan Corporate Payroll & FBR Withholding Statement
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-md text-xs font-bold font-mono text-slate-800 border border-slate-200">
                PAYSLIP & TAX SLIP: {payMonth}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                FBR Tax Year: <span className="font-bold">{taxYear}</span>
              </div>
            </div>
          </div>

          {/* Editable Employee Information Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employee Name</span>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 w-full focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Designation</span>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 w-full focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">CNIC No.</span>
              <input
                type="text"
                value={cnicNumber}
                onChange={(e) => setCnicNumber(e.target.value)}
                className="font-mono text-slate-800 bg-transparent border-b border-dashed border-slate-300 w-full focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">NTN Status</span>
              <input
                type="text"
                value={ntnNumber}
                onChange={(e) => setNtnNumber(e.target.value)}
                className="font-mono font-bold text-emerald-800 bg-transparent border-b border-dashed border-slate-300 w-full focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 font-bold px-3 py-2 text-slate-800 border-b border-slate-200 flex justify-between">
                <span>EARNINGS & ALLOWANCES</span>
                <span>AMOUNT (PKR)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 font-mono">
                <div className="flex justify-between py-1.5 px-1">
                  <span className="text-slate-700 font-sans">Basic Salary</span>
                  <span className="font-semibold">{formatPKR(basicSalary, { showPrefix: false })}</span>
                </div>
                <div className="flex justify-between py-1.5 px-1">
                  <span className="text-slate-700 font-sans">House Rent Allowance</span>
                  <span className="font-semibold">{formatPKR(houseRent, { showPrefix: false })}</span>
                </div>
                <div className="flex justify-between py-1.5 px-1">
                  <span className="text-slate-700 font-sans">Medical Allowance (10% exempt)</span>
                  <span className="font-semibold">{formatPKR(medicalAllowance, { showPrefix: false })}</span>
                </div>
                <div className="flex justify-between py-1.5 px-1">
                  <span className="text-slate-700 font-sans">Conveyance Allowance</span>
                  <span className="font-semibold">{formatPKR(conveyance, { showPrefix: false })}</span>
                </div>
                <div className="flex justify-between py-2 px-1 bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <span className="font-sans">Total Gross Earnings</span>
                  <span className="text-emerald-800">{formatPKR(monthlyGross)}</span>
                </div>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 font-bold px-3 py-2 text-slate-800 border-b border-slate-200 flex justify-between">
                <span>DEDUCTIONS & TAXES</span>
                <span>AMOUNT (PKR)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 font-mono">
                <div className="flex justify-between py-1.5 px-1 text-rose-700">
                  <span className="text-slate-700 font-sans">Income Tax Withheld (Sec 149)</span>
                  <span className="font-bold">{formatPKR(monthlyTax, { showPrefix: false })}</span>
                </div>
                <div className="flex justify-between py-1.5 px-1">
                  <span className="text-slate-700 font-sans">EOBI Contribution</span>
                  <span className="font-semibold">{formatPKR(eobiDeduction, { showPrefix: false })}</span>
                </div>
                <div className="flex justify-between py-1.5 px-1">
                  <span className="text-slate-700 font-sans">Other Deductions</span>
                  <span className="font-semibold">0.00</span>
                </div>
                <div className="flex justify-between py-1.5 px-1 opacity-0">
                  <span>Spacer</span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between py-2 px-1 bg-rose-50 font-bold text-rose-900 border-t border-rose-100">
                  <span className="font-sans">Total Deductions</span>
                  <span>{formatPKR(monthlyTax + eobiDeduction)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block">
                Net In-Hand Salary Transferred
              </span>
              <div className="text-2xl font-extrabold font-mono text-white">
                {formatPKR(monthlyTakeHome - eobiDeduction)}
              </div>
            </div>
            <div className="text-xs text-slate-300 sm:text-right">
              Amount in words:{' '}
              <span className="font-bold text-emerald-300">
                {formatPakistaniUnits(monthlyTakeHome - eobiDeduction)}
              </span>
            </div>
          </div>

          {/* Annual Tax Projection Certification Box */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Annual Income Tax Withholding Summary (FBR Section 149):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono pt-1">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase block font-sans">Annual Gross</span>
                <span className="font-bold text-slate-900">{formatPKR(annualGross)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 uppercase block font-sans">Taxable Income</span>
                <span className="font-bold text-slate-900">{formatPKR(taxableIncomeAnnual)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 uppercase block font-sans">Annual Tax Due</span>
                <span className="font-bold text-rose-700">{formatPKR(annualTax)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 uppercase block font-sans">Monthly WHT</span>
                <span className="font-bold text-slate-900">{formatPKR(monthlyTax)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Prepared By (Payroll)</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Authorized Signature / Seal</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Employee Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
