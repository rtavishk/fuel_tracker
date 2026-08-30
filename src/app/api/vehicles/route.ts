import { NextRequest, NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Simple auth check - extract user ID from token
function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback: accept token as direct user ID if alphanumeric UUID
  if (!token && /^[a-zA-Z0-9_-]{8,64}$/.test(token)) {
    return { id: token, email: 'driver@fueltracker.app' };
  }

  // For now, we'll use guest headers as fallback
  const guestId = req.headers.get('x-guest-user-id');
  const guestEmail = req.headers.get('x-guest-user-email');
  
  if (guestId) {
    return { id: guestId, email: guestEmail || 'driver@fueltracker.app' };
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = prismaClient;
    if (prisma) {
      const vehicles = await prisma.vehicle.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ vehicles });
    }

    return NextResponse.json({ vehicles: [] });
  } catch (error) {
    console.error('List vehicles error:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const prisma = prismaClient;

    if (prisma) {
      const newVehicle = await prisma.vehicle.create({
        data: {
          userId: user.id,
          name: body.name,
          make: body.make,
          model: body.model,
          year: body.year,
          licensePlate: body.licensePlate || null,
          tankCapacityLitres: body.tankCapacityLitres,
          fullRangeBenchmarkKm: body.fullRangeBenchmarkKm,
          currentCumulativeOdometer: body.currentCumulativeOdometer || 0,
          fuelType: body.fuelType || 'Petrol (95)',
          isPrimary: body.isPrimary ?? false,
        },
      });
      return NextResponse.json({ vehicle: newVehicle }, { status: 201 });
    }

    return NextResponse.json({
      vehicle: {
        id: uuidv4(),
        userId: user.id,
        ...body,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}