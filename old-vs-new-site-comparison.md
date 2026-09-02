# Old site vs. new app — what's missing

Comparing `E:\My  Website DO NOT DELETE OR MOVE\paktaxcalculator-main\paktaxcalculator-main` (the old static HTML site) against `PAK_TAX_CAL_AI_GOOGLE` (the React app now live at paktaxcalculator.net).

## Calculators missing entirely from the new app

These existed as full pages on the old site and have no equivalent anywhere in the new app:

- **FBR IRIS Practice Simulator** (`iris-practice-simulator.html`) — lets someone practice the actual IRIS return-filing flow (sample income, live computation, wealth statement, practice receipt) before filing for real. Nothing like this exists in the new app.
- **Federal Sales Tax (GST) on Goods Calculator** (`sales-tax-gst.html`) — a standalone calculator with the full FBR GST rate list (standard, reduced, zero-rated, exempt). In the new app this is folded into the small "Invoice Tax" tab as one mode, but the full standalone rate-list page is gone.
- **Sales Tax Withholding Calculator** (`sales-tax-withholding.html`) — combined Federal + Sindh + Punjab + KP + Balochistan + ICT withholding rates, registered vs. unregistered supplier, in one page. No equivalent.
- **Property Expense Calculator** (`property-expense-calculator.html`) — full cost of buying/selling property: stamp duty, registration fee, Section 236K/236C advance tax, *and Capital Gains Tax*. The new app's "Property Stamp Duty" tab is a much smaller version and doesn't appear to cover CGT at all.

## Content pages that are effectively missing

The old site had real pages for these; in the new app, the footer links with the same labels just redirect to the Income Tax or History tab instead of showing actual content:

- About Us (`about.html`)
- Contact (`contact.html`)
- Feedback (`feedback.html`)
- Privacy Policy (`privacy.html`)
- Blog (`blog.html`) — plus three published articles with no home in the new app: `fbr-ai-tax-audit-pakistan-2026.html`, `fbr-electricity-tax-steel-2026.html`, `fbr-sales-tax-five-categories-2026.html`

## A real bug: one tab renders blank

The new app's routing (`subdomainRoutes.ts`) defines a `reverse` tab with its own URL (`/reverse-net-to-gross.html`) and SEO title ("Net to Gross Salary Calculator") — and there's even a finished `ReverseTaxCalculator.tsx` component for it. But `App.tsx` never actually renders it: there's no `{activeTab === 'reverse' && ...}` case. Anyone who lands on that URL gets a page with the right title and a completely empty content area. This is a quick fix — the component already exists, it just needs to be wired in.

## Already built, just not connected (quick wins)

These components exist in the new app's code but aren't imported or rendered anywhere, so none of this work is currently visible to users:

- `ReverseTaxCalculator.tsx` — net-to-gross salary calculator (see bug above)
- `TaxSlabsViewer.tsx` — tax slab reference/comparison viewer
- `FilerVsNonFilerMatrix.tsx` — filer vs. non-filer rate comparison (covers Section 236K-style property scenarios)
- `TaxSavingsOptimizer.tsx` — deduction/savings optimizer
- `FbrPropertyValuationPage.tsx` — a property valuation page, separate from the one currently embedded in the Specialized Calculators tab
- `RelatedCalculators.tsx` — a cross-links widget

Since these are already written, turning them on is much less work than building the missing calculators above from scratch — mostly a matter of adding a tab, a route, and a nav link.

## Covered, just consolidated differently

Not missing, just restructured — worth knowing so nothing looks "lost" that isn't:

- The 5 old per-province pages (`sales-tax-punjab.html`, `sales-tax-sindh.html`, `sales-tax-kpk.html`, `sales-tax-balochistan.html`, `sales-tax-ict.html`) are now one "Provincial Taxes" tab with an internal switcher, rather than 5 separate URLs.
- `income-tax.html` → Income Tax tab.
- `fbr-property-valuation.html` → Property Valuation tab.
- `apna-ghar-calculator.html` → part of the Specialized Calculators tab.
- `pta-mobile-tax-calculator.html` → PTA Mobile Tax tab.
- `zakat-calculator.html` → Zakat tab (the old page was much larger — 161 KB vs. the new component's 27 KB — so some depth may have been lost; worth a closer look if Zakat features feel thinner than before).
- `withholding-tax.html` and `invoice-withholding.html` → both folded into the Invoice Tax tab's two internal modes.
- `my-wht-log.html` → covered by the History/My Account tab, which does include CSV export.
- `agricultural-tax`, `property-stamp-duty`, `vehicle-token-tax`, `professional-tax` — these are new in the React app; the old site never had them at all.

## Suggested priority

If you want to close these gaps, the cheapest wins first: wire up the `reverse` tab (fixes a live bug), then surface `TaxSlabsViewer`, `FilerVsNonFilerMatrix`, and `TaxSavingsOptimizer` somewhere reachable — all four are already written. After that, the real content pages (About/Contact/Privacy/Feedback) and the two GST/withholding standalone calculators are the biggest genuinely-missing pieces. The IRIS simulator and blog are the largest net-new builds if you want full parity.
