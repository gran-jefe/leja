import { supabase } from '../index';

interface CreatePropertyInput {
  landlordId: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  annualRent: number;
}

export const createProperty = async (data: CreatePropertyInput) => {
  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      landlord_id: data.landlordId,
      address: data.address,
      city: data.city,
      state: data.state,
      property_type: data.propertyType,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      monthly_rent: data.monthlyRent,
      annual_rent: data.annualRent,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create property: ${error.message}`);
  return property;
};

export const findPropertiesByLandlord = async (landlordId: string) => {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('landlord_id', landlordId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list properties: ${error.message}`);
  return properties;
};

export const findPropertyById = async (id: string) => {
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find property: ${error.message}`);
  }
  return property;
};

interface UpdatePropertyInput {
  address?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  monthlyRent?: number;
  annualRent?: number;
  isAvailable?: boolean;
}

export const updateProperty = async (id: string, data: UpdatePropertyInput) => {
  const updateData: Record<string, unknown> = {};
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
  if (data.monthlyRent !== undefined) updateData.monthly_rent = data.monthlyRent;
  if (data.annualRent !== undefined) updateData.annual_rent = data.annualRent;
  if (data.isAvailable !== undefined) updateData.is_available = data.isAvailable;

  const { data: property, error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update property: ${error.message}`);
  return property;
};

export const softDeleteProperty = async (id: string) => {
  const { error } = await supabase
    .from('properties')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) throw new Error(`Failed to delete property: ${error.message}`);
};
