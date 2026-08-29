import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'FBR Basics',
    question: 'Who is considered a "Salaried Individual" under Pakistan tax law?',
    answer:
      'Under the Income Tax Ordinance 2001, an individual is classified as a "Salaried Individual" if their income from salary exceeds 75% of their total taxable income for the tax year. Salaried individuals benefit from lower progressive tax slab rates compared to business individuals.',
  },
  {
    category: 'Filing & Deadlines',
    question: 'When is the deadline to file annual Income Tax returns in Pakistan?',
    answer:
      'For salaried individuals, freelancers, and non-salaried individuals whose tax year ends on June 30, the statutory annual income tax return filing deadline is September 30 (subject to extensions granted by the FBR).',
  },
  {
    category: 'Tax Benefits',
    question: 'Why should I file my return if my employer already deducts income tax?',
    answer:
      'Even if your employer deducts withholding tax under Section 149, you must submit your annual return on the FBR Iris portal to remain on the Active Taxpayer List (ATL). Active Filers avoid severe 2x to 4x penalty withholding taxes on property purchases (236K), cash withdrawals (231AB), vehicle purchases (231B), and dividend payouts.',
  },
  {
    category: 'Exemptions',
    question: 'How does the Medical Allowance tax exemption work?',
    answer:
      'Under Clause (139) of Part I of the Second Schedule to the Income Tax Ordinance, medical allowance received by an employee up to 10% of their Basic Salary is 100% exempt from income tax, provided the employer does not provide free medical treatment/hospitalization facility.',
  },
  {
    category: 'IT & Freelancers',
    question: 'What is the tax rate for IT exports and software freelancers?',
    answer:
      'Under Section 154A, foreign remittance proceeds from IT & IT-enabled export services are subject to a final tax regime of 0.25% if registered with PSEB/P@SHA, or 1% if unregistered, provided proceeds are received through official banking channels.',
  },
  {
    category: 'How to check ATL',
    question: 'How do I check if my name is on the Active Taxpayer List (ATL)?',
    answer:
      'You can verify your ATL status instantly by sending an SMS to 9966 with format "ATL <13-digit CNIC>" (e.g. ATL 4210112345671), or by visiting the official FBR Online NTN / ATL Inquiry portal.',
  },
];

export const TaxFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            Frequently Asked Questions & FBR Compliance Guide
          </h3>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {FAQS.map((faq, index) => {
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
