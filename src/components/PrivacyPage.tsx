import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { AppTab } from '../utils/subdomainRoutes';

interface PrivacyPageProps {
  onNavigate: (tab: AppTab) => void;
}

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Information We Do Not Collect',
    body: (
      <>
        All calculations (income tax, withholding tax, and sales tax) run entirely in your browser
        using JavaScript. The income, turnover, and transaction amounts you enter into any of the
        calculators are <span className="font-bold text-slate-900">never transmitted to, stored on,
        or processed by our servers</span> — they exist only on your device for the duration of your
        session.
      </>
    ),
  },
  {
    title: 'Analytics (Google Analytics)',
    body: (
      <>
        We use Google Analytics (GA4) to understand overall site traffic — for example, how many
        people visit, which pages are popular, and which country or device they browse from. Google
        Analytics may set cookies and collect standard technical information such as your
        approximate location (city/country level), browser type, device type, and pages visited. It
        does not receive the tax figures you enter into the calculators. Google may process this
        data according to its own privacy policy — you can learn more or opt out via Google's
        Privacy Policy and tools such as the Google Analytics Opt-out Browser Add-on.
      </>
    ),
  },
  {
    title: 'Advertising (Google AdSense)',
    body: (
      <>
        We use Google AdSense to display ads on this site. Google and its partners may use cookies
        and similar technologies to serve ads based on your prior visits to this or other websites.
        You can opt out of personalized advertising by visiting Google Ads Settings.
      </>
    ),
  },
  {
    title: 'Cookies',
    body: (
      <>
        Google Analytics and Google AdSense may place cookies on your device to distinguish unique
        visitors and sessions and to serve relevant ads. You can disable cookies at any time through
        your browser settings; the calculators will continue to work normally without them.
      </>
    ),
  },
  {
    title: 'Third-Party Links',
    body: (
      <>
        Some pages link to official third-party sources (e.g. fbr.gov.pk, provincial revenue
        authorities) for reference. We are not responsible for the privacy practices or content of
        external sites.
      </>
    ),
  },
  {
    title: "Children's Privacy",
    body: (
      <>
        This site is a general-purpose financial reference tool and is not directed at children. We
        do not knowingly collect information from children.
      </>
    ),
  },
  {
    title: 'Changes to This Policy',
    body: (
      <>
        We may update this Privacy Policy from time to time to reflect changes in our practices or
        for legal/regulatory reasons. The "Last updated" date at the top of this page will reflect
        the most recent revision.
      </>
    ),
  },
];

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy Policy
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Privacy Policy</h2>
          <p className="text-xs text-emerald-200/80">Last updated: August 2026</p>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            This Privacy Policy explains how paktaxcalculator.net ("we", "our", "the site") handles
            information when you use our tax calculators. We built this site to be usable without
            creating an account or submitting personal information, and we've kept data collection
            to a minimum accordingly.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs divide-y divide-slate-100">
        {SECTIONS.map((s) => (
          <div key={s.title} className="py-4 first:pt-0 last:pb-0 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="py-4 last:pb-0 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Contact</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            If you have questions about this Privacy Policy, please reach out via our{' '}
            <button onClick={() => onNavigate('contact')} className="font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-2">
              Contact page
            </button>{' '}
            or the{' '}
            <button onClick={() => onNavigate('about')} className="font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-2">
              About Us
            </button>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
