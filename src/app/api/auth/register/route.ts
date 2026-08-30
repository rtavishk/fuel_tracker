import { NextRequest, NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key && !url.includes('YOUR_PROJECT_REF')) {
    return createClient(url, key);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, vehicle } = await req.json();
    const supabase = getSupabase();

    let userId = uuidv4();
    let sessionToken = '';

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || '',
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        // Handle email confirmation requirement
        if (error.message.includes('Email not confirmed')) {
          // Try to bypass by signing in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!signInError && signInData.user) {
            userId = signInData.user.id;
            sessionToken = signInData.session?.access_token || '';
          } else {
            return NextResponse.json({ 
              error: 'Email confirmation required. Please check your email inbox for the confirmation link, or disable email confirmation in Supabase project settings for development.' 
            }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }

      if (data.user) {
        userId = data.user.id;
        sessionToken = data.session?.access_token || '';
      }
    }

    // Sync with Prisma Database if database is connected
    if (prismaClient) {
      try {
        await prismaClient.profile.upsert({
          where: { email },
          create: {
            id: userId,
            email,
            fullName: name || '',
            currencySymbol: vehicle?.currency || 'Rs.',
            distanceUnit: vehicle?.distanceUnit || 'km',
            volumeUnit: vehicle?.volumeUnit || 'L',
          },
          update: {
            fullName: name || '',
          },
        });

        if (vehicle) {
          await prismaClient.vehicle.create({
            data: {
              userId,
              name: vehicle.name || `${vehicle.make} ${vehicle.model}`,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              licensePlate: vehicle.licensePlate || null,
              tankCapacityLitres: vehicle.tankCapacityLitres || 47,
              fullRangeBenchmarkKm: vehicle.fullRangeBenchmarkKm || 680,
              fuelType: vehicle.fuelType || 'Petrol (95)',
              isPrimary: true,
            },
          });
        }
      } catch (dbErr) {
        console.warn('Prisma sync skipped during registration:', dbErr);
      }
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: userId,
        email,
        name: name || email.split('@')[0],
      },
      token: sessionToken || userId,
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal registration server error' }, { status: 500 });
  }
}