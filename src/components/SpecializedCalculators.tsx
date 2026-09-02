import React, { useEffect, useState } from 'react';
import {
  Building2,
  Car,
  Laptop,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { formatPakistaniUnits, formatPKR } from '../utils/taxCalculator';
import { getPropertyValuationRates, type PropertyValuationCity } from '../services/supabaseClient';

type CityAreaValuation = {
  cityName: string;
  areas: Array<{
    area: string;
    residential: number;
    commercial: number;
    industrial: number;
    rate: number;
    cls?: string;
  }>;
};

const unitToSquareFeet = {
  marla: 225,
  kanal: 4500,
  sqyd: 9,
  sqft: 1,
} as const;

const fbrCityValuationFiles = import.meta.glob('../../paktaxcalculator-main/fbr-data/*.json', { eager: true }) as Record<string, any>;

const canonicalFbrCityList = [
  'Abbottabad',
  'Attock',
  'Bahawalpur',
  'Bannu',
  'Bhakkar',
  'Chakwal',
  'Chiniot',
  'Dera Ghazi Khan',
  'Dera Ismail Khan',
  'Faisalabad',
  'Ghora Gali',
  'Ghotki',
  'Gujranwala',
  'Gujrat',
  'Gwadar',
  'Hafizabad',
  'Haripur',
  'Hyderabad',
  'Islamabad',
  'Jhelum',
  'Karachi',
  'Kasur',
  'Khanewal',
  'Khushab',
  'Kohat',
  'Kotli Sattian',
  'Lahore',
  'Larkana',
  'Lasbela',
  'Lodhran',
  'Loralai',
  'Mandi Bahauddin',
  'Mansehra',
  'Mardan',
  'Mianwali',
  'Mirpurkhas',
  'Multan',
  'Murree',
  'Muzaffargarh',
  'Nankana',
  'Narowal',
  'Nowshera',
  'Okara',
  'Peshawar',
  'Quetta',
  'Rahim Yar Khan',
  'Rawalpindi',
  'Sahiwal',
  'Sargodha',
  'Sheikhupura',
  'Sialkot',
  'Sukkur',
  'Talagang',
  'Toba Tek Singh',
  'Vehari',
  'Wazirabad',
];

const loadedCityAreaData = Object.entries(fbrCityValuationFiles)
  .filter(([path]) => !path.includes('_index'))
  .map(([path, module]) => {
    const cityName = path.split('/').pop()?.replace(/\.json$/, '') ?? 'Unknown';
    const fileData = module.default ?? module ?? {};
    const rows = Array.isArray(fileData.rows)
      ? fileData.rows
      : Array.isArray(fileData.sections)
      ? fileData.sections.flatMap((section: any) => Array.isArray(section.rows) ? section.rows : [])
      : [];

    return {
      cityName,
      areas: rows
        .map((row: any) => {
          const areaName = row.area || row.tehsil || 'General';
          const residential = Number(row.resOpen ?? row.resBuilt ?? row.land ?? 0);
          const commercial = Number(row.comOpen ?? row.comBuilt ?? row.land ?? 0);
          const industrial = Number(row.indOpen ?? row.indBuilt ?? row.land ?? 0);

          return {
            area: areaName,
            residential: Number.isFinite(residential) ? residential : 0,
            commercial: Number.isFinite(commercial) ? commercial : 0,
            industrial: Number.isFinite(industrial) ? industrial : 0,
            rate: residential || commercial || industrial ? Math.max(residential, commercial, industrial) : 0,
            cls: row.cls,
          };
        })
        .filter((row: any) => row.area),
    };
  });

const fallbackCityAreaValuationData: CityAreaValuation[] = canonicalFbrCityList.map((cityName) => {
  const loadedEntry = loadedCityAreaData.find((entry) => entry.cityName === cityName);
  return loadedEntry ?? { cityName, areas: [] };
});

const getSupabaseCityAreas = (city: PropertyValuationCity): CityAreaValuation['areas'] => {
  const rows = city.data.rows ?? city.data.sections?.flatMap((section) => section.rows ?? []) ?? [];
  const areas = city.data.areas ?? rows;

  return areas.map((entry) => {
    const category = entry.category ? city.data.categories?.[entry.category] : entry;
    const residential = Number(category?.resOpen ?? category?.resBuilt ?? 0);
    const commercial = Number(category?.comOpen ?? category?.comBuilt ?? 0);
    const industrial = Number(category?.indOpen ?? category?.indBuilt ?? 0);
    return {
      area: entry.name ?? entry.area ?? entry.tehsil ?? 'General',
      residential,
      commercial,
      industrial,
      rate: Math.max(residential, commercial, industrial),
      cls: entry.category,
    };
  }).filter((area) => area.area !== 'General' || areas.length === 1);
};

interface SpecializedCalculatorsProps {
  initialTab?: 'property' | 'vehicle' | 'it-export';
}

export const SpecializedCalculators: React.FC<SpecializedCalculatorsProps> = ({ initialTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'property' | 'vehicle' | 'it-export'>(initialTab ?? 'property');

  // --- Property Calculator State ---
  const [propertyAction, setPropertyAction] = useState<'buy' | 'sell'>('buy');
  const [propertyValue, setPropertyValue] = useState<number>(20000000); // 2 Crore
  const [propertyFilerStatus, setPropertyFilerStatus] = useState<'filer' | 'non-filer'>('filer');
  const [selectedCity, setSelectedCity] = useState<string>('Lahore');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [propertyUsage, setPropertyUsage] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [fbrRate, setFbrRate] = useState<number>(0);
  const [fbrRateUnit, setFbrRateUnit] = useState<'marla' | 'kanal' | 'sqyd' | 'sqft'>('marla');
  const [propertySize, setPropertySize] = useState<number>(5);
  const [propertySizeUnit, setPropertySizeUnit] = useState<'marla' | 'kanal' | 'sqyd' | 'sqft'>('marla');
  const [cityAreaValuationData, setCityAreaValuationData] = useState<CityAreaValuation[]>(fallbackCityAreaValuationData);

  // --- Vehicle Calculator State ---
  const [vehicleEngineCC, setVehicleEngineCC] = useState<string>('1300');
  const [vehiclePrice, setVehiclePrice] = useState<number>(4500000); // 45 Lakhs
  const [vehicleFilerStatus, setVehicleFilerStatus] = useState<'filer' | 'non-filer'>('filer');

  // --- IT Export Calculator State ---
  const [itRemittanceCurrency, setItRemittanceCurrency] = useState<'USD' | 'PKR'>('USD');
  const [itAmount, setItAmount] = useState<number>(3000); // 3000 USD/month
  const [exchangeRate, setExchangeRate] = useState<number>(280);
  const [isPsebRegistered, setIsPsebRegistered] = useState<boolean>(true);

  useEffect(() => {
    const loadSupabaseValuations = async () => {
      const { data, error } = await getPropertyValuationRates(selectedCity);
      const areas = data ? getSupabaseCityAreas(data) : [];
      if (!error && areas.length > 0) {
        setCityAreaValuationData((currentCities) => currentCities.map((city) => (
          city.cityName === selectedCity ? { ...city, areas } : city
        )));
      }
    };

    void loadSupabaseValuations();
  }, [selectedCity]);

  const cityData = cityAreaValuationData.find((entry) => entry.cityName === selectedCity) ?? cityAreaValuationData[0];
  const cityAreas = cityData?.areas ?? [];

  useEffect(() => {
    if (cityAreas.length === 0) {
      setSelectedArea('');
      return;
    }

    setSelectedArea((currentArea) => {
      if (currentArea && cityAreas.some((area) => area.area === currentArea)) {
        return currentArea;
      }
      return cityAreas[0].area;
    });
  }, [selectedCity, cityAreas]);

  const selectedAreaInfo = cityAreas.find((entry) => entry.area === selectedArea) ?? cityAreas[0] ?? null;
  const selectedAreaRate = selectedAreaInfo ? Number(selectedAreaInfo[propertyUsage] ?? selectedAreaInfo.rate ?? 0) : 0;
  const autoFbrPropertyValue = selectedAreaRate > 0 && propertySize > 0
    ? selectedAreaRate * propertySize * unitToSquareFeet[propertySizeUnit] / unitToSquareFeet[fbrRateUnit]
    : 0;
  const effectivePropertyValue = autoFbrPropertyValue > 0 ? autoFbrPropertyValue : propertyValue;

  // Property Tax Math
  const calculatePropertyTax = () => {
    let rate = 0.03;
    let section = 'Section 236K (Advance Tax on Purchase)';

    if (propertyAction === 'buy') {
      section = 'Section 236K (Advance Tax on Purchase)';
      if (propertyFilerStatus === 'filer') rate = 0.03;
      else rate = 0.12;
    } else {
      section = 'Section 236C (Advance Tax on Sale / Transfer)';
      if (propertyFilerStatus === 'filer') rate = 0.03;
      else rate = 0.10;
    }

    const taxAmount = effectivePropertyValue * rate;
    return { taxAmount, rate, section };
  };

  const fbrPropertyValue = fbrRate * propertySize * unitToSquareFeet[propertySizeUnit] / unitToSquareFeet[fbrRateUnit];

  // Vehicle Advance Tax Math (Section 231B)
  const calculateVehicleTax = () => {
    let baseTax = 10000;
    let percentageOfValue = 0;

    switch (vehicleEngineCC) {
      case '850':
        baseTax = 10000;
        break;
      case '1000':
        baseTax = 20000;
        break;
      case '1300':
        baseTax = 30000;
        break;
      case '1600':
        baseTax = 50000;
        break;
      case '1800':
        baseTax = 150000;
        break;
      case '2000':
        baseTax = 200000;
        break;
      case '2500':
        percentageOfValue = 0.06; // 6% of value
        break;
      case '3000':
        percentageOfValue = 0.08; // 8% of value
        break;
      case '3001':
        percentageOfValue = 0.10; // 10% of value
        break;
      default:
        baseTax = 30000;
    }

    let calculatedTax = percentageOfValue > 0 ? vehiclePrice * percentageOfValue : baseTax;

    if (vehicleFilerStatus === 'non-filer') {
      calculatedTax *= 3; // 300% / 3x penalty for non-filers
    }

    return { calculatedTax, isPercentage: percentageOfValue > 0, percentageOfValue };
  };

  // IT Export Math
  const calculateITTax = () => {
    const pkrGrossMonthly = itRemittanceCurrency === 'USD' ? itAmount * exchangeRate : itAmount;
    const pkrGrossAnnual = pkrGrossMonthly * 12;
    const rate = isPsebRegistered ? 0.0025 : 0.01; // 0.25% vs 1%
    const taxMonthly = pkrGrossMonthly * rate;
    const taxAnnual = pkrGrossAnnual * rate;
    const netTakeHomeMonthly = pkrGrossMonthly - taxMonthly;
    const netTakeHomeAnnual = pkrGrossAnnual - taxAnnual;

    return {
      pkrGrossMonthly,
      pkrGrossAnnual,
      rate,
      taxMonthly,
      taxAnnual,
      netTakeHomeMonthly,
      netTakeHomeAnnual,
    };
  };

  const propResult = calculatePropertyTax();
  const vehResult = calculateVehicleTax();
  const itResult = calculateITTax();

  return (
    <div className="space-y-6">
      {!initialTab && <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 max-w-fit">
        <button
          onClick={() => setActiveSubTab('property')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'property'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          Property Tax (236K / 236C)
        </button>

        <button
          onClick={() => setActiveSubTab('vehicle')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'vehicle'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4 text-emerald-600" />
          Vehicle Registration (231B)
        </button>

        <button
          onClick={() => setActiveSubTab('it-export')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'it-export'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Laptop className="w-4 h-4 text-emerald-600" />
          IT / Freelancer Export (154A)
        </button>
      </div>}

      {/* 1. PROPERTY TAX CALCULATOR */}
      {activeSubTab === 'property' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Property Transaction Advance Tax
              </h3>
              <p className="text-xs text-slate-500">
                Calculate advance withholding tax under Section 236K (Buyer) and Section 236C (Seller).
              </p>
            </div>

            {/* Buy or Sell Switch */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Transaction Role:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPropertyAction('buy')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    propertyAction === 'buy'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Purchaser / Buyer (Sec 236K)
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyAction('sell')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    propertyAction === 'sell'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Seller / Transferor (Sec 236C)
                </button>
              </div>
            </div>

            {/* Filer Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Taxpayer Status on ATL:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPropertyFilerStatus('filer')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    propertyFilerStatus === 'filer'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Active Filer
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyFilerStatus('non-filer')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    propertyFilerStatus === 'non-filer'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Non-Filer
                </button>
              </div>
            </div>

            {/* FBR City / Area Valuation */}
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-900">FBR city / area valuation</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                >
                  {cityAreaValuationData.map((city) => (
                    <option key={city.cityName} value={city.cityName}>{city.cityName}</option>
                  ))}
                </select>

                <select
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                >
                  {cityAreas.length > 0 ? (
                    cityAreas.map((area) => (
                      <option key={area.area} value={area.area}>{area.area}</option>
                    ))
                  ) : (
                    <option value="">No locality data available</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  value={propertyUsage}
                  onChange={(event) => setPropertyUsage(event.target.value as 'residential' | 'commercial' | 'industrial')}
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>

                <select
                  value={fbrRateUnit}
                  onChange={(event) => setFbrRateUnit(event.target.value as 'marla' | 'kanal' | 'sqyd' | 'sqft')}
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="marla">Rate per Marla</option>
                  <option value="kanal">Rate per Kanal</option>
                  <option value="sqyd">Rate per Sq. Yd.</option>
                  <option value="sqft">Rate per Sq. Ft.</option>
                </select>
              </div>

              {cityAreas.length === 0 && (
                <p className="text-[11px] text-amber-800 font-semibold">
                  Locality data for this city is not loaded yet. Use the manual FBR rate field below or add the official city data file to complete the rate map.
                </p>
              )}
            </div>

            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="text-xs font-bold text-slate-800">Total area being bought / sold</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={propertySize || ''}
                  onChange={(e) => setPropertySize(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <select
                  value={propertySizeUnit}
                  onChange={(event) => setPropertySizeUnit(event.target.value as 'marla' | 'kanal' | 'sqyd' | 'sqft')}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="marla">Marla</option>
                  <option value="kanal">Kanal</option>
                  <option value="sqyd">Sq. Yd.</option>
                  <option value="sqft">Sq. Ft.</option>
                </select>
              </div>
              <div className="text-[11px] text-emerald-900 font-semibold">
                Locality rate: {selectedAreaRate > 0 ? formatPKR(selectedAreaRate) : 'Not available'} | Total DC value: {autoFbrPropertyValue > 0 ? formatPKR(autoFbrPropertyValue) : 'Add area to calculate'}
              </div>
            </div>

            {/* Property Value Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  FBR / DC Notified Valuation or Purchase Price (PKR)
                </label>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {formatPakistaniUnits(effectivePropertyValue)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={effectivePropertyValue || ''}
                  onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              {autoFbrPropertyValue > 0 && (
                <p className="text-[11px] text-emerald-800 font-semibold">
                  Locality rate applied for {selectedArea} in {selectedCity}: {formatPKR(autoFbrPropertyValue)} based on {propertySize} {propertySizeUnit}.
                </p>
              )}
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900">
              Tax Liability Calculation
            </h4>

            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Advance Tax Payable at Transfer
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-300">
                {formatPKR(propResult.taxAmount)}
              </div>
              <div className="text-xs text-slate-300">
                Applicable Rate: <span className="font-bold text-white">{(propResult.rate * 100).toFixed(1)}%</span> &bull; {propResult.section}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Adjustment & Compliance Rule:
              </div>
              <p>
                This advance tax paid under {propertyAction === 'buy' ? 'Section 236K' : 'Section 236C'} is <span className="font-bold text-emerald-800">100% adjustable</span> against your final annual income tax liability when filing your annual income tax return.
              </p>
              {propertyFilerStatus === 'non-filer' && (
                <div className="p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Non-Filers pay an extra {(propResult.rate * 100 - 3).toFixed(1)}% penalty tax that cannot be recovered easily.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. VEHICLE ADVANCE TAX CALCULATOR */}
      {activeSubTab === 'vehicle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Motor Vehicle Advance Tax (Section 231B)
              </h3>
              <p className="text-xs text-slate-500">
                Advance tax payable at the time of purchase, leasing, or registration of motor vehicles.
              </p>
            </div>

            {/* Engine Capacity Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Engine Displacement (CC):</label>
              <select
                value={vehicleEngineCC}
                onChange={(e) => setVehicleEngineCC(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="850">Under 850cc (e.g. Alto / Prince Pearl)</option>
                <option value="1000">851cc to 1000cc (e.g. Cultus / Wagon R)</option>
                <option value="1300">1001cc to 1300cc (e.g. City / Yaris 1.3)</option>
                <option value="1600">1301cc to 1600cc (e.g. Civic / Corolla 1.6 / Elantra)</option>
                <option value="1800">1601cc to 1800cc (e.g. Corolla Altis 1.8)</option>
                <option value="2000">1801cc to 2000cc (e.g. Sportage / Tucson / Sonata)</option>
                <option value="2500">2001cc to 2500cc (6% of Value)</option>
                <option value="3000">2501cc to 3000cc (8% of Value)</option>
                <option value="3001">Above 3000cc (10% of Value - Land Cruiser / Prado)</option>
              </select>
            </div>

            {/* Filer vs Non-Filer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Buyer Status:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVehicleFilerStatus('filer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    vehicleFilerStatus === 'filer'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Active Filer (1x Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleFilerStatus('non-filer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    vehicleFilerStatus === 'non-filer'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Non-Filer (3x Surcharge Rate)
                </button>
              </div>
            </div>

            {/* Vehicle Value (needed for > 2000cc) */}
            {['2500', '3000', '3001'].includes(vehicleEngineCC) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Vehicle Invoice / Market Price (PKR)
                  </label>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    {formatPakistaniUnits(vehiclePrice)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={vehiclePrice || ''}
                    onChange={(e) => setVehiclePrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900">
              Vehicle Advance Tax Result
            </h4>

            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Advance Withholding Tax u/s 231B
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-300">
                {formatPKR(vehResult.calculatedTax)}
              </div>
              <div className="text-xs text-slate-300">
                Engine: <span className="font-bold text-white">{vehicleEngineCC}cc</span> &bull; Status: <span className="font-bold uppercase text-white">{vehicleFilerStatus}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Adjustable Tax Credit:
              </div>
              <p>
                When you file your Annual FBR Income Tax return, provide your vehicle registration tax receipt (CPR / CPRN number) to deduct this entire advance tax amount directly from your final tax bill.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. IT EXPORTER & FREELANCER (SECTION 154A) */}
      {activeSubTab === 'it-export' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                IT Export & Freelance Remittance Tax (Section 154A)
              </h3>
              <p className="text-xs text-slate-500">
                Calculate concessionary final tax for software exporters, IT services, and freelance professionals remitting foreign income via banking channels.
              </p>
            </div>

            {/* Currency Switcher & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Currency:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setItRemittanceCurrency('USD')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      itRemittanceCurrency === 'USD'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setItRemittanceCurrency('PKR')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      itRemittanceCurrency === 'PKR'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    PKR (Rs.)
                  </button>
                </div>
              </div>

              {itRemittanceCurrency === 'USD' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">USD/PKR Exchange Rate:</label>
                  <input
                    type="number"
                    min="1"
                    value={exchangeRate || ''}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* Remittance Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Monthly Foreign Remittance Inflow ({itRemittanceCurrency})
                </label>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {itRemittanceCurrency === 'USD' ? `$${itAmount.toLocaleString()}` : formatPKR(itAmount)}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="100"
                value={itAmount || ''}
                onChange={(e) => setItAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* PSEB Registration Check */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5">
              <input
                id="pseb-checkbox"
                type="checkbox"
                checked={isPsebRegistered}
                onChange={(e) => setIsPsebRegistered(e.target.checked)}
                className="mt-1 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="pseb-checkbox" className="text-xs text-teal-950 cursor-pointer leading-tight">
                <span className="font-bold">PSEB / P@SHA Registered Exporter (0.25% Final Tax):</span> Check if you are registered with Pakistan Software Export Board and receiving remittance in a specialized foreign currency / business bank account.
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900">
              IT Export Final Tax Summary
            </h4>

            <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                Net Monthly Take-Home (PKR)
              </span>
              <div className="text-3xl font-extrabold font-mono text-white">
                {formatPKR(itResult.netTakeHomeMonthly)}
              </div>
              <div className="text-xs text-teal-200">
                Annual In-Hand: <span className="font-mono font-bold text-white">{formatPKR(itResult.netTakeHomeAnnual)}</span> ({formatPakistaniUnits(itResult.netTakeHomeAnnual)})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Gross Monthly</span>
                <div className="text-lg font-bold font-mono text-slate-900">
                  {formatPKR(itResult.pkrGrossMonthly)}
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase">
                  FBR Tax ({(itResult.rate * 100).toFixed(2)}%)
                </span>
                <div className="text-lg font-bold font-mono text-rose-700">
                  {formatPKR(itResult.taxMonthly)}/mo
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Final Tax Regime (FTR) Advantages:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>Tax deducted by your bank under Section 154A constitutes full and final tax discharge.</li>
                <li>No progressive tax slabs or standard business audits apply to these export proceeds.</li>
                <li>Keep your bank PRC (Proceeds Realization Certificate) safely for FBR annual return filing.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
