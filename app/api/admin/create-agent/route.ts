import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, phone, markets, organizationId } = await request.json();

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'TempPass2025!', // Agent changes on first login
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        markets,
        role: 'agent',
        organization_id: organizationId || '00000000-0000-0000-0000-000000000001',
        is_active: true
      });

    if (profileError) throw profileError;

    return NextResponse.json({ 
      success: true, 
      user: authData.user,
      message: 'Agent created successfully. Temporary password: TempPass2025!'
    });

  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
