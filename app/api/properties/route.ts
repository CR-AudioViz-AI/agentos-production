// ============================================================
// AGENTOS - PROPERTIES API ROUTE  
// Enhanced property management with advanced search
// ============================================================
// TIMESTAMP: Friday, November 14, 2025 - 11:53 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// GET - Fetch properties with advanced filtering
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Basic filters
    const organizationId = searchParams.get('organization_id');
    const category = searchParams.get('category');
    const propertyType = searchParams.get('property_type');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    
    // Price range
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    
    // Property specs
    const minBedrooms = searchParams.get('min_bedrooms');
    const minBathrooms = searchParams.get('min_bathrooms');
    const minSqft = searchParams.get('min_sqft');
    
    // Search
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('properties')
      .select(`
        *,
        organization:organizations(id, name),
        showings:showings(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (city) {
      query = query.ilike('address_city', `%${city}%`);
    }

    // Price range
    if (minPrice) {
      query = query.gte('list_price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('list_price', parseFloat(maxPrice));
    }

    // Property specs
    if (minBedrooms) {
      query = query.gte('bedrooms', parseInt(minBedrooms));
    }

    if (minBathrooms) {
      query = query.gte('bathrooms', parseFloat(minBathrooms));
    }

    if (minSqft) {
      query = query.gte('square_feet', parseInt(minSqft));
    }

    // Search across multiple fields
    if (search) {
      query = query.or(`
        address_line1.ilike.%${search}%,
        address_city.ilike.%${search}%,
        address_zip.ilike.%${search}%,
        description.ilike.%${search}%,
        mls_number.ilike.%${search}%
      `);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      properties: data,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new property
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.address_line1 || !body.address_city || !body.address_state || 
        !body.address_zip || !body.list_price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Address, price, and category are required' },
        { status: 400 }
      );
    }

    // Create property
    const { data, error } = await supabase
      .from('properties')
      .insert({
        organization_id: body.organization_id,
        category: body.category,
        property_type: body.property_type,
        status: body.status || 'active',
        mls_number: body.mls_number,
        
        // Address
        address_line1: body.address_line1,
        address_line2: body.address_line2,
        address_city: body.address_city,
        address_state: body.address_state,
        address_zip: body.address_zip,
        address_country: body.address_country || 'United States',
        
        // Property details
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        square_feet: body.square_feet,
        lot_size: body.lot_size,
        year_built: body.year_built,
        
        // Pricing
        list_price: body.list_price,
        price_per_sqft: body.square_feet ? body.list_price / body.square_feet : null,
        
        // Features
        description: body.description,
        features: body.features || [],
        
        // Images
        images: body.images || [],
        
        // Metadata
        created_by: body.created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity log
    await supabase.from('analytics_events').insert({
      event_type: 'property_created',
      event_data: {
        property_id: data.id,
        address: `${body.address_line1}, ${body.address_city}`,
        price: body.list_price
      }
    });

    return NextResponse.json({
      success: true,
      property: data,
      message: 'Property created successfully'
    });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update property
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Recalculate price per sqft if price or sqft changes
    if (updates.list_price || updates.square_feet) {
      const { data: existing } = await supabase
        .from('properties')
        .select('list_price, square_feet')
        .eq('id', id)
        .single();

      if (existing) {
        const price = updates.list_price || existing.list_price;
        const sqft = updates.square_feet || existing.square_feet;
        
        if (price && sqft) {
          updates.price_per_sqft = price / sqft;
        }
      }
    }

    // Update property
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      property: data,
      message: 'Property updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete property
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Check if property has active transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('property_id', id)
      .in('status', ['pending', 'under_contract', 'inspection', 'appraisal', 'financing', 'closing']);

    if (transactions && transactions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete property with active transactions' },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Statistics can be accessed via GET with ?stats=true query parameter
// Removed GET_STATS to comply with Next.js route requirements
