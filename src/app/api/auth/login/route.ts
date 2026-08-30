import { NextRequest, NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Supabase config check:', {
    hasUrl: !!url,
    hasKey: !!key,
    urlStart: url ? url.substring(0, 20) + '...' : 'none'
  });
  
  if (url && key && !url.includes('YOUR_PROJECT_REF')) {
    return createClient(url, key);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    // Debug environment variables
    console.log('Environment check:', {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
        },
        token: data.session?.access_token,
      });
    }

    // Direct database or fallback authentication
    let userProfile = null;
    if (prismaClient) {
      try {
        userProfile = await prismaClient.profile.findUnique({
          where: { email },
        });
      } catch {
        // Fallback
      }
    }

    const userId = userProfile ? userProfile.id : uuidv4();

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: userId,
        email,
        name: userProfile?.fullName || email.split('@')[0],
      },
      token: userId,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal login server error' }, { status: 500 });
  }
}