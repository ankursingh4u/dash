import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    // Get user details from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      // If user exists in auth but not in users table, create them
      if (authData.user) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            password_hash: 'supabase_auth',
            name: authData.user.email?.split('@')[0] || 'User',
            role: 'user',
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json(
            { error: 'Failed to create user record' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.name,
            role: newUser.role,
          },
          token: authData.session?.access_token,
        });
      }

      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.name,
        role: userData.role,
      },
      token: authData.session?.access_token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
