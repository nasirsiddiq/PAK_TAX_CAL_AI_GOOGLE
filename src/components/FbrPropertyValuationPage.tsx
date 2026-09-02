import React, { useMemo, useState } from 'react';
import { Building2, ExternalLink, MapPin } from 'lucide-react';
import { formatPKR } from '../utils/taxCalculator';

type PropertyUse = 'residential' | 'commercial' | 'industrial';

type LocalityRate = {
  locality: string;
  residential: number;
  commercial: number;
  industrial: number;
  category?: string;
};

type CityValuation = {
  city: string;
  sourceUrl?: string;
  sro?: string;
  effectiveDate?: string;
  localities: LocalityRate[];
};

const valuationFiles = import.meta.glob('../../paktaxcalculator-main/fbr-data/*.json', { eager: true }) as Record<string, { default?: any }>;

const toRate = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

const cityValuations: CityValuation[] = Object.entries(valuationFiles)
  .filter(([filePath]) => !filePath.endsWith('_index.json'))
  .map(([filePath, fileModule]) => {
    const data = fileModule.default ?? fileModule;
    const city = filePath.split('/').pop()?.replace('.json', '') ?? 'Unknown';
    const rows = Array.isArray(data.rows)
      ? data.rows
      : Array.isArray(data.sections)
        ? data.sections.flatMap((section: any) => Array.isArray(section.rows) ? section.rows : [])
        : [];
    const ratesByLocality = new Map<string, LocalityRate>();

    (data.areas ?? rows).forEach((entry: any) => {
      const locality = entry.name ?? entry.area ?? entry.tehsil;
      if (!locality) return;
      const categoryRates = entry.category ? data.categories?.[entry.category] : entry;
      const current = ratesByLocality.get(locality) ?? {
        locality,
        residential: 0,
        commercial: 0,
        industrial: 0,
        category: entry.category,
      };
      const classification = String(entry.cls ?? '').toLowerCase();
      const residential = toRate(categoryRates?.resOpen ?? categoryRates?.resBuilt ?? (classification === 'residential' ? categoryRates?.land : 0));
      const commercial = toRate(categoryRates?.comOpen ?? categoryRates?.comBuilt ?? (classification === 'commercial' ? categoryRates?.land : 0));
      const industrial = toRate(categoryRates?.indOpen ?? categoryRates?.indBuilt ?? (classification === 'industrial' ? categoryRates?.land : 0));
      current.residential = Math.max(current.residential, residential);
      current.commercial = Math.max(current.commercial, commercial);
      current.industrial = Math.max(current.industrial, industrial);
      ratesByLocality.set(locality, current);
    });

    return {
      city,
      sourceUrl: data.sourceUrl,
      sro: data.sro,
      effectiveDate: data.effectiveDate,
      localities: [...ratesByLocality.values()].sort((first, second) => first.locality.localeCompare(second.locality)),
    };
  })
  .sort((first, second) => first.city.localeCompare(second.city));

export const FbrPropertyValuationPage: React.FC = () => {
  const [selectedCityName, setSelectedCityName] = useState(cityValuations[0]?.city ?? '');
  const [selectedLocalityName, setSelectedLocalityName] = useState('');
  const [propertyUse, setPropertyUse] = useState<PropertyUse>('residential');
  const [area, setArea] = useState('');

  const selectedCity = useMemo(
    () => cityValuations.find((city) => city.city === selectedCityName) ?? cityValuations[0],
    [selectedCityName],
  );
  const selectedLocality = selectedCity?.localities.find((locality) => locality.locality === selectedLocalityName);
  const rate = selectedLocality?.[propertyUse] ?? 0;
  const totalValue = rate * Math.max(0, Number(area) || 0);

  const handleCityChange = (city: string) => {
    setSelectedCityName(city);
    setSelectedLocalityName('');
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-emerald-800">
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Federal Board of Revenue</span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">FBR Property Valuation Directory</h2>
        <p className="mt-1 text-sm text-slate-600">Select a downloaded FBR city notification to view its locality-level valuation rate.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              City
              <select value={selectedCityName} onChange={(event) => handleCityChange(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600">
                {cityValuations.map((city) => <option key={city.city} value={city.city}>{city.city}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              Locality
              <select value={selectedLocalityName} onChange={(event) => setSelectedLocalityName(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600">
                <option value="">Select locality</option>
                {selectedCity?.localities.map((locality) => <option key={locality.locality} value={locality.locality}>{locality.locality}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              Property use
              <select value={propertyUse} onChange={(event) => setPropertyUse(event.target.value as PropertyUse)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              Area in rate unit
              <input type="number" min="0" step="0.01" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Enter area" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600" />
            </label>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Notified locality rate</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-900">{rate > 0 ? formatPKR(rate) : 'Select a locality'}</p>
            {selectedLocality?.category && <p className="mt-1 text-xs font-semibold text-emerald-800">FBR category: {selectedLocality.category}</p>}
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 sm:p-6">
          <div className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-emerald-700" /><span className="text-sm font-extrabold">Notification details</span></div>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-xs font-bold text-slate-500">Localities available</dt><dd className="mt-0.5 font-bold text-slate-900">{selectedCity?.localities.length ?? 0}</dd></div>
            <div><dt className="text-xs font-bold text-slate-500">FBR notification</dt><dd className="mt-0.5 font-bold text-slate-900">{selectedCity?.sro ?? 'Not stated'}</dd></div>
            <div><dt className="text-xs font-bold text-slate-500">Effective date</dt><dd className="mt-0.5 font-bold text-slate-900">{selectedCity?.effectiveDate ?? 'Not stated'}</dd></div>
          </dl>
          {selectedCity?.sourceUrl && <a href={selectedCity.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600"><ExternalLink className="h-4 w-4" />View official FBR source</a>}
          <div className="border-t border-slate-200 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated FBR/DC value</p><p className="mt-1 text-3xl font-extrabold text-slate-900">{formatPKR(totalValue)}</p></div>
        </aside>
      </div>
    </section>
  );
};
