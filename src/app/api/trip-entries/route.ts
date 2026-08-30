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
  if (token && /^[a-zA-Z0-9_-]{8,64}$/.test(token)) {
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

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId') || undefined;
    const prisma = prismaClient;

    if (prisma) {
      const trips = await prisma.tripEntry.findMany({
        where: {
          userId: user.id,
          ...(vehicleId ? { vehicleId } : {}),
        },
        orderBy: { date: 'asc' },
      });

      const mappedTrips = trips.map((t) => ({
        id: t.id,
        date: t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date).split('T')[0],
        totalOdometer: t.totalCumulativeOdometer,
        totalCumulativeOdometer: t.totalCumulativeOdometer,
        category: t.category,
        notes: t.notes || undefined,
        createdAt: t.createdAt.toISOString(),
      }));

      return NextResponse.json({ trips: mappedTrips });
    }

    return NextResponse.json({ trips: [] });
  } catch (error) {
    console.error('List trips error:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
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
    const odo = body.totalCumulativeOdometer ?? body.totalOdometer ?? 0;

    if (prisma) {
      const trip = await prisma.tripEntry.upsert({
        where: {
          vehicleId_date: {
            vehicleId: body.vehicleId,
            date: new Date(body.date),
          },
        },
        create: {
          userId: user.id,
          vehicleId: body.vehicleId,
          date: new Date(body.date),
          totalCumulativeOdometer: odo,
          category: body.category || 'Commute',
          notes: body.notes || null,
        },
        update: {
          totalCumulativeOdometer: odo,
          category: body.category || 'Commute',
          notes: body.notes || null,
        },
      });

      // Update vehicle's current cumulative odometer
      await prisma.vehicle.updateMany({
        where: { id: body.vehicleId, userId: user.id },
        data: {
          currentCumulativeOdometer: odo,
        },
      });

      const mapped = {
        id: trip.id,
        date: trip.date instanceof Date ? trip.date.toISOString().split('T')[0] : String(trip.date).split('T')[0],
        totalOdometer: trip.totalCumulativeOdometer,
        totalCumulativeOdometer: trip.totalCumulativeOdometer,
        category: trip.category,
        notes: trip.notes || undefined,
        createdAt: trip.createdAt.toISOString(),
      };

      return NextResponse.json({ trip: mapped }, { status: 201 });
    }

    return NextResponse.json({
      trip: {
        id: uuidv4(),
        userId: user.id,
        ...body,
        totalOdometer: odo,
        totalCumulativeOdometer: odo,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create trip entry error:', error);
    return NextResponse.json({ error: 'Failed to save trip entry' }, { status: 500 });
  }
}