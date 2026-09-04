import React from 'react';
import { ListChecks } from 'lucide-react';
import { PAGE_CONTENT } from '../data/pageContent';
import type { AppTab } from '../utils/subdomainRoutes';

// Real, visible explanation of what the current page's tool does and how to
// use it, shown above the calculator itself. This exists for two reasons:
// it genuinely helps a first-time visitor understand what they're looking
// at, and — just as importantly — it gives every page real, indexable body
// text instead of relying entirely on the calculator UI, which a lot of
// crawlers, link previews and content-quality checkers never render (see
// scripts/generate-seo-pages.ts, which bakes this same copy into the static
// HTML for exactly that reason).
export const PageIntroSection: React.FC<{ activeTab: AppTab }> = ({ activeTab }) => {
  const content = PAGE_CONTENT[activeTab];
  if (!content) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div>
        {/* h2, not h1: the site brand name in Header.tsx is already this
            page's h1 (it's hidden only in focus mode, which never renders
            this component — see App.tsx). */}
        <h2 className="text-lg font-black text-slate-900">{content.heading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{content.intro}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">How to use this tool</h2>
        </div>
        <ol className="space-y-1.5 text-sm text-slate-600">
          {content.howToUse.map((step, index) => (
            <li key={index} className="flex gap-2.5">
              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
