import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PropertyValuationCity = {
  city: string;
  data: {
    areas?: Array<{ name?: string; area?: string; category?: string; [key: string]: unknown }>;
    categories?: Record<string, { resOpen?: number; resBuilt?: number; comOpen?: number; comBuilt?: number; indOpen?: number; indBuilt?: number }>;
    rows?: Array<{ area?: string; tehsil?: string; resOpen?: number; resBuilt?: number; comOpen?: number; comBuilt?: number; indOpen?: number; indBuilt?: number }>;
    sections?: Array<{ rows?: Array<{ area?: string; tehsil?: string; resOpen?: number; resBuilt?: number; comOpen?: number; comBuilt?: number; indOpen?: number; indBuilt?: number }> }>;
  };
};

export const getPropertyValuationRates = async (city: string) => {
  const { data, error } = await supabase
    .from('property_valuation_rates')
    .select('city, data')
    .eq('city', city)
    .maybeSingle();

  return { data: data as PropertyValuationCity | null, error };
};

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Calculation history functions
export const saveCalculation = async (
  userId: string,
  calculationType: string,
  calculationData: Record<string, any>,
  result: Record<string, any>,
  name?: string,
  metadata?: Record<string, any>
) => {
  const { data, error } = await supabase
    .from('calculations')
    .insert({
      user_id: userId,
      calculation_type: calculationType,
      calculation_data: calculationData,
      result,
      name,
      description: metadata?.description ?? null,
      authority: metadata?.authority ?? calculationData.authority ?? calculationData.taxAuthority ?? 'General',
      supplier: metadata?.supplier ?? calculationData.supplier ?? calculationData.vendorName ?? calculationData.companyName ?? 'General',
      calculation_date: metadata?.calculationDate ?? new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    })
    .select();
  return { data, error };
};

export const getCalculationHistory = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const deleteCalculation = async (calculationId: string) => {
  const { error } = await supabase
    .from('calculations')
    .delete()
    .eq('id', calculationId);
  return { error };
};

// Saved calculations (favorites/templates)
export const saveCalculationTemplate = async (
  userId: string,
  calculationType: string,
  templateData: Record<string, any>,
  name: string,
  description?: string
) => {
  const { data, error } = await supabase
    .from('saved_calculations')
    .insert({
      user_id: userId,
      calculation_type: calculationType,
      template_data: templateData,
      name,
      description,
    })
    .select();
  return { data, error };
};

export const getSavedCalculations = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const deleteSavedCalculation = async (id: string) => {
  const { error } = await supabase
    .from('saved_calculations')
    .delete()
    .eq('id', id);
  return { error };
};

// User preferences
export const updateUserPreferences = async (
  userId: string,
  preferences: Record<string, any>
) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      preferences,
      updated_at: new Date().toISOString(),
    })
    .select();
  return { data, error };
};

export const getUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', userId)
    .single();
  return { data, error };
};
