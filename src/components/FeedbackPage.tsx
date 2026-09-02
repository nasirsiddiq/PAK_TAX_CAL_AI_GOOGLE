import React, { useState } from 'react';
import { MessageSquareText, Send, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { AppTab } from '../utils/subdomainRoutes';
import { submitNetlifyForm } from '../utils/netlifyForm';

interface FeedbackPageProps {
  onNavigate: (tab: AppTab) => void;
}

const TYPES = [
  { value: 'rate-wrong', label: 'A rate looks wrong or out of date' },
  { value: 'broken', label: 'Something is broken or miscalculating' },
  { value: 'new-calculator', label: 'Request a new calculator or category' },
  { value: 'usability', label: 'Website / usability suggestion' },
  { value: 'general', label: 'General comment' },
];

const PAGES = [
  { value: '', label: '— Not specific to one page —' },
  { value: 'invoice-withholding', label: 'Invoice Withholding (All in One)' },
  { value: 'calculator', label: 'Income Tax' },
  { value: 'invoice-tax', label: 'Invoice Tax (GST / WHT)' },
  { value: 'provincial-punjab', label: 'Punjab (PRA)' },
  { value: 'provincial-sindh', label: 'Sindh (SRB)' },
  { value: 'provincial-kpk', label: 'Khyber Pakhtunkhwa (KPRA)' },
  { value: 'provincial-balochistan', label: 'Balochistan (BRA)' },
  { value: 'provincial-ict', label: 'Islamabad (ICT)' },
  { value: 'property-valuation', label: 'FBR Property Valuation' },
  { value: 'vehicle-registration', label: 'Vehicle Registration' },
  { value: 'it-export-tax', label: 'IT Export Tax' },
  { value: 'pta-mobile-tax', label: 'PTA Mobile Tax' },
  { value: 'zakat', label: 'Zakat Calculator' },
];

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onNavigate }) => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [type, setType] = useState(TYPES[0].value);
  const [page, setPage] = useState(PAGES[0].value);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [botField, setBotField] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (botField) return; // honeypot tripped — silently drop
    setStatus('submitting');
    try {
      await submitNetlifyForm('feedback', { type, page, message, name, email });
      setStatus('success');
    } catch (err) {
      console.error('Feedback form submission failed:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-xs text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Thanks for the feedback</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Thanks for taking the time — corrections to tax rates are especially welcome, and they
            get looked at first. If you left an email address and your message needs a reply,
            you'll hear back.
          </p>
          <button
            onClick={() => onNavigate('calculator')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to the calculators
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <MessageSquareText className="w-3.5 h-3.5" />
            Give Feedback
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Give Feedback</h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Spotted a rate that looks wrong, hit a bug, or want a calculator that isn't here yet?
            Tell us. This site is maintained by hand from the finance acts and revenue-authority
            schedules, so corrections from people who use these rules daily are genuinely useful.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Honeypot field — kept off-screen, real visitors never fill it in */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="feedback-bot-field">Leave this field empty:</label>
          <input id="feedback-bot-field" type="text" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="feedback-type" className="text-xs font-bold text-slate-800">What is this about?</label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="feedback-page" className="text-xs font-bold text-slate-800">Which page? (optional)</label>
            <select
              id="feedback-page"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
            >
              {PAGES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="feedback-message" className="text-xs font-bold text-slate-800">Your message</label>
          <textarea
            id="feedback-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="If you're reporting a wrong rate, it helps a lot to say which category, what rate you expected, and where you saw it — an SRO number, a schedule entry or an FBR/PRA/SRB page reference is ideal."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="feedback-name" className="text-xs font-bold text-slate-800">Your name (optional)</label>
            <input
              id="feedback-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="feedback-email" className="text-xs font-bold text-slate-800">Email (optional, only if you want a reply)</label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            Something went wrong sending your feedback. Please try again in a moment.
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {status === 'submitting' ? 'Sending…' : 'Send Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;
