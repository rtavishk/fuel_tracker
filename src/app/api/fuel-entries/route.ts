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
      const entries = await prisma.fuelEntry.findMany({
        where: {
          userId: user.id,
          ...(vehicleId ? { vehicleId } : {}),
        },
        orderBy: { date: 'desc' },
      });

      const mappedEntries = entries.map((e) => ({
        id: e.id,
        date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date).split('T')[0],
        time: e.time || undefined,
        amountPaid: e.amountPaid,
        pricePerLitre: e.pricePerLitre,
        litresFueled: e.litresFueled,
        currentOdometer: e.currentRangeGauge,
        afterFuelingOdometer: e.afterFuelingRangeGauge,
        fuelStation: e.fuelStation || undefined,
        notes: e.notes || undefined,
        isFullTank: e.isFullTank,
        createdAt: e.createdAt.toISOString(),
      }));

      return NextResponse.json({ entries: mappedEntries });
    }

    return NextResponse.json({ entries: [] });
  } catch (error) {
    console.error('List fuel entries error:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel entries' }, { status: 500 });
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
    const currentRange = body.currentRangeGauge ?? body.currentOdometer ?? 0;
    const afterFuelingRange = body.afterFuelingRangeGauge ?? body.afterFuelingOdometer ?? null;

    if (prisma) {
      const entry = await prisma.fuelEntry.create({
        data: {
          userId: user.id,
          vehicleId: body.vehicleId,
          date: new Date(body.date),
          time: body.time || null,
          amountPaid: body.amountPaid,
          pricePerLitre: body.pricePerLitre,
          litresFueled: body.litresFueled,
          currentRangeGauge: currentRange,
          afterFuelingRangeGauge: afterFuelingRange,
          fuelStation: body.fuelStation || null,
          notes: body.notes || null,
          isFullTank: body.isFullTank ?? true,
        },
      });

      const mapped = {
        id: entry.id,
        date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : String(entry.date).split('T')[0],
        time: entry.time || undefined,
        amountPaid: entry.amountPaid,
        pricePerLitre: entry.pricePerLitre,
        litresFueled: entry.litresFueled,
        currentOdometer: entry.currentRangeGauge,
        afterFuelingOdometer: entry.afterFuelingRangeGauge,
        fuelStation: entry.fuelStation || undefined,
        notes: entry.notes || undefined,
        isFullTank: entry.isFullTank,
        createdAt: entry.createdAt.toISOString(),
      };

      return NextResponse.json({ entry: mapped }, { status: 201 });
    }

    return NextResponse.json({
      entry: {
        id: uuidv4(),
        userId: user.id,
        ...body,
        currentOdometer: currentRange,
        afterFuelingOdometer: afterFuelingRange,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create fuel entry error:', error);
    return NextResponse.json({ error: 'Failed to save fuel entry' }, { status: 500 });
  }
}