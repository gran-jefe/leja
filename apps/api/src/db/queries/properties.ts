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

export interface PropertyBrowseFilters {
  city?: string;
  state?: string;
  propertyType?: string; // single value or comma-separated list
  minRent?: number;
  maxRent?: number;
  bedrooms?: number; // exact match
  minBedrooms?: number; // "4+" style filter
  search?: string; // matches against address or city
  page?: number;
  limit?: number;
}

export const findAvailableProperties = async (filters: PropertyBrowseFilters) => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('is_available', true)
    .eq('is_deleted', false);

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.state) {
    query = query.eq('state', filters.state);
  }
  if (filters.propertyType) {
    const types = filters.propertyType.split(',').map((t) => t.trim()).filter(Boolean);
    query = types.length > 1 ? query.in('property_type', types) : query.eq('property_type', types[0]);
  }
  if (filters.minRent !== undefined) {
    query = query.gte('monthly_rent', filters.minRent);
  }
  if (filters.maxRent !== undefined) {
    query = query.lte('monthly_rent', filters.maxRent);
  }
  if (filters.bedrooms !== undefined) {
    query = query.eq('bedrooms', filters.bedrooms);
  } else if (filters.minBedrooms !== undefined) {
    query = query.gte('bedrooms', filters.minBedrooms);
  }
  if (filters.search) {
    query = query.or(`address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
  }

  const { data: properties, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Failed to list properties: ${error.message}`);

  const total = count || 0;
  return {
    properties: properties || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
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

  const { data: landlord } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', property.landlord_id)
    .single();

  return {
    ...property,
    landlord_name: landlord?.name || null,
    landlord_email: landlord?.email || null,
  };
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
