import React, { useState, useRef } from 'react';
import { Trash2, Plus, Download, Share2, Calendar } from 'lucide-react';
import { calculateZakat, formatDateISO, convertToHijri, ZAKAT_ASSET_TYPES, type ZakatAsset, type ZakatCalculationResult } from '../types/zakat';
import { useAuth } from '../contexts/AuthContext';
import { exportToPDF, exportToJSON, printCalculation } from '../utils/pdfExport';

const ZakatCalculator: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'home' | 'eligibility' | 'dueDate' | 'calculate'>('eligibility');
  const [assets, setAssets] = useState<ZakatAsset[]>([
    { type: 'cash', amount: 0, currency: 'PKR' },
  ]);
  const [debt, setDebt] = useState(0);
  const [hawlStartDate, setHawlStartDate] = useState(formatDateISO(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))); // 1 year ago
  const [goldPrice, setGoldPrice] = useState(15000);
  const [silverPrice, setSilverPrice] = useState(200);
  const [result, setResult] = useState<ZakatCalculationResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [dateEntryMode, setDateEntryMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [hijriDay, setHijriDay] = useState('1');
  const [hijriMonth, setHijriMonth] = useState('1');
  const [hijriYear, setHijriYear] = useState('1447');
  const [eligibilityAnswers, setEligibilityAnswers] = useState({ person: '', ownership: '', growingWealth: '', hawl: '' });
  const [eligibilityCash, setEligibilityCash] = useState(0);
  const [eligibilityDebt, setEligibilityDebt] = useState(0);
  const [eligibilityGoldGrams, setEligibilityGoldGrams] = useState(0);
  const [eligibilitySilverGrams, setEligibilitySilverGrams] = useState(0);
  const [eligibilityGoldUnit, setEligibilityGoldUnit] = useState<'grams' | 'tola' | 'troy-ounce' | 'kilogram'>('grams');
  const [eligibilitySilverUnit, setEligibilitySilverUnit] = useState<'grams' | 'tola' | 'troy-ounce' | 'kilogram'>('grams');
  const [showEligibilityResult, setShowEligibilityResult] = useState(false);
  const [reminderStatus, setReminderStatus] = useState('');

  const handleAddAsset = () => {
    setAssets([...assets, { type: 'cash', amount: 0, currency: 'PKR' }]);
  };

  const handleRemoveAsset = (index: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter((_, i) => i !== index));
    }
  };

  const handleAssetChange = (index: number, field: keyof ZakatAsset, value: unknown) => {
    const updatedAssets = [...assets];
    updatedAssets[index] = { ...updatedAssets[index], [field]: value };
    setAssets(updatedAssets);
  };

  const handleCalculate = () => {
    const today = new Date();
    const calculationResult = calculateZakat({
      assets,
      hawlStartDate,
      currentDate: formatDateISO(today),
      debt,
      goldPricePerGram: goldPrice,
      silverPricePerGram: silverPrice,
    });
    setResult(calculationResult);
  };

  const setHawlFromHijri = () => {
    const day = Number(hijriDay);
    const month = Number(hijriMonth);
    const year = Number(hijriYear);
    if (!day || !month || !year || day > 30 || month > 12) return;

    const julianDay = Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month - Math.floor((month - 1) / 2) + day + 1948440 - 385;
    const unixMilliseconds = (julianDay - 2440588) * 86400000;
    setHawlStartDate(formatDateISO(new Date(unixMilliseconds)));
  };

  const saveZakatReminder = () => {
    const reminder = {
      hawlStartDate,
      dueDate: formatDateISO(hawlDueDate),
      dueDateHijri: `${hawlDueHijri.day}/${hawlDueHijri.month}/${hawlDueHijri.year}H`,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('zakat-due-date-reminder', JSON.stringify(reminder));
    setReminderStatus(`Reminder saved for ${reminder.dueDate}.`);
  };

  const handleDownloadPDF = async () => {
    try {
      await exportToPDF('zakat-result', {
        filename: `zakat-calculation-${formatDateISO(new Date())}.pdf`,
        title: 'Zakat Calculation Report',
        userEmail: user?.email,
        calculationType: 'Zakat',
      });
    } catch (error) {
      alert('Failed to export PDF');
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(
        { assets, debt, hawlStartDate, result },
        `zakat-calculation-${formatDateISO(new Date())}.json`
      );
    } catch (error) {
      alert('Failed to export JSON');
    }
  };

  const handlePrint = () => {
    printCalculation('zakat-result', 'Zakat Calculation Report');
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'Zakat Calculation',
          text: `My Zakat Amount: PKR ${result.zakatAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const hijriDate = convertToHijri(new Date(hawlStartDate));
  const today = new Date();
  const daysRemaining = Math.max(0, 354 - (result?.daysSinceHawl || 0));
  const currentNisab = Math.min(87.48 * goldPrice, 612.36 * silverPrice);
  const enteredWealth = Math.max(0, assets.reduce((total, asset) => total + asset.amount, 0) - debt);
  const hawlDueDate = new Date(new Date(hawlStartDate).getTime() + 354 * 24 * 60 * 60 * 1000);
  const hawlDueHijri = convertToHijri(hawlDueDate);
  const unitToGrams = { grams: 1, tola: 11.6638, 'troy-ounce': 31.1035, kilogram: 1000 };
  const eligibilityWealth = Math.max(0, eligibilityCash + eligibilityGoldGrams * unitToGrams[eligibilityGoldUnit] * goldPrice + eligibilitySilverGrams * unitToGrams[eligibilitySilverUnit] * silverPrice - eligibilityDebt);
  const eligibilityReady = Object.values(eligibilityAnswers).every((answer) => answer !== '');
  const eligibilityPasses = eligibilityAnswers.person === 'yes' && eligibilityAnswers.ownership === 'yes' && eligibilityAnswers.growingWealth === 'yes' && eligibilityAnswers.hawl === 'yes' && eligibilityWealth >= currentNisab;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">Zakat Calculator</h1>
        <p className="text-slate-600 mb-5">Check eligibility, find your Zakat due date using the Islamic calendar, or calculate Zakat due.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button onClick={() => setMode('eligibility')} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${mode === 'eligibility' ? 'bg-emerald-800 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>Check Eligibility</button>
          <button onClick={() => setMode('dueDate')} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${mode === 'dueDate' ? 'bg-emerald-800 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>Find Zakat Due Date</button>
          <button onClick={() => setMode('calculate')} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${mode === 'calculate' ? 'bg-emerald-800 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>Calculate Zakat Due</button>
        </div>
      </div>

      {mode === 'eligibility' && (
        <div className="max-w-3xl rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-emerald-900">Check Your Zakat Eligibility</h2>
          <p className="mt-2 text-sm text-slate-600">Answer the conditions below, then check your wealth against the current silver Nisab threshold.</p>
          {[
            ['person', 'Are you Muslim, of sound mind, and an adult?'],
            ['ownership', 'Do you fully own this wealth?'],
            ['growingWealth', 'Is it zakatable wealth, such as cash, gold, silver, trade goods, or investments?'],
            ['hawl', 'Has one complete Islamic year (Hawl) passed while the wealth stayed at or above Nisab?'],
          ].map(([key, question], index) => (
            <div key={key} className="mt-4 rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-bold text-slate-800">{index + 1}. {question}</p>
              <div className="mt-2 flex gap-2">
                {['yes', 'no'].map((answer) => <button key={answer} onClick={() => setEligibilityAnswers({ ...eligibilityAnswers, [key]: answer })} className={`rounded-md px-4 py-1.5 text-xs font-bold ${eligibilityAnswers[key as keyof typeof eligibilityAnswers] === answer ? 'bg-emerald-800 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>{answer === 'yes' ? 'Yes' : 'No'}</button>)}
              </div>
            </div>
          ))}
          <div className="mt-5 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-2">
            <div><label className="text-xs font-bold text-emerald-900">Cash and bank balance (PKR)</label><input type="number" min="0" value={eligibilityCash || ''} onChange={(event) => setEligibilityCash(Number(event.target.value) || 0)} className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2" /></div>
            <div><label className="text-xs font-bold text-emerald-900">Debts and essential needs (PKR)</label><input type="number" min="0" value={eligibilityDebt || ''} onChange={(event) => setEligibilityDebt(Number(event.target.value) || 0)} className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2" /></div>
            <div><label className="text-xs font-bold text-emerald-900">Gold held</label><div className="mt-1 grid grid-cols-2 gap-2"><input type="number" min="0" value={eligibilityGoldGrams || ''} onChange={(event) => setEligibilityGoldGrams(Number(event.target.value) || 0)} className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2" /><select value={eligibilityGoldUnit} onChange={(event) => setEligibilityGoldUnit(event.target.value as typeof eligibilityGoldUnit)} className="rounded-lg border border-emerald-300 bg-white px-2 py-2 text-sm"><option value="grams">Grams</option><option value="tola">Tola</option><option value="troy-ounce">Troy oz</option><option value="kilogram">Kilogram</option></select></div></div>
            <div><label className="text-xs font-bold text-emerald-900">Silver held</label><div className="mt-1 grid grid-cols-2 gap-2"><input type="number" min="0" value={eligibilitySilverGrams || ''} onChange={(event) => setEligibilitySilverGrams(Number(event.target.value) || 0)} className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2" /><select value={eligibilitySilverUnit} onChange={(event) => setEligibilitySilverUnit(event.target.value as typeof eligibilitySilverUnit)} className="rounded-lg border border-emerald-300 bg-white px-2 py-2 text-sm"><option value="grams">Grams</option><option value="tola">Tola</option><option value="troy-ounce">Troy oz</option><option value="kilogram">Kilogram</option></select></div></div>
          </div>
          <button onClick={() => setShowEligibilityResult(true)} className="mt-5 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Check My Eligibility</button>
          {showEligibilityResult && <div className={`mt-4 rounded-lg p-4 text-sm font-semibold ${eligibilityPasses ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}><p>Net zakatable wealth: PKR {eligibilityWealth.toLocaleString()}</p><p>Nisab threshold: PKR {currentNisab.toLocaleString()}</p><p className="mt-2">{eligibilityReady ? (eligibilityPasses ? 'Based on your answers and entered values, Zakat appears due. Use the full calculator to confirm your final amount.' : 'Based on your answers or entered values, Zakat does not appear due yet.') : 'Please answer all four questions to complete the eligibility check.'}</p></div>}
        </div>
      )}

      {mode === 'dueDate' && (
        <div className="max-w-3xl rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-900"><Calendar className="h-5 w-5" /> Find Your Zakat Due Date</h2>
          <p className="mt-2 text-sm text-slate-600">Enter the date you became Sahib-e-Nisab, when your wealth first reached Nisab. A full Hawl is approximately 354 days.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => setDateEntryMode('gregorian')} className={`rounded-lg px-3 py-2 text-sm font-bold ${dateEntryMode === 'gregorian' ? 'bg-emerald-800 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-900'}`}>Enter Gregorian Date</button>
            <button onClick={() => setDateEntryMode('hijri')} className={`rounded-lg px-3 py-2 text-sm font-bold ${dateEntryMode === 'hijri' ? 'bg-emerald-800 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-900'}`}>Enter Hijri Date</button>
          </div>
          {dateEntryMode === 'gregorian' ? (
            <><label className="mt-5 block text-sm font-bold text-slate-700">Sahib-e-Nisab Start Date (Gregorian)</label><input type="date" value={hawlStartDate} onChange={(event) => setHawlStartDate(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500" /></>
          ) : (
            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-700">Sahib-e-Nisab Start Date (Hijri)</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <select value={hijriDay} onChange={(event) => setHijriDay(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 font-medium"><option value="">Day</option>{Array.from({ length: 30 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select>
                <select value={hijriMonth} onChange={(event) => setHijriMonth(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 font-medium"><option value="">Month</option>{['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'].map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
                <input type="number" min="1" value={hijriYear} onChange={(event) => setHijriYear(event.target.value)} placeholder="Hijri year" className="rounded-lg border border-slate-300 px-3 py-2 font-medium" />
              </div>
              <button onClick={setHawlFromHijri} className="mt-3 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Use Hijri Date</button>
            </div>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">START DATE (HIJRI)</p><p className="mt-1 text-xl font-bold text-emerald-900">{hijriDate.day}/{hijriDate.month}/{hijriDate.year}H</p></div>
            <div className="rounded-lg bg-slate-900 p-4 text-white"><p className="text-xs font-bold text-emerald-300">ZAKAT DUE DATE</p><p className="mt-1 text-xl font-bold">{formatDateISO(hawlDueDate)}</p><p className="mt-1 text-sm text-emerald-200">{hawlDueHijri.day}/{hawlDueHijri.month}/{hawlDueHijri.year}H</p></div>
          </div>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-900">Set a Zakat Due-Date Reminder</p>
            <p className="mt-1 text-xs text-emerald-800">Save this Hawl due date on this device for your next Zakat calculation.</p>
            <button onClick={saveZakatReminder} className="mt-3 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Set Reminder</button>
            {reminderStatus && <p className="mt-2 text-xs font-semibold text-emerald-800">{reminderStatus}</p>}
          </div>
          <p className="mt-4 text-xs text-slate-500">Actual moon-sighting dates can vary by a day or two.</p>
        </div>
      )}

      <div className={mode === 'calculate' ? 'grid md:grid-cols-3 gap-6' : 'hidden'}>
        <div className="md:col-span-2 space-y-6">
          {/* Hawl Date Section */}
          <div className="bg-white rounded-lg border border-emerald-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Zakat Year Start Date (Hawl)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Islamic (Hijri)</label>
                <div className="text-2xl font-bold text-emerald-600">
                  {hijriDate.day}/{hijriDate.month}/{hijriDate.year}H
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gregorian Date</label>
                <input
                  type="date"
                  value={hawlStartDate}
                  onChange={(e) => setHawlStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="bg-white rounded-lg border border-emerald-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-900">Assets</h2>
              <button
                onClick={handleAddAsset}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Asset
              </button>
            </div>

            <div className="space-y-4">
              {assets.map((asset, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Asset Type</label>
                      <select
                        value={asset.type}
                        onChange={(e) => handleAssetChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        {ZAKAT_ASSET_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{asset.type === 'gold' || asset.type === 'silver' ? 'Weight' : 'Amount'}</label>
                      <input
                        type="number"
                        value={asset.amount}
                        onChange={(e) => handleAssetChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    {(asset.type === 'gold' || asset.type === 'silver') ? (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                        <select value={asset.unit || 'grams'} onChange={(event) => handleAssetChange(index, 'unit', event.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"><option value="grams">Grams</option><option value="tola">Tola</option><option value="troy-ounce">Troy oz</option><option value="kilogram">Kilogram</option></select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                        <select value={asset.currency || 'PKR'} onChange={(event) => handleAssetChange(index, 'currency', event.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                          <option value="PKR">PKR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="AED">AED</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{asset.type === 'gold' || asset.type === 'silver' ? 'Purity %' : 'Note (optional)'}</label>
                      {asset.type === 'gold' || asset.type === 'silver' ? <input type="number" min="0" max="100" value={asset.purityPercentage ?? 100} onChange={(event) => handleAssetChange(index, 'purityPercentage', parseFloat(event.target.value) || 100)} placeholder="Purity %" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /> : <input type="text" value={asset.description || ''} onChange={(event) => handleAssetChange(index, 'description', event.target.value)} placeholder="e.g. bank, investment" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />}
                    </div>
                    {assets.length > 1 && (
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveAsset(index)}
                          className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Debt & Nisab */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-emerald-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-900 mb-4">Deductions</h3>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Debt (PKR)</label>
              <input
                type="number"
                value={debt}
                onChange={(e) => setDebt(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white rounded-lg border border-emerald-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-900 mb-4">Nisab Rates</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gold (PKR/gram)</label>
                  <input
                    type="number"
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Silver (PKR/gram)</label>
                  <input
                    type="number"
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-green-700 transition shadow-lg text-lg"
          >
            Calculate Zakat Due
          </button>
        </div>

        {/* Right Panel - Info & Results */}
        <div className="bg-white rounded-lg border border-emerald-200 p-6 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-emerald-900 mb-4">How Zakat Works</h3>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-emerald-800 mb-1">🕌 Nisab</p>
              <p>Minimum wealth threshold. Zakat is due only if your wealth exceeds this amount.</p>
            </div>
            <div>
              <p className="font-semibold text-emerald-800 mb-1">📅 Hawl</p>
              <p>Islamic year (354-355 days). Your wealth must remain above Nisab for the complete lunar year.</p>
            </div>
            <div>
              <p className="font-semibold text-emerald-800 mb-1">💰 Rate</p>
              <p>Zakat is 2.5% of zakatable wealth.</p>
            </div>
          </div>

          {result && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Total Assets</p>
                <p className="text-xl font-bold text-emerald-600">
                  PKR {result.totalAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Zakat Due</p>
                <p className="text-2xl font-bold text-emerald-900">
                  PKR {result.zakatAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Days Since Hawl Start</p>
                <p className="text-lg font-semibold text-emerald-700">
                  {result.daysSinceHawl} / 354 days
                </p>
                <div className={`mt-2 px-3 py-2 rounded-lg text-center font-semibold ${result.hawlComplete ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {result.hawlComplete ? '✓ Zakat Due' : `⏳ ${daysRemaining} days`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZakatCalculator;
