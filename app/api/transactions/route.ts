// ============================================================
// AGENTOS - TRANSACTIONS API ROUTE
// Complete deal pipeline with automatic commission calculation
// ============================================================
// TIMESTAMP: Friday, November 14, 2025 - 11:51 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// GET - Fetch transactions with filtering
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('transactions')
      .select(`
        *,
        property:properties(
          id, address_line1, address_city, list_price
        ),
        listing_agent:profiles!listing_agent_id(
          id, first_name, last_name
        ),
        buying_agent:profiles!buying_agent_id(
          id, first_name, last_name
        ),
        lead:leads(
          id, first_name, last_name, email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (agentId) {
      query = query.or(`listing_agent_id.eq.${agentId},buying_agent_id.eq.${agentId}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (year) {
      query = query.gte('contract_date', `${year}-01-01`)
                   .lte('contract_date', `${year}-12-31`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate summary statistics
    const stats = {
      total_volume: data?.reduce((sum, t) => sum + (t.purchase_price || 0), 0) || 0,
      total_commission: data?.reduce((sum, t) => sum + (t.agent_commission || 0), 0) || 0,
      active_deals: data?.filter(t => !['closed', 'cancelled'].includes(t.status)).length || 0,
      closed_deals: data?.filter(t => t.status === 'closed').length || 0
    };

    return NextResponse.json({
      success: true,
      transactions: data,
      count: data?.length || 0,
      stats
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new transaction
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.client_name || !body.purchase_price || !body.transaction_type) {
      return NextResponse.json(
        { success: false, error: 'Client name, purchase price, and transaction type are required' },
        { status: 400 }
      );
    }

    // Auto-calculate commissions
    let grossCommission = 0;
    let agentCommission = 0;

    if (body.purchase_price && body.commission_rate) {
      grossCommission = body.purchase_price * (body.commission_rate / 100);
      
      if (body.commission_split) {
        agentCommission = grossCommission * (body.commission_split / 100);
      }
    }

    // Create transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        organization_id: body.organization_id,
        property_id: body.property_id,
        lead_id: body.lead_id,
        listing_agent_id: body.listing_agent_id,
        buying_agent_id: body.buying_agent_id,
        client_name: body.client_name,
        client_email: body.client_email,
        client_phone: body.client_phone,
        transaction_type: body.transaction_type,
        status: body.status || 'pending',
        purchase_price: body.purchase_price,
        earnest_money: body.earnest_money,
        down_payment: body.down_payment,
        loan_amount: body.loan_amount,
        commission_rate: body.commission_rate,
        commission_split: body.commission_split,
        gross_commission: grossCommission,
        agent_commission: agentCommission,
        contract_date: body.contract_date,
        inspection_date: body.inspection_date,
        appraisal_date: body.appraisal_date,
        financing_contingency_date: body.financing_contingency_date,
        closing_date: body.closing_date,
        mls_number: body.mls_number,
        escrow_number: body.escrow_number,
        title_company: body.title_company,
        lender_name: body.lender_name,
        notes: body.notes,
        created_by: body.created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Update lead status if linked
    if (body.lead_id && body.status === 'under_contract') {
      await supabase
        .from('leads')
        .update({ status: 'under_contract' })
        .eq('id', body.lead_id);
    }

    return NextResponse.json({
      success: true,
      transaction: data,
      message: 'Transaction created successfully',
      commission_info: {
        gross_commission: grossCommission,
        agent_commission: agentCommission
      }
    });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update transaction
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Recalculate commissions if price or rates changed
    if (updates.purchase_price || updates.commission_rate || updates.commission_split) {
      const { data: existing } = await supabase
        .from('transactions')
        .select('purchase_price, commission_rate, commission_split')
        .eq('id', id)
        .single();

      if (existing) {
        const price = updates.purchase_price || existing.purchase_price;
        const rate = updates.commission_rate || existing.commission_rate;
        const split = updates.commission_split || existing.commission_split;

        if (price && rate) {
          updates.gross_commission = price * (rate / 100);
          if (split) {
            updates.agent_commission = updates.gross_commission * (split / 100);
          }
        }
      }
    }

    // Track status changes and update lead
    if (updates.status) {
      const { data: oldTransaction } = await supabase
        .from('transactions')
        .select('status, lead_id')
        .eq('id', id)
        .single();

      if (oldTransaction) {
        // Update linked lead status
        if (oldTransaction.lead_id) {
          let newLeadStatus = 'qualified';
          
          if (updates.status === 'closed') {
            newLeadStatus = 'closed';
          } else if (updates.status === 'under_contract') {
            newLeadStatus = 'under_contract';
          } else if (updates.status === 'cancelled') {
            newLeadStatus = 'lost';
          }

          await supabase
            .from('leads')
            .update({ status: newLeadStatus })
            .eq('id', oldTransaction.lead_id);
        }
      }
    }

    // Handle actual closing date
    if (updates.status === 'closed' && !updates.actual_closing_date) {
      updates.actual_closing_date = new Date().toISOString().split('T')[0];
    }

    // Update transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      transaction: data,
      message: 'Transaction updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete transaction
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Commission calculation is done automatically in POST and PATCH
// Removed POST_CALCULATE_COMMISSION to comply with Next.js route requirements
