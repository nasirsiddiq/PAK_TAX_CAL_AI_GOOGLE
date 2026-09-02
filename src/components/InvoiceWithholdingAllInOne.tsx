import React from 'react';
import { Layers, FileStack } from 'lucide-react';
import { InvoiceTaxCalculator } from './InvoiceTaxCalculator';
import { ProvincialTaxCalculator } from './ProvincialTaxCalculator';

interface InvoiceWithholdingAllInOneProps {
  onPrint: () => void;
  onSavePdf: () => void;
}

// Recreates the old site's "Invoice Withholding Calculator – All in One" page:
// Section 153 income tax withholding + GST on one invoice, plus an optional
// second section for provincial sales tax on services withheld on the same
// invoice. Both sections reuse the app's existing, already-tested calculators
// rather than re-implementing the tax logic, so behaviour stays in sync with
// the standalone Invoice Tax and Provincial Taxes tabs.
export const InvoiceWithholdingAllInOne: React.FC<InvoiceWithholdingAllInOneProps> = ({ onPrint, onSavePdf }) => {
  return (
    <div className="space-y-8">
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <FileStack className="w-3.5 h-3.5" />
            All-in-One
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Invoice Withholding Calculator — All in One</h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Work out everything withheld on a single invoice in one place: federal income tax
            withholding (Section 153) and GST below, plus provincial sales tax on services if the
            invoice includes a taxable service.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">1</span>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">Income Tax Withholding (Section 153) &amp; GST</h3>
        </div>
        <InvoiceTaxCalculator onPrint={onPrint} onSavePdf={onSavePdf} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">2</span>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
            Provincial Sales Tax on Services
            <span className="rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">Optional</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-xs">
          <div className="flex items-start gap-2 rounded-xl bg-sky-50/60 border border-sky-100 px-4 py-3 text-xs text-sky-900">
            <Layers className="h-4 w-4 shrink-0 mt-0.5 text-sky-600" />
            <span>If this invoice also includes a taxable service (PRA, SRB, KPRA, BRA or ICT), calculate and withhold the provincial sales tax on it here.</span>
          </div>
          <div className="p-3 sm:p-4">
            <ProvincialTaxCalculator showModuleSelector={false} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvoiceWithholdingAllInOne;
