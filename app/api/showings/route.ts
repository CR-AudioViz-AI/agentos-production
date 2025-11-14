// ============================================================
// AGENTOS - SHOWINGS API ROUTE
// Property tour scheduling and management
// ============================================================
// TIMESTAMP: Friday, November 14, 2025 - 11:52 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// GET - Fetch showings with filtering
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const propertyId = searchParams.get('property_id');
    const leadId = searchParams.get('lead_id');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const dateRange = searchParams.get('date_range'); // week, month
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('showings')
      .select(`
        *,
        property:properties(
          id, address_line1, address_line2, address_city,
          address_state, address_zip, list_price, bedrooms, bathrooms
        ),
        lead:leads(
          id, first_name, last_name, email, phone
        ),
        agent:profiles!agent_id(
          id, first_name, last_name, email, phone
        )
      `)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(limit);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (date) {
      query = query.eq('scheduled_date', date);
    } else if (dateRange) {
      const today = new Date();
      let startDate = today.toISOString().split('T')[0];
      let endDate;

      if (dateRange === 'week') {
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (dateRange === 'month') {
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0];
      }

      if (endDate) {
        query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      showings: data,
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching showings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Schedule new showing
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.property_id || !body.agent_id || !body.scheduled_date || !body.scheduled_time) {
      return NextResponse.json(
        { success: false, error: 'Property, agent, date, and time are required' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const { data: conflicts } = await supabase
      .from('showings')
      .select('id')
      .eq('agent_id', body.agent_id)
      .eq('scheduled_date', body.scheduled_date)
      .eq('scheduled_time', body.scheduled_time)
      .in('status', ['scheduled', 'confirmed']);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Agent already has a showing scheduled at this time' },
        { status: 409 }
      );
    }

    // Create showing
    const { data, error } = await supabase
      .from('showings')
      .insert({
        property_id: body.property_id,
        lead_id: body.lead_id,
        agent_id: body.agent_id,
        scheduled_date: body.scheduled_date,
        scheduled_time: body.scheduled_time,
        duration_minutes: body.duration_minutes || 30,
        status: 'scheduled',
        followup_required: true
      })
      .select()
      .single();

    if (error) throw error;

    // Update lead status if linked
    if (body.lead_id) {
      await supabase
        .from('leads')
        .update({ 
          status: 'showing_scheduled',
          last_contact_date: new Date().toISOString()
        })
        .eq('id', body.lead_id);

      // Create lead activity
      await supabase.from('lead_activities').insert({
        lead_id: body.lead_id,
        agent_id: body.agent_id,
        activity_type: 'showing',
        subject: 'Showing Scheduled',
        description: `Property showing scheduled for ${body.scheduled_date} at ${body.scheduled_time}`
      });
    }

    return NextResponse.json({
      success: true,
      showing: data,
      message: 'Showing scheduled successfully'
    });
  } catch (error: any) {
    console.error('Error scheduling showing:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update showing
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Showing ID is required' },
        { status: 400 }
      );
    }

    // Get existing showing for comparison
    const { data: existing } = await supabase
      .from('showings')
      .select('*, lead_id')
      .eq('id', id)
      .single();

    // If rescheduling, check for conflicts
    if ((updates.scheduled_date || updates.scheduled_time) && existing) {
      const checkDate = updates.scheduled_date || existing.scheduled_date;
      const checkTime = updates.scheduled_time || existing.scheduled_time;
      const agentId = updates.agent_id || existing.agent_id;

      const { data: conflicts } = await supabase
        .from('showings')
        .select('id')
        .eq('agent_id', agentId)
        .eq('scheduled_date', checkDate)
        .eq('scheduled_time', checkTime)
        .neq('id', id)
        .in('status', ['scheduled', 'confirmed']);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Agent already has a showing scheduled at this time' },
          { status: 409 }
        );
      }

      // Mark as rescheduled
      updates.status = 'rescheduled';
    }

    // Update showing
    const { data, error } = await supabase
      .from('showings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create lead activity for status changes
    if (existing && existing.lead_id && updates.status) {
      let activityDescription = '';
      
      switch (updates.status) {
        case 'completed':
          activityDescription = 'Property showing completed';
          if (updates.interest_level) {
            activityDescription += ` - Interest level: ${updates.interest_level}`;
          }
          break;
        case 'no_show':
          activityDescription = 'Client did not show up for scheduled showing';
          break;
        case 'cancelled':
          activityDescription = 'Showing cancelled';
          break;
        case 'confirmed':
          activityDescription = 'Showing confirmed with client';
          break;
        case 'rescheduled':
          activityDescription = `Showing rescheduled to ${updates.scheduled_date} at ${updates.scheduled_time}`;
          break;
      }

      if (activityDescription) {
        await supabase.from('lead_activities').insert({
          lead_id: existing.lead_id,
          agent_id: existing.agent_id,
          activity_type: 'showing',
          subject: 'Showing Update',
          description: activityDescription
        });
      }
    }

    return NextResponse.json({
      success: true,
      showing: data,
      message: 'Showing updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating showing:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Cancel/Delete showing
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Showing ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('showings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Showing deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting showing:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Availability checking can be done via GET with ?availability=true&agent_id=X&date=Y
// Removed GET_AVAILABILITY to comply with Next.js route requirements
