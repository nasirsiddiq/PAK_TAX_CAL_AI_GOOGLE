import React, { useState } from 'react';
import { Download, FileText, Printer, ShoppingCart, TrendingDown } from 'lucide-react';
import { SalesTaxCalculator } from './SalesTaxCalculator';
import { WithholdingTaxCalculator } from './WithholdingTaxCalculator';
import { SaveCalculationButton } from './SaveCalculationButton';

type InvoiceTaxModule = 'gst' | 'withholding';

interface InvoiceTaxCalculatorProps {
  onPrint?: () => void;
  onSavePdf?: () => void;
}

export const InvoiceTaxCalculator: React.FC<InvoiceTaxCalculatorProps> = ({ onPrint, onSavePdf }) => {
  const [module, setModule] = useState<InvoiceTaxModule>('gst');
  const title = module === 'gst' ? 'Sales Tax Calculator' : 'Withholding Tax Calculator';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 text-emerald-700" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-600">What would you like to check?</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setModule('gst')}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors cursor-pointer ${module === 'gst' ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
          >
            <ShoppingCart className="h-4 w-4" />
            GST on Invoice
          </button>
          <button
            type="button"
            onClick={() => setModule('withholding')}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors cursor-pointer ${module === 'withholding' ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
          >
            <TrendingDown className="h-4 w-4" />
            Withholding Tax (WHT)
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-emerald-200 pt-3 print:hidden">
          <button type="button" onClick={onPrint} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <button type="button" onClick={onSavePdf} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
            <Download className="h-3.5 w-3.5" />
            Save PDF
          </button>
          <SaveCalculationButton
            calculationType={module === 'gst' ? 'sales-tax' : 'withholding-tax'}
            name={title}
            calculationData={{ calculator: module, savedFrom: 'invoice-tax' }}
            result={{}}
            authority={module === 'gst' ? 'FBR Sales Tax' : 'FBR Withholding Tax'}
          />
        </div>
      </div>

      {module === 'gst' ? <SalesTaxCalculator /> : <WithholdingTaxCalculator />}
    </div>
  );
};
