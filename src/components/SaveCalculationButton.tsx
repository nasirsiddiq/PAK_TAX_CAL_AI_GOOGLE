import React, { useState } from 'react';
import { BookmarkPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveCalculation } from '../services/supabaseClient';

interface SaveCalculationButtonProps {
  calculationType: string;
  name: string;
  calculationData: Record<string, any>;
  result: Record<string, any> | null;
  description?: string;
  authority?: string;
  supplier?: string;
  calculationDate?: string;
  className?: string;
}

export const SaveCalculationButton: React.FC<SaveCalculationButtonProps> = ({
  calculationType,
  name,
  calculationData,
  result,
  description,
  authority,
  supplier,
  calculationDate,
  className = '',
}) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in or create an account to save calculations for later.');
      return;
    }

    if (!calculationData || Object.keys(calculationData).length === 0) {
      alert('There is no calculation input to save yet.');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await saveCalculation(
        user.id,
        calculationType,
        calculationData,
        result || {},
        name,
        {
          description,
          authority: authority || calculationData.authority || calculationData.taxAuthority || 'General',
          supplier: supplier || calculationData.supplier || calculationData.vendorName || calculationData.companyName || 'General',
          calculationDate: calculationDate || new Date().toISOString().slice(0, 10),
        }
      );

      if (error) {
        throw error;
      }

      alert('Calculation saved successfully. You can view it later in your history.');
    } catch (error) {
      console.error('Failed to save calculation:', error);
      alert('Unable to save this calculation right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving}
      className={`inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
      {isSaving ? 'Saving...' : 'Save for later'}
    </button>
  );
};
