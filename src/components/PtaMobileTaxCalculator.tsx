import React, { useState } from 'react';
import { Calculator, Smartphone } from 'lucide-react';
import { formatPKR } from '../utils/taxCalculator';

type RegistrationMethod = 'cnic' | 'passport';

const FIXED_DUTIES = {
  cnic: 14750,
  passport: 11800,
} as const;

const POPULAR_PHONE_VALUES = [
  ['Apple', 'iPhone 16 Pro Max', 1199], ['Apple', 'iPhone 16 Pro', 999], ['Apple', 'iPhone 16', 799], ['Apple', 'iPhone 15 Pro Max', 1199], ['Apple', 'iPhone 15 Pro', 999], ['Apple', 'iPhone 15', 799], ['Apple', 'iPhone 14 Pro Max', 1099], ['Apple', 'iPhone 14 Pro', 999], ['Apple', 'iPhone 14', 799], ['Apple', 'iPhone 13 Pro Max', 1099], ['Apple', 'iPhone 13 Pro', 999], ['Apple', 'iPhone 13', 799], ['Apple', 'iPhone 12 Pro Max', 1099], ['Apple', 'iPhone 12 Pro', 999], ['Apple', 'iPhone 12', 799], ['Apple', 'iPhone 11 Pro Max', 1099], ['Apple', 'iPhone 11', 699],
  ['Samsung', 'Galaxy S25 Ultra', 1299], ['Samsung', 'Galaxy S24 Ultra', 1299], ['Samsung', 'Galaxy S23 Ultra', 1199], ['Samsung', 'Galaxy S22 Ultra', 1199], ['Samsung', 'Galaxy S21 Ultra', 1199], ['Samsung', 'Galaxy S20 Ultra', 1399], ['Samsung', 'Galaxy S25', 799], ['Samsung', 'Galaxy S24', 799], ['Samsung', 'Galaxy S23', 799], ['Samsung', 'Galaxy A56', 499], ['Samsung', 'Galaxy A55', 479], ['Samsung', 'Galaxy A54', 449], ['Samsung', 'Galaxy A34', 349],
  ['Google', 'Pixel 9 Pro XL', 1099], ['Google', 'Pixel 9 Pro', 999], ['Google', 'Pixel 8 Pro', 999], ['Google', 'Pixel 8', 699], ['Google', 'Pixel 7 Pro', 899], ['Google', 'Pixel 7', 599], ['Google', 'Pixel 6 Pro', 899], ['Google', 'Pixel 6', 599],
  ['Xiaomi', 'Xiaomi 14 Ultra', 1499], ['Xiaomi', 'Xiaomi 14', 999], ['Xiaomi', 'Xiaomi 13 Pro', 1299], ['Xiaomi', 'Redmi Note 14 Pro', 329], ['Xiaomi', 'Redmi Note 13 Pro', 299], ['Xiaomi', 'Redmi Note 12 Pro', 299], ['Xiaomi', 'Redmi Note 11 Pro', 299], ['Xiaomi', 'Poco X6 Pro', 369], ['Xiaomi', 'Poco X5 Pro', 299],
  ['OnePlus', 'OnePlus 13', 899], ['OnePlus', 'OnePlus 12', 799], ['OnePlus', 'OnePlus 11', 699], ['OnePlus', 'OnePlus 10 Pro', 899], ['OnePlus', 'OnePlus Nord 4', 499],
  ['Oppo', 'Reno 12 Pro', 599], ['Oppo', 'Reno 11 Pro', 599], ['Oppo', 'Reno 10 Pro', 499], ['Oppo', 'Find X5 Pro', 1099], ['Oppo', 'A98', 349],
  ['Vivo', 'V40 Pro', 599], ['Vivo', 'V30 Pro', 499], ['Vivo', 'V29', 399], ['Vivo', 'X100 Pro', 999], ['Vivo', 'Y36', 249],
  ['Infinix', 'GT 20 Pro', 299], ['Infinix', 'Note 40 Pro', 249], ['Infinix', 'Note 30 Pro', 229], ['Infinix', 'Zero 30', 339], ['Infinix', 'Hot 40 Pro', 199],
  ['Tecno', 'Camon 30 Pro', 299], ['Tecno', 'Camon 20 Pro', 229], ['Tecno', 'Camon 19 Pro', 219], ['Tecno', 'Phantom V Fold', 999], ['Tecno', 'Spark 20 Pro', 169],
  ['Realme', 'GT 6', 599], ['Realme', 'GT Neo 3', 449], ['Realme', '12 Pro Plus', 399], ['Realme', '11 Pro Plus', 379], ['Realme', 'C67', 169],
].map(([brand, model, valueUsd]) => ({ brand, model: `${brand} ${model}`, valueUsd: Number(valueUsd) }));

export const PtaMobileTaxCalculator: React.FC = () => {
  const [selectedPhone, setSelectedPhone] = useState('');
  const [phoneValueUsd, setPhoneValueUsd] = useState(500);
  const [exchangeRate, setExchangeRate] = useState(280);
  const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>('cnic');

  const phoneValuePkr = Math.max(0, phoneValueUsd) * Math.max(0, exchangeRate);
  const salesTax = phoneValuePkr * 0.18;
  const incomeTax = phoneValuePkr * 0.03;
  const fixedDuty = FIXED_DUTIES[registrationMethod];
  const totalTax = salesTax + incomeTax + fixedDuty;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-white"><Smartphone className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">PTA Mobile Registration Tax Calculator</h2>
            <p className="mt-0.5 text-xs text-slate-600">Estimate charges, then use the official FBR lookup for the payable duty on your exact device.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Calculator className="h-4 w-4 text-emerald-700" /> Phone details</h3>
          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            Popular phone model
            <select
              value={selectedPhone}
              onChange={(event) => {
                const phone = POPULAR_PHONE_VALUES.find((item) => item.model === event.target.value);
                setSelectedPhone(event.target.value);
                if (phone) setPhoneValueUsd(phone.valueUsd);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">Choose a model or enter value manually</option>
              {Array.from(new Set(POPULAR_PHONE_VALUES.map((phone) => phone.brand))).map((brand) => (
                <optgroup key={brand} label={brand}>
                  {POPULAR_PHONE_VALUES.filter((phone) => phone.brand === brand).map((phone) => <option key={phone.model} value={phone.model}>{phone.model}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            Phone value (USD)
            <input type="number" min="0" step="1" value={phoneValueUsd || ''} onChange={(event) => setPhoneValueUsd(Math.max(0, Number(event.target.value)))} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600" />
          </label>
          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            USD to PKR exchange rate
            <input type="number" min="0" step="0.01" value={exchangeRate || ''} onChange={(event) => setExchangeRate(Math.max(0, Number(event.target.value)))} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600" />
          </label>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Registration method</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRegistrationMethod('cnic')} className={`rounded-lg border px-3 py-2.5 text-xs font-bold ${registrationMethod === 'cnic' ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>CNIC</button>
              <button type="button" onClick={() => setRegistrationMethod('passport')} className={`rounded-lg border px-3 py-2.5 text-xs font-bold ${registrationMethod === 'passport' ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>Passport</button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6">
          <h3 className="text-sm font-extrabold text-slate-900">Illustrative estimate</h3>
          <div className="mt-4 rounded-xl bg-slate-900 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Estimated taxes and duties</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-300">{formatPKR(totalTax)}</p>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2"><dt className="text-slate-600">Phone value in PKR</dt><dd className="font-bold">{formatPKR(phoneValuePkr)}</dd></div>
            <div className="flex justify-between border-b border-slate-100 pb-2"><dt className="text-slate-600">Sales tax estimate (18%)</dt><dd className="font-bold">{formatPKR(salesTax)}</dd></div>
            <div className="flex justify-between border-b border-slate-100 pb-2"><dt className="text-slate-600">Income tax estimate (3%)</dt><dd className="font-bold">{formatPKR(incomeTax)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Fixed duty ({registrationMethod.toUpperCase()})</dt><dd className="font-bold">{formatPKR(fixedDuty)}</dd></div>
          </dl>
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            FBR/PTA does not provide a public rate API. The final duty depends on the handset's IMEI, valuation ruling, exchange rate, and registration timing.
            <div className="mt-3 flex flex-wrap gap-3">
              <a href="https://www.weboc.gov.pk/(S(ycvayswdqgmhcqkhb1tavhu2))/Shared/MobileDeviceDutyInformation.aspx" target="_blank" rel="noreferrer" className="inline-flex font-bold text-emerald-800 underline underline-offset-2">Check official FBR mobile duty</a>
              <a href="https://dirbs.pta.gov.pk/" target="_blank" rel="noreferrer" className="inline-flex font-bold text-emerald-800 underline underline-offset-2">Open PTA DIRBS</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
