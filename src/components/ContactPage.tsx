import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { AppTab } from '../utils/subdomainRoutes';
import { submitNetlifyForm } from '../utils/netlifyForm';

interface ContactPageProps {
  onNavigate: (tab: AppTab) => void;
}

const REASONS = [
  { value: 'general', label: 'General enquiry' },
  { value: 'rate-correction', label: 'Correction to a tax rate' },
  { value: 'bug', label: 'Bug or technical problem' },
  { value: 'advertising', label: 'Advertising or partnership' },
  { value: 'media', label: 'Media or press' },
  { value: 'legal', label: 'Copyright or legal' },
  { value: 'privacy', label: 'Privacy or data request' },
];

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [reason, setReason] = useState(REASONS[0].value);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [botField, setBotField] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (botField) return; // honeypot tripped — silently drop
    setStatus('submitting');
    try {
      await submitNetlifyForm('contact', { reason, name, email, subject, message });
      setStatus('success');
    } catch (err) {
      console.error('Contact form submission failed:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-xs text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Message sent</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your message has reached us. If you left an email address and your enquiry needs a
            reply, you'll hear back — usually within a few days.
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
            <Mail className="w-3.5 h-3.5" />
            Contact Us
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Contact Us</h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Questions about the site, a correction, a partnership or advertising enquiry, or a
            media request — send a message below and it comes straight to us. If you've found a
            wrong rate or a bug, the{' '}
            <button onClick={() => onNavigate('feedback')} className="font-bold underline underline-offset-2 hover:text-white">
              feedback form
            </button>{' '}
            is set up for exactly that and gets looked at first.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Honeypot field — kept off-screen, real visitors never fill it in */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-bot-field">Leave this field empty:</label>
          <input id="contact-bot-field" type="text" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-reason" className="text-xs font-bold text-slate-800">Reason for contact</label>
          <select
            id="contact-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-xs font-bold text-slate-800">Your name</label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-xs font-bold text-slate-800">Email address</label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-subject" className="text-xs font-bold text-slate-800">Subject</label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="text-xs font-bold text-slate-800">Message</label>
          <textarea
            id="contact-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you need. The more specific you are, the more useful the reply will be."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            Something went wrong sending your message. Please try again in a moment.
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {status === 'submitting' ? 'Sending…' : 'Send Message'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-2">
        <h3 className="text-sm font-bold text-slate-900">Other Ways to Reach Us</h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          This is an independently run site, not a firm or a government body, so there's no phone
          line or office to visit — the form above is the way to get hold of us.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
