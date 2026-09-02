import React from 'react';
import { Info, Landmark, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import type { AppTab } from '../utils/subdomainRoutes';

interface AboutPageProps {
  onNavigate: (tab: AppTab) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            About Us
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">About paktaxcalculator.net</h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            A free, independent online tool built to help salaried individuals, business owners,
            freelancers, and companies in Pakistan quickly estimate their tax obligations for Tax
            Year 2025-26 and Tax Year 2026-27.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">The site is organized into calculators you can reach from the menu above:</h3>
        <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
          <li><span className="font-bold text-slate-900">Income Tax</span> — for salaried individuals, business individuals/AOPs, and companies, including super tax, minimum tax on turnover, and a Section 82 residency checker.</li>
          <li><span className="font-bold text-slate-900">Withholding Tax (WHT)</span> — covering goods, services, contracts, dividends, profit on debt, rent, imports and exports, with filer vs. non-filer rates.</li>
          <li><span className="font-bold text-slate-900">Sales Tax on Goods (GST)</span> — federal GST rates plus the complete FBR rate list.</li>
          <li><span className="font-bold text-slate-900">Sales Tax Withholding</span> — withholding on the GST portion of an invoice, federal and provincial.</li>
          <li><span className="font-bold text-slate-900">Provincial Sales Tax on Services</span> — separate calculators for Punjab (PRA), Sindh (SRB), Khyber Pakhtunkhwa (KPRA), Balochistan (BRA) and Islamabad (ICT).</li>
        </ul>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('calculator')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-900"
          >
            Open the Income Tax calculator <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-600" />
          Why We Built This
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          Pakistan's tax system spans a federal Income Tax Ordinance, a separate Sales Tax Act, and
          five distinct provincial/territorial sales tax authorities — each revising rates through
          its own annual Finance Act or SRO notifications. Finding a clear, current, all-in-one
          reference is surprisingly hard. Our goal is to make the most commonly needed rates and
          calculations accessible in one clean, mobile-friendly site, sourced from FBR's official
          rate cards and the relevant Finance Acts, and organized so you can jump straight to the
          calculator you need.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Accuracy &amp; Limitations
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          We review and update rates when new Finance Acts and FBR notifications are issued, and we
          cite our sources wherever practical. That said, Pakistani tax law is complex, changes
          frequently via SROs and clarificatory circulars, and includes many item-specific and
          case-specific provisions that a general calculator cannot fully capture.{' '}
          <span className="font-bold text-slate-900">
            This tool is provided for informational and estimation purposes only and does not
            constitute legal, financial, or tax advice.
          </span>{' '}
          Always confirm figures against official FBR/PRA/SRB/KPRA/BRA publications or consult a
          qualified tax advisor before filing or making financial decisions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-600" />
          Contact
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          Spotted an outdated rate or have a suggestion? We'd like to hear from you — feedback helps
          us keep the calculators accurate and useful for everyone.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => onNavigate('feedback')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            Give Feedback
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-50"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
