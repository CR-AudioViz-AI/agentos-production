// ============================================================
// AGENTOS - LEADS API ROUTE
// Complete CRUD operations for lead management
// ============================================================
// TIMESTAMP: Friday, November 14, 2025 - 11:50 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// GET - Fetch leads with filtering and search
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status');
    const temperature = searchParams.get('temperature');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_agent:profiles!assigned_agent_id(
          id, first_name, last_name, email
        ),
        activities:lead_activities(
          id, activity_type, created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (agentId) {
      query = query.eq('assigned_agent_id', agentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (temperature) {
      query = query.eq('temperature', temperature);
    }

    // Search across multiple fields
    if (search) {
      query = query.or(`
        first_name.ilike.%${search}%,
        last_name.ilike.%${search}%,
        email.ilike.%${search}%,
        phone.ilike.%${search}%
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      leads: data,
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new lead
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Create lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        organization_id: body.organization_id,
        assigned_agent_id: body.assigned_agent_id,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        preferred_contact_method: body.preferred_contact_method || 'email',
        status: body.status || 'new',
        temperature: body.temperature || 'cold',
        lead_source: body.lead_source,
        budget_min: body.budget_min,
        budget_max: body.budget_max,
        preferred_cities: body.preferred_cities || [],
        preferred_bedrooms: body.preferred_bedrooms,
        preferred_bathrooms: body.preferred_bathrooms,
        property_type: body.property_type || ['single_family'],
        must_have_features: body.must_have_features || [],
        move_in_timeline: body.move_in_timeline,
        pre_qualified: body.pre_qualified || false,
        pre_qualified_amount: body.pre_qualified_amount,
        notes: body.notes,
        created_by: body.created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Create initial activity
    if (data) {
      await supabase.from('lead_activities').insert({
        lead_id: data.id,
        agent_id: body.created_by,
        activity_type: 'note',
        subject: 'Lead Created',
        description: `New lead created from ${body.lead_source || 'unknown source'}`,
      });
    }

    return NextResponse.json({
      success: true,
      lead: data,
      message: 'Lead created successfully'
    });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update lead
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Track status changes
    if (updates.status) {
      const { data: oldLead } = await supabase
        .from('leads')
        .select('status')
        .eq('id', id)
        .single();

      if (oldLead && oldLead.status !== updates.status) {
        // Create activity for status change
        await supabase.from('lead_activities').insert({
          lead_id: id,
          agent_id: updates.updated_by,
          activity_type: 'status_change',
          subject: 'Status Changed',
          description: `Status changed from ${oldLead.status} to ${updates.status}`,
        });
      }
    }

    // Update lead
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      lead: data,
      message: 'Lead updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete lead
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
