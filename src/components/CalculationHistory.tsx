import React, { useState, useEffect } from 'react';
import { Trash2, Download, Eye, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { exportToPDF, exportToJSON } from '../utils/pdfExport';
import { formatDateISO } from '../types/zakat';

interface Calculation {
  id: string;
  calculation_type: string;
  name: string;
  calculation_data: unknown;
  result: unknown;
  created_at: string;
  description?: string;
}

interface SavedTemplate {
  id: string;
  calculation_type: string;
  name: string;
  template_data: unknown;
  is_favorite: boolean;
  created_at: string;
}

const CalculationHistory: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCalc, setSelectedCalc] = useState<Calculation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorityFilter, setAuthorityFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const getValueFromObject = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      return value.map((item) => getValueFromObject(item)).filter(Boolean).join(' ');
    }
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>)
        .map((item) => getValueFromObject(item))
        .filter(Boolean)
        .join(' ');
    }
    return '';
  };

  const getAuthorityName = (calc: Calculation) => {
    const source = { ...(calc.calculation_data as Record<string, unknown>), ...(calc.result as Record<string, unknown>) };
    return (
      source.authority ||
      source.taxAuthority ||
      source.province ||
      source.authorityName ||
      'General'
    );
  };

  const getSupplierName = (calc: Calculation) => {
    const source = { ...(calc.calculation_data as Record<string, unknown>), ...(calc.result as Record<string, unknown>) };
    return (
      source.supplier ||
      source.vendorName ||
      source.supplierName ||
      source.companyName ||
      'General'
    );
  };

  const filteredCalculations = calculations.filter((calc) => {
    const createdAt = new Date(calc.created_at);
    const authority = getAuthorityName(calc);
    const supplier = getSupplierName(calc);
    const textSearch = [calc.name, calc.calculation_type, authority, supplier, getValueFromObject(calc.calculation_data), getValueFromObject(calc.result)]
      .join(' ')
      .toLowerCase();

    if (searchTerm && !textSearch.includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (authorityFilter !== 'all' && authority !== authorityFilter) {
      return false;
    }

    if (supplierFilter !== 'all' && supplier !== supplierFilter) {
      return false;
    }

    if (dateFrom && createdAt < new Date(dateFrom)) {
      return false;
    }

    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (createdAt > endOfDay) {
        return false;
      }
    }

    return true;
  });

  const authorityOptions = Array.from(
    new Set(calculations.map((calc) => getAuthorityName(calc)))
  ).sort();

  const supplierOptions = Array.from(
    new Set(calculations.map((calc) => getSupplierName(calc)))
  ).sort();

  // Fetch data when user changes or tab changes
  useEffect(() => {
    if (user) {
      if (activeTab === 'history') {
        fetchCalculations();
      } else {
        fetchTemplates();
      }
    }
  }, [user, activeTab]);

  const fetchCalculations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalculations((data || []) as Calculation[]);
    } catch (error) {
      console.error('Error fetching calculations:', error);
      alert('Failed to load calculation history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as SavedTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to load saved templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCalculation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calculation?')) return;

    try {
      const { error } = await supabase.from('calculations').delete().eq('id', id);
      if (error) throw error;
      setCalculations(calculations.filter((c) => c.id !== id));
      alert('Calculation deleted successfully');
    } catch (error) {
      console.error('Error deleting calculation:', error);
      alert('Failed to delete calculation');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase.from('saved_calculations').delete().eq('id', id);
      if (error) throw error;
      setTemplates(templates.filter((t) => t.id !== id));
      alert('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_calculations')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);

      if (error) throw error;
      setTemplates(
        templates.map((t) => (t.id === id ? { ...t, is_favorite: !isFavorite } : t))
      );
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  const handleExportPDF = async (calc: Calculation) => {
    try {
      const date = new Date(calc.created_at).toLocaleDateString();
      await exportToPDF('calc-details-modal', {
        filename: `${calc.calculation_type}-${calc.name}-${formatDateISO(new Date(calc.created_at))}.pdf`,
        title: `${calc.calculation_type.toUpperCase()} - ${calc.name}`,
        userEmail: user?.email,
        calculationType: calc.calculation_type,
      });
    } catch (error) {
      alert('Failed to export PDF');
    }
  };

  const handleExportJSON = (calc: Calculation) => {
    try {
      exportToJSON(calc, `${calc.calculation_type}-${calc.name}.json`);
    } catch (error) {
      alert('Failed to export JSON');
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-amber-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Sign In Required</h2>
          <p className="text-amber-700">Please sign in to view your calculation history and saved templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">Calculation History</h1>
        <p className="text-emerald-700">View and manage your saved calculations and templates</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-emerald-200">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'history'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-700'
          }`}
        >
          Calculation History ({calculations.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'templates'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-700'
          }`}
        >
          Saved Templates ({templates.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : activeTab === 'history' ? (
        // History Tab
        <div>
          <div className="mb-6 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, authority, supplier, type..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Authority</label>
                <select
                  value={authorityFilter}
                  onChange={(e) => setAuthorityFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All</option>
                  {authorityOptions.map((authority) => (
                    <option key={authority} value={authority}>{authority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Supplier</label>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All</option>
                  {supplierOptions.map((supplier) => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {(searchTerm || authorityFilter !== 'all' || supplierFilter !== 'all' || dateFrom || dateTo) && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setAuthorityFilter('all');
                    setSupplierFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {calculations.length === 0 ? (
            <div className="bg-white rounded-lg border border-emerald-200 p-8 text-center">
              <p className="text-gray-600">No calculations yet. Start by using one of our calculators!</p>
            </div>
          ) : filteredCalculations.length === 0 ? (
            <div className="bg-white rounded-lg border border-emerald-200 p-8 text-center">
              <p className="text-gray-600">No calculations match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="bg-white rounded-lg border border-emerald-200 p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-emerald-900">{calc.name || calc.calculation_type}</h3>
                      <p className="text-sm text-gray-600">
                        Type: <span className="font-semibold">{calc.calculation_type}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(calc.created_at).toLocaleString()}
                      </p>
                    </div>
                    {calc.description && (
                      <p className="text-sm text-gray-600 ml-4 max-w-xs">
                        {calc.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedCalc(calc);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleExportPDF(calc)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleExportJSON(calc)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      JSON
                    </button>
                    <button
                      onClick={() => handleDeleteCalculation(calc.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Templates Tab
        <div>
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg border border-emerald-200 p-8 text-center">
              <p className="text-gray-600">No saved templates yet. Save your calculation inputs for quick reuse!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates
                .sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
                .map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg border border-emerald-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 flex items-center gap-3">
                        <button
                          onClick={() => handleToggleFavorite(template.id, template.is_favorite)}
                          className="text-yellow-500 hover:text-yellow-600 transition"
                        >
                          <Star
                            className="w-5 h-5"
                            fill={template.is_favorite ? 'currentColor' : 'none'}
                          />
                        </button>
                        <div>
                          <h3 className="text-lg font-bold text-emerald-900">{template.name}</h3>
                          <p className="text-sm text-gray-600">
                            Type: <span className="font-semibold">{template.calculation_type}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(template.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedCalc({
                            id: template.id,
                            calculation_type: template.calculation_type,
                            name: template.name,
                            calculation_data: template.template_data,
                            result: null,
                            created_at: template.created_at,
                          });
                          setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for viewing details */}
      {showModal && selectedCalc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div id="calc-details-modal" className="p-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                {selectedCalc.name || selectedCalc.calculation_type}
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Input Data</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(selectedCalc.calculation_data, null, 2)}
                </pre>
              </div>

              {selectedCalc.result && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Result</h3>
                  <pre className="bg-green-50 p-4 rounded text-sm text-green-800 overflow-x-auto">
                    {JSON.stringify(selectedCalc.result, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleExportPDF(selectedCalc);
                    setShowModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    handleExportJSON(selectedCalc);
                    setShowModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationHistory;
