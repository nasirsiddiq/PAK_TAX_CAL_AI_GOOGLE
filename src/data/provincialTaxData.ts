import {
  Province,
  ProvinceInfo,
  ServiceCategory,
  AgriLandSlab,
  AgriIncomeSlab,
  PropertyTransferRates,
  VehicleTokenRate,
  ProfessionalTaxSlab,
} from '../types/provincialTax';

export const PROVINCES_CONFIG: Record<Province, ProvinceInfo> = {
  punjab: {
    id: 'punjab',
    name: 'Punjab',
    shortName: 'PB',
    authority: 'PRA',
    authorityFullName: 'Punjab Revenue Authority',
    standardServicesRate: 0.16, // 16%
    portalUrl: 'https://pra.punjab.gov.pk',
    badgeColor: 'emerald',
    description: 'Governed by Punjab Sales Tax on Services Act 2012, Punjab Agricultural Income Tax Act, and Punjab Stamp Act.',
  },
  sindh: {
    id: 'sindh',
    name: 'Sindh',
    shortName: 'SD',
    authority: 'SRB',
    authorityFullName: 'Sindh Revenue Board',
    standardServicesRate: 0.13, // 13% standard (reduced from 15% / 14%)
    portalUrl: 'https://srb.gos.pk',
    badgeColor: 'blue',
    description: 'Governed by Sindh Sales Tax on Services Act 2011, Sindh Agricultural Income Tax Act, and Sindh Stamp Act.',
  },
  kpk: {
    id: 'kpk',
    name: 'Khyber Pakhtunkhwa',
    shortName: 'KP',
    authority: 'KPRA',
    authorityFullName: 'Khyber Pakhtunkhwa Revenue Authority',
    standardServicesRate: 0.15, // 15%
    portalUrl: 'https://kpra.gov.pk',
    badgeColor: 'teal',
    description: 'Governed by Khyber Pakhtunkhwa Sales Tax on Services Act 2022 and KP Land Revenue Rules.',
  },
  balochistan: {
    id: 'balochistan',
    name: 'Balochistan',
    shortName: 'BA',
    authority: 'BRA',
    authorityFullName: 'Balochistan Revenue Authority',
    standardServicesRate: 0.15, // 15%
    portalUrl: 'https://bra.gob.pk',
    badgeColor: 'amber',
    description: 'Governed by Balochistan Sales Tax on Services Act 2015 and Balochistan Land Revenue Act.',
  },
  ict: {
    id: 'ict',
    name: 'Islamabad Capital Territory',
    shortName: 'ICT',
    authority: 'ICT',
    authorityFullName: 'Islamabad Revenue / FBR Services Wing',
    standardServicesRate: 0.15, // 15% (Islamabad Capital Territory Sales Tax on Services Ordinance)
    portalUrl: 'https://fbr.gov.pk',
    badgeColor: 'indigo',
    description: 'Governed by Islamabad Capital Territory (Tax on Services) Ordinance 2001 administered by FBR.',
  },
};

// 1. SERVICES CATEGORIES & TARIFF RATES ACROSS PROVINCES
export const PROVINCIAL_SERVICES_CATALOG: Record<Province, ServiceCategory[]> = {
  punjab: [
    {
      id: 'general-consulting',
      name: 'Business, Management & Professional Consultancy',
      code: '9815.0000',
      description: 'Legal, tax, financial, engineering, human resources & advisory services.',
      standardRate: 0.16,
      withholdingRate: 0.16,
      notes: '16% standard rate with input tax credit.',
    },
    {
      id: 'it-software',
      name: 'IT, Software Development & Cloud Hosting',
      code: '9815.6000',
      description: 'Software development, SaaS, mobile apps, web design, cloud servers, tech support.',
      standardRate: 0.05,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: 'Special concessionary 5% rate without input tax adjustment (or 16% with input tax). Export of IT services is 0% zero-rated.',
    },
    {
      id: 'restaurants-cafes',
      name: 'Restaurants, Cafes & Food Catering',
      code: '9801.2000',
      description: 'Dining, fast food, banquet halls, and outdoor catering.',
      standardRate: 0.16,
      digitalPaymentRate: 0.05, // 5% on card / digital POS
      withholdingRate: 0.05,
      notes: '5% when paid via debit/credit cards, mobile wallets, or digital POS. 16% on cash payments.',
    },
    {
      id: 'construction-works',
      name: 'Construction, Civil Contracting & Renovation',
      code: '9814.2000',
      description: 'Building construction, roads, infrastructure, MEP, painting & civil works.',
      standardRate: 0.16,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% without input tax credit for pure service/labor contracts, or 16% standard with input credit.',
    },
    {
      id: 'advertising-media',
      name: 'Advertising Agencies, Digital Marketing & PR',
      code: '9805.3000',
      description: 'Print, TV, social media advertising, billboards, and media placement.',
      standardRate: 0.16,
      withholdingRate: 0.16,
      notes: '16% standard rate on commission and placement billings.',
    },
    {
      id: 'freight-courier',
      name: 'Freight Forwarding, Logistics & Courier Services',
      code: '9804.1000',
      description: 'Domestic freight, parcel delivery, cargo transport, and shipping agents.',
      standardRate: 0.16,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '16% on courier; freight forwarding services taxed at 16% or 5% depending on sub-category.',
    },
    {
      id: 'security-services',
      name: 'Security Agencies & Guard Services',
      code: '9818.1000',
      description: 'Manned guarding, CCTV monitoring, and cash-in-transit transport.',
      standardRate: 0.16,
      withholdingRate: 0.16,
      notes: '16% standard rate. 100% withholding applicable when hired by withholding agents.',
    },
    {
      id: 'hotel-accommodation',
      name: 'Hotels, Motels & Guest Houses',
      code: '9801.1000',
      description: 'Room stay, banquets, and associated hotel amenities.',
      standardRate: 0.16,
      digitalPaymentRate: 0.05,
      withholdingRate: 0.05,
      notes: '16% standard rate or 5% under authorized digital POS scheme.',
    },
    {
      id: 'beauty-salons',
      name: 'Beauty Parlors, Salons, Spas & Gyms',
      code: '9810.0000',
      description: 'Personal grooming, fitness training, and wellness centers.',
      standardRate: 0.16,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% concessionary rate for standalone salons and fitness centers.',
    },
    {
      id: 'telecom',
      name: 'Telecommunication & Internet Service Providers (ISP)',
      code: '9812.0000',
      description: 'Cellular network, fixed broadband line, fiber internet, and data services.',
      standardRate: 0.195, // 19.5%
      withholdingRate: 0.195,
      notes: '19.5% statutory telecom rate under Punjab Sales Tax schedule.',
    },
  ],
  sindh: [
    {
      id: 'general-consulting',
      name: 'Legal, Accounting, Audit & Management Consultancy',
      code: '9815.0000',
      description: 'Chartered accountants, legal advisers, technical experts, and corporate consultants.',
      standardRate: 0.13,
      withholdingRate: 0.13,
      notes: '13% standard rate under SRB Tariff.',
    },
    {
      id: 'it-software',
      name: 'Software Development, IT Enabled Services (ITES) & Call Centers',
      code: '9815.6000',
      description: 'Software programming, enterprise ERP, web apps, BPO call centers, and data centers.',
      standardRate: 0.13,
      concessionaryRate: 0.03, // 3%
      withholdingRate: 0.03,
      notes: 'Concessionary 3% without input tax credit for registered IT service providers. 0% for foreign exports.',
    },
    {
      id: 'restaurants-cafes',
      name: 'Restaurants, Cafes & Fast Food Chains',
      code: '9801.2000',
      description: 'Dine-in, takeaway, catering, and bakery cafes.',
      standardRate: 0.13,
      digitalPaymentRate: 0.08, // 8% for digital/card payments in Sindh
      withholdingRate: 0.08,
      notes: '8% concessionary rate when paying via digital card/POS machine integrated with SRB e-invoicing; 13% for cash.',
    },
    {
      id: 'construction-works',
      name: 'Contractual Execution of Work & Construction',
      code: '9814.2000',
      description: 'Infrastructure, civil works, electrical, HVAC, and building development.',
      standardRate: 0.13,
      concessionaryRate: 0.08,
      withholdingRate: 0.08,
      notes: '8% without input tax credit option or 13% with input tax credit.',
    },
    {
      id: 'advertising-media',
      name: 'Advertising & Media Buying Agencies',
      code: '9805.3000',
      description: 'TV channels, newspapers, digital media campaigns, outdoor hoardings.',
      standardRate: 0.13,
      withholdingRate: 0.13,
      notes: '13% standard rate.',
    },
    {
      id: 'freight-courier',
      name: 'Stevedores, Freight Forwarders, Port Cargo & Courier',
      code: '9804.1000',
      description: 'Karachi Port / Port Qasim terminal services, cargo handling, and express courier.',
      standardRate: 0.13,
      concessionaryRate: 0.08,
      withholdingRate: 0.08,
      notes: '13% standard rate (special terminal handling rates apply).',
    },
    {
      id: 'telecom',
      name: 'Telecommunication & Mobile Network Services',
      code: '9812.0000',
      description: 'Cellular airtime, 4G/5G data bundles, and fixed broadband.',
      standardRate: 0.195,
      withholdingRate: 0.195,
      notes: '19.5% telecom sales tax rate.',
    },
    {
      id: 'rent-a-car',
      name: 'Rent a Car & Vehicle Fleet Leasing',
      code: '9819.3000',
      description: 'Automobile rental, fleet management, and chauffeur transport.',
      standardRate: 0.13,
      concessionaryRate: 0.10,
      withholdingRate: 0.10,
      notes: '10% concessionary rate or 13% standard rate.',
    },
  ],
  kpk: [
    {
      id: 'general-consulting',
      name: 'Professional, Technical & Management Consultancy',
      code: '9815.0000',
      description: 'Consultants, engineering supervisors, legal and financial experts.',
      standardRate: 0.15,
      withholdingRate: 0.15,
      notes: '15% standard rate under KPRA Tariff Schedule.',
    },
    {
      id: 'it-software',
      name: 'IT Services, Software Development & ITES',
      code: '9815.6000',
      description: 'Software development, web portals, technical support, BPO.',
      standardRate: 0.15,
      concessionaryRate: 0.02, // 2% in KPRA
      withholdingRate: 0.02,
      notes: 'Ultra-low 2% concessionary rate without input tax credit for software and IT companies registered with KPRA.',
    },
    {
      id: 'restaurants-cafes',
      name: 'Hotels, Restaurants, Food Courts & Tourism Resorts',
      code: '9801.2000',
      description: 'Swat, Naran, Peshawar dining and tourist hotel accommodation.',
      standardRate: 0.15,
      concessionaryRate: 0.08,
      digitalPaymentRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% for digital card payments; 8% for standard hotels/restaurants.',
    },
    {
      id: 'construction-works',
      name: 'Construction & Civil Engineering Works',
      code: '9814.2000',
      description: 'Hydropower projects, roads, bridges, public & private buildings.',
      standardRate: 0.15,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% concessionary rate without input tax adjustment.',
    },
    {
      id: 'telecom',
      name: 'Telecommunication & Data Services',
      code: '9812.0000',
      description: 'Cellular network, wireless internet, fiber connections.',
      standardRate: 0.195,
      withholdingRate: 0.195,
      notes: '19.5% statutory telecom rate.',
    },
  ],
  balochistan: [
    {
      id: 'general-consulting',
      name: 'Consultancy & Technical Advisory Services',
      code: '9815.0000',
      description: 'Engineering, mineral extraction advisory, project management.',
      standardRate: 0.15,
      withholdingRate: 0.15,
      notes: '15% standard rate under BRA Act 2015.',
    },
    {
      id: 'it-software',
      name: 'IT & Data Processing Services',
      code: '9815.6000',
      description: 'Software applications, hardware maintenance, web services.',
      standardRate: 0.15,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% concessionary rate for registered tech vendors.',
    },
    {
      id: 'mining-contracts',
      name: 'Mining Support & Geological Exploration Services',
      code: '9814.9000',
      description: 'Drilling, mineral sampling, heavy equipment operations.',
      standardRate: 0.15,
      concessionaryRate: 0.10,
      withholdingRate: 0.10,
      notes: '10% to 15% rate on extractive industry contracting.',
    },
    {
      id: 'construction-works',
      name: 'Civil Infrastructure & Construction Contracts',
      code: '9814.2000',
      description: 'Gwadar port infrastructure, highways, dams, and municipal works.',
      standardRate: 0.15,
      concessionaryRate: 0.06,
      withholdingRate: 0.06,
      notes: '6% concessionary rate without input tax adjustment.',
    },
  ],
  ict: [
    {
      id: 'general-consulting',
      name: 'Professional, Technical & Management Consultancy',
      code: '9815.0000',
      description: 'Corporate consultants, legal firms, accounting and technical services in Islamabad.',
      standardRate: 0.15,
      withholdingRate: 0.15,
      notes: '15% standard rate under Islamabad Capital Territory Ordinance.',
    },
    {
      id: 'it-software',
      name: 'Software Development & IT Enabled Services',
      code: '9815.6000',
      description: 'Software development, AI solutions, web hosting, IT infrastructure in ICT.',
      standardRate: 0.15,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% concessionary rate without input tax credit for domestic sales.',
    },
    {
      id: 'restaurants-cafes',
      name: 'Restaurants, Cafes & Food Outlets in Islamabad',
      code: '9801.2000',
      description: 'Islamabad dining establishments and fast food chains.',
      standardRate: 0.15,
      digitalPaymentRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% for customers paying with debit/credit cards linked to FBR Point of Sale (POS); 15% on cash.',
    },
    {
      id: 'construction-works',
      name: 'Construction, Real Estate & Architectural Design',
      code: '9814.2000',
      description: 'Commercial & residential building projects in CDA/ICT sectors.',
      standardRate: 0.15,
      concessionaryRate: 0.05,
      withholdingRate: 0.05,
      notes: '5% concessionary rate for pure service contractors.',
    },
  ],
};

// 2. AGRICULTURAL INCOME TAX (AIT) SLABS ACROSS PROVINCES
export const AGRI_LAND_SLABS: Record<Province, AgriLandSlab[]> = {
  punjab: [
    { minAcres: 0, maxAcres: 12.5, ratePerAcreIrrigated: 0, ratePerAcreBarani: 0, description: 'Up to 12.5 Acres (Exempt from land tax)' },
    { minAcres: 12.5, maxAcres: 25, ratePerAcreIrrigated: 300, ratePerAcreBarani: 150, description: 'Exceeding 12.5 up to 25 Acres: Rs. 300/acre irrigated, Rs. 150 barani' },
    { minAcres: 25, maxAcres: 50, ratePerAcreIrrigated: 400, ratePerAcreBarani: 200, description: 'Exceeding 25 up to 50 Acres: Rs. 400/acre irrigated, Rs. 200 barani' },
    { minAcres: 50, maxAcres: null, ratePerAcreIrrigated: 500, ratePerAcreBarani: 250, description: 'Exceeding 50 Acres: Rs. 500/acre irrigated, Rs. 250 barani' },
  ],
  sindh: [
    { minAcres: 0, maxAcres: 12.5, ratePerAcreIrrigated: 0, ratePerAcreBarani: 0, description: 'Up to 12.5 Acres (Exempt)' },
    { minAcres: 12.5, maxAcres: 25, ratePerAcreIrrigated: 300, ratePerAcreBarani: 150, description: '12.5 to 25 Acres: Rs. 300/acre irrigated' },
    { minAcres: 25, maxAcres: 50, ratePerAcreIrrigated: 400, ratePerAcreBarani: 200, description: '25 to 50 Acres: Rs. 400/acre irrigated' },
    { minAcres: 50, maxAcres: null, ratePerAcreIrrigated: 600, ratePerAcreBarani: 300, description: 'Above 50 Acres: Rs. 600/acre irrigated' },
  ],
  kpk: [
    { minAcres: 0, maxAcres: 12.5, ratePerAcreIrrigated: 0, ratePerAcreBarani: 0, description: 'Up to 12.5 Acres: Exempt' },
    { minAcres: 12.5, maxAcres: 25, ratePerAcreIrrigated: 250, ratePerAcreBarani: 125, description: '12.5 to 25 Acres: Rs. 250/acre irrigated' },
    { minAcres: 25, maxAcres: 50, ratePerAcreIrrigated: 350, ratePerAcreBarani: 175, description: '25 to 50 Acres: Rs. 350/acre irrigated' },
    { minAcres: 50, maxAcres: null, ratePerAcreIrrigated: 450, ratePerAcreBarani: 225, description: 'Above 50 Acres: Rs. 450/acre irrigated' },
  ],
  balochistan: [
    { minAcres: 0, maxAcres: 12.5, ratePerAcreIrrigated: 0, ratePerAcreBarani: 0, description: 'Up to 12.5 Acres: Exempt' },
    { minAcres: 12.5, maxAcres: 25, ratePerAcreIrrigated: 200, ratePerAcreBarani: 100, description: '12.5 to 25 Acres: Rs. 200/acre irrigated' },
    { minAcres: 25, maxAcres: 50, ratePerAcreIrrigated: 300, ratePerAcreBarani: 150, description: '25 to 50 Acres: Rs. 300/acre irrigated' },
    { minAcres: 50, maxAcres: null, ratePerAcreIrrigated: 400, ratePerAcreBarani: 200, description: 'Above 50 Acres: Rs. 400/acre irrigated' },
  ],
  ict: [
    { minAcres: 0, maxAcres: 12.5, ratePerAcreIrrigated: 0, ratePerAcreBarani: 0, description: 'Up to 12.5 Acres: Exempt' },
    { minAcres: 12.5, maxAcres: 50, ratePerAcreIrrigated: 350, ratePerAcreBarani: 175, description: '12.5 to 50 Acres: Rs. 350/acre' },
    { minAcres: 50, maxAcres: null, ratePerAcreIrrigated: 500, ratePerAcreBarani: 250, description: 'Above 50 Acres: Rs. 500/acre' },
  ],
};

// Agricultural Income Slabs (Net Agricultural Produce / Farming Income)
export const AGRI_INCOME_SLABS: Record<Province, AgriIncomeSlab[]> = {
  punjab: [
    { minIncome: 0, maxIncome: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (0% Tax)' },
    { minIncome: 600000, maxIncome: 1200000, baseTax: 0, rate: 0.05, description: '5% of amount exceeding Rs. 600,000' },
    { minIncome: 1200000, maxIncome: 2400000, baseTax: 30000, rate: 0.10, description: 'Rs. 30,000 + 10% exceeding Rs. 1,200,000' },
    { minIncome: 2400000, maxIncome: 4800000, baseTax: 150000, rate: 0.15, description: 'Rs. 150,000 + 15% exceeding Rs. 2,400,000' },
    { minIncome: 4800000, maxIncome: null, baseTax: 510000, rate: 0.20, description: 'Rs. 510,000 + 20% exceeding Rs. 4,800,000' },
  ],
  sindh: [
    { minIncome: 0, maxIncome: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (0% Tax)' },
    { minIncome: 600000, maxIncome: 1200000, baseTax: 0, rate: 0.05, description: '5% exceeding Rs. 600,000' },
    { minIncome: 1200000, maxIncome: 2400000, baseTax: 30000, rate: 0.10, description: 'Rs. 30,000 + 10% exceeding Rs. 1,200,000' },
    { minIncome: 2400000, maxIncome: 4800000, baseTax: 150000, rate: 0.15, description: 'Rs. 150,000 + 15% exceeding Rs. 2,400,000' },
    { minIncome: 4800000, maxIncome: null, baseTax: 510000, rate: 0.20, description: 'Rs. 510,000 + 20% exceeding Rs. 4,800,000' },
  ],
  kpk: [
    { minIncome: 0, maxIncome: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (0%)' },
    { minIncome: 600000, maxIncome: 1200000, baseTax: 0, rate: 0.05, description: '5% exceeding Rs. 600,000' },
    { minIncome: 1200000, maxIncome: 2400000, baseTax: 30000, rate: 0.10, description: 'Rs. 30,000 + 10% exceeding Rs. 1.2M' },
    { minIncome: 2400000, maxIncome: null, baseTax: 150000, rate: 0.15, description: 'Rs. 150,000 + 15% exceeding Rs. 2.4M' },
  ],
  balochistan: [
    { minIncome: 0, maxIncome: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (0%)' },
    { minIncome: 600000, maxIncome: 1200000, baseTax: 0, rate: 0.05, description: '5% exceeding Rs. 600,000' },
    { minIncome: 1200000, maxIncome: null, baseTax: 30000, rate: 0.10, description: 'Rs. 30,000 + 10% exceeding Rs. 1.2M' },
  ],
  ict: [
    { minIncome: 0, maxIncome: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (0%)' },
    { minIncome: 600000, maxIncome: 1200000, baseTax: 0, rate: 0.05, description: '5% exceeding Rs. 600,000' },
    { minIncome: 1200000, maxIncome: null, baseTax: 30000, rate: 0.10, description: 'Rs. 30,000 + 10% exceeding Rs. 1.2M' },
  ],
};

// 3. PROVINCIAL PROPERTY TRANSFER, STAMP DUTY & CVT RATES
export const PROVINCIAL_PROPERTY_RATES: Record<Province, PropertyTransferRates> = {
  punjab: {
    province: 'punjab',
    stampDutyRate: 0.01, // 1% e-Stamping
    cvtRate: 0.01, // 1% Capital Value Tax
    tmaTownTaxRate: 0.01, // 1% Local Government / TMA Tax
    registrationFeeFixedOrRate: 'Rs. 1,000 or 1% (capped)',
    totalEstimatedTransferRate: 0.03, // 3% provincial total
    notes: 'In Punjab, transfer deeds are stamped through e-Stamping Portal. Provincial charges (Stamp Duty 1% + CVT 1% + TMA 1%) are paid alongside Federal WHT (236K/236C).',
  },
  sindh: {
    province: 'sindh',
    stampDutyRate: 0.02, // 2% Stamp Duty
    cvtRate: 0.0125, // 1.25% CVT in urban areas
    tmaTownTaxRate: 0.01, // 1% Town / Municipal Tax
    registrationFeeFixedOrRate: '1% of DC valuation',
    totalEstimatedTransferRate: 0.0425, // 4.25% provincial total
    notes: 'In Karachi and Sindh urban centers, Sub-Registrar fee and DC valuation guidelines apply.',
  },
  kpk: {
    province: 'kpk',
    stampDutyRate: 0.02, // 2% Stamp Duty
    cvtRate: 0.015, // 1.5% CVT
    tmaTownTaxRate: 0.01, // 1% District Council / Local Tax
    registrationFeeFixedOrRate: 'Rs. 500 - Rs. 1,500',
    totalEstimatedTransferRate: 0.045, // 4.5% provincial total
    notes: 'KP Local Government rules apply to land mutation, registry transfer, and district taxes.',
  },
  balochistan: {
    province: 'balochistan',
    stampDutyRate: 0.02, // 2% Stamp Duty
    cvtRate: 0.01, // 1% CVT
    tmaTownTaxRate: 0.01, // 1% Local Tax
    registrationFeeFixedOrRate: 'Fixed Scale',
    totalEstimatedTransferRate: 0.04, // 4.0% provincial total
    notes: 'Quetta and Gwadar development authority transfer charges apply separately.',
  },
  ict: {
    province: 'ict',
    stampDutyRate: 0.015, // 1.5% Stamp Duty in Islamabad
    cvtRate: 0.02, // 2% CVT
    tmaTownTaxRate: 0.005, // 0.5% CDA / ICT Local Admin
    registrationFeeFixedOrRate: '1% CDA / Sub-Registrar Fee',
    totalEstimatedTransferRate: 0.04, // 4.0% provincial/ICT total
    notes: 'Islamabad Capital Territory registry transfer requires CDA NDC (No Demand Certificate) and ICT e-stamp verification.',
  },
};

// 4. MOTOR VEHICLE ANNUAL & LIFETIME TOKEN TAX (PROVINCIAL EXCISE)
export const VEHICLE_TOKEN_SLABS: VehicleTokenRate[] = [
  {
    engineCCRange: 'Under 1000cc (e.g. Alto, WagonR, Cultus)',
    minCC: 660,
    maxCC: 1000,
    annualTokenPunjab: 0, // Lifetime paid at purchase
    annualTokenSindh: 1500,
    annualTokenKP: 1200,
    annualTokenICT: 1500,
    lifetimeTokenRate: 'Punjab: Lifetime token Rs. 10,000 - 15,000 paid one-time at registration.',
    notes: 'Vehicles under 1000cc generally enjoy one-time lifetime token tax in Punjab.',
  },
  {
    engineCCRange: '1001cc to 1300cc (e.g. Yaris 1.3, City 1.2/1.3, Swift)',
    minCC: 1001,
    maxCC: 1300,
    annualTokenPunjab: 2500,
    annualTokenSindh: 3000,
    annualTokenKP: 2200,
    annualTokenICT: 2500,
    lifetimeTokenRate: 'Optional lifetime in select provinces or annual token.',
    notes: 'Annual Excise token tax plus Rs. 500 professional tax and highway cess.',
  },
  {
    engineCCRange: '1301cc to 1600cc (e.g. Civic 1.5T, Corolla 1.6, Elantra 1.6)',
    minCC: 1301,
    maxCC: 1600,
    annualTokenPunjab: 5500,
    annualTokenSindh: 6000,
    annualTokenKP: 4500,
    annualTokenICT: 5000,
    notes: 'Includes Excise annual token tax, fitness/road cess, and provincial surcharge.',
  },
  {
    engineCCRange: '1601cc to 2000cc (e.g. Sportage, Tucson, Sonata, Oshan X7, Corolla 1.8)',
    minCC: 1601,
    maxCC: 2000,
    annualTokenPunjab: 9500,
    annualTokenSindh: 10500,
    annualTokenKP: 8000,
    annualTokenICT: 9000,
    notes: 'Mid-tier SUV and 2.0L sedan category.',
  },
  {
    engineCCRange: '2001cc to 2500cc (e.g. Fortuner 2.7, Camry, Sorento 2.4)',
    minCC: 2001,
    maxCC: 2500,
    annualTokenPunjab: 18000,
    annualTokenSindh: 20000,
    annualTokenKP: 15000,
    annualTokenICT: 16000,
    notes: 'Higher engine displacement luxury vehicle category.',
  },
  {
    engineCCRange: 'Above 2500cc / 3000cc+ (e.g. Land Cruiser, Prado, Hilux Revo 2.8)',
    minCC: 2501,
    maxCC: 5000,
    annualTokenPunjab: 30000,
    annualTokenSindh: 35000,
    annualTokenKP: 25000,
    annualTokenICT: 28000,
    notes: 'Maximum bracket for heavy SUVs and commercial luxury trucks.',
  },
];

// 5. PROVINCIAL PROFESSIONAL TAX (Salaried Individuals & Commercial Entities)
export const PUNJAB_PROFESSIONAL_TAX_SLABS: ProfessionalTaxSlab[] = [
  { category: 'salaried', minThreshold: 0, maxThreshold: 100000, taxAmount: 0, description: 'Gross Salary up to Rs. 100,000/month: Nil' },
  { category: 'salaried', minThreshold: 100000, maxThreshold: 200000, taxAmount: 200, description: 'Rs. 100k to Rs. 200k/month: Rs. 200/year' },
  { category: 'salaried', minThreshold: 200000, maxThreshold: 500000, taxAmount: 500, description: 'Rs. 200k to Rs. 500k/month: Rs. 500/year' },
  { category: 'salaried', minThreshold: 500000, maxThreshold: null, taxAmount: 1000, description: 'Above Rs. 500k/month: Rs. 1,000/year' },
  { category: 'business', minThreshold: 0, maxThreshold: null, taxAmount: 2500, description: 'Commercial Establishments & Traders: Rs. 2,500 - 5,000/year' },
  { category: 'company', minThreshold: 0, maxThreshold: null, taxAmount: 20000, description: 'Public / Private Limited Companies: Rs. 10,000 - 50,000/year based on paid-up capital' },
];
