import React from 'react';
import { Calculator, Landmark, RefreshCw, TrendingDown, ShoppingCart, TrendingUp, Home, Clock, ArrowRight } from 'lucide-react';
import type { AppTab } from '../utils/subdomainRoutes';

interface RelatedCalculatorsProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const RelatedCalculators: React.FC<RelatedCalculatorsProps> = ({ currentTab, onTabChange }) => {
  const calculators: Array<{
    id: AppTab;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = [
    {
      id: 'calculator',
      title: 'Salary Tax Calculator',
      description: 'Calculate monthly/annual income tax for salaried individuals with detailed breakdown',
      icon: <Calculator className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'provincial',
      title: 'Provincial Taxes',
      description: 'Calculate PRA, SRB, KPRA, and BRA taxes for different provinces',
      icon: <Landmark className="w-6 h-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      id: 'reverse',
      title: 'Reverse Calculator',
      description: 'Convert net take-home salary to gross salary and tax amount',
      icon: <RefreshCw className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'invoice-tax',
      title: 'Invoice Tax (GST / WHT)',
      description: 'Choose GST on an invoice or withholding tax on a payment',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'specialized',
      title: 'Property, Car & IT Export',
      description: 'Calculate taxes for property transfers, vehicle tokens, and IT exports',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'zakat',
      title: 'Zakat Calculator',
      description: 'Calculate your annual zakat obligation based on wealth',
      icon: <Home className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'history',
      title: 'Calculation History',
      description: 'View and manage your saved calculations and templates',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
  ];

  const filteredCalculators = calculators.filter((calc) => calc.id !== currentTab);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Explore All Calculators
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Unlock comprehensive tax calculation tools tailored to every aspect of Pakistani taxation
          </p>
        </div>

        {/* Calculator Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCalculators.map((calc) => (
            <button
              key={calc.id}
              onClick={() => onTabChange(calc.id)}
              className={`group ${calc.bgColor} border-2 ${calc.borderColor} rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-opacity-100 text-left`}
            >
              {/* Icon */}
              <div className={`${calc.color} mb-3 group-hover:scale-110 transition-transform`}>
                {calc.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {calc.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-600 mb-4 line-clamp-2 group-hover:text-slate-700">
                {calc.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open
                </span>
                <ArrowRight className={`w-4 h-4 ${calc.color} group-hover:translate-x-1 transition-transform`} />
              </div>
            </button>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">
            Master Your Tax Calculation
          </h3>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6">
            Get expert guidance on income tax, withholding tax, sales tax, zakat, and more. All FBR-compliant calculators in one platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
              ✓ FBR Compliant
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
              ✓ 100% Private
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
              ✓ Real-Time Updates
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
