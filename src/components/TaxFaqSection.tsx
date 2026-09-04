import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';
import { FAQS_BY_TAB, BASE_FAQS } from '../data/pageFaqs';

export const TaxFaqSection: React.FC<{ activeTab?: string }> = ({ activeTab = 'calculator' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = FAQS_BY_TAB[activeTab] ?? BASE_FAQS;
  const sectionTitle =
    activeTab === 'calculator'
      ? 'Frequently Asked Questions & Income Tax Guide'
      : activeTab === 'invoice-tax'
      ? 'Frequently Asked Questions & Invoice Tax Guide'
      : activeTab === 'provincial'
      ? 'Frequently Asked Questions & Provincial Tax Guide'
      : activeTab === 'property-valuation'
      ? 'Frequently Asked Questions & Property Valuation Guide'
      : activeTab === 'vehicle-registration'
      ? 'Frequently Asked Questions & Vehicle Registration Tax Guide'
      : activeTab === 'it-export-tax'
      ? 'Frequently Asked Questions & IT Export Tax Guide'
      : activeTab === 'pta-mobile-tax'
      ? 'Frequently Asked Questions & PTA Mobile Tax Guide'
      : activeTab === 'agricultural-tax'
      ? 'Frequently Asked Questions & Agricultural Tax Guide'
      : activeTab === 'property-stamp-duty'
      ? 'Frequently Asked Questions & Property Transfer Guide'
      : activeTab === 'vehicle-token-tax'
      ? 'Frequently Asked Questions & Vehicle Token Tax Guide'
      : activeTab === 'professional-tax'
      ? 'Frequently Asked Questions & Professional Tax Guide'
      : activeTab === 'history'
      ? 'Frequently Asked Questions & My Account Guide'
      : activeTab === 'specialized'
      ? 'Frequently Asked Questions & Property / Vehicle / IT Export Guide'
      : activeTab === 'zakat'
      ? 'Frequently Asked Questions & Zakat Guide'
      : activeTab === 'reverse'
      ? 'Frequently Asked Questions & Net-to-Gross Salary Guide'
      : activeTab === 'invoice-withholding'
      ? 'Frequently Asked Questions & Invoice Withholding Guide'
      : activeTab === 'tax-slabs'
      ? 'Frequently Asked Questions & Tax Slabs Guide'
      : activeTab === 'filer-vs-nonfiler'
      ? 'Frequently Asked Questions & Filer vs Non-Filer Guide'
      : activeTab === 'tax-savings'
      ? 'Frequently Asked Questions & Tax Savings Guide'
      : activeTab === 'iris-simulator'
      ? 'Frequently Asked Questions & IRIS Practice Guide'
      : 'Frequently Asked Questions & FBR Compliance Guide';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Important Dates / Key Deadlines Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              September 30
            </span>
            <p className="text-[11px] text-slate-500">
              Annual Tax Return Filing Due Date for Salaried & Individual Taxpayers.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              SMS 9966 for ATL
            </span>
            <p className="text-[11px] text-slate-500">
              Type &quot;ATL &lt;CNIC&gt;&quot; to verify your Active Filer status instantly.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Rs. 600,000 Exemption
            </span>
            <p className="text-[11px] text-slate-500">
              Annual incomes up to PKR 600,000 (50k/mo) enjoy 0% income tax liability.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion FAQs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {sectionTitle}
          </h3>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-3.5 px-4 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {faq.category}
                    </span>
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
