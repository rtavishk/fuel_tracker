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
      const items = await prisma.maintenanceSchedule.findMany({
        where: {
          userId: user.id,
          ...(vehicleId ? { vehicleId } : {}),
        },
        orderBy: { priority: 'desc' },
      });
      return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error('List maintenance error:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance items' }, { status: 500 });
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
      const item = await prisma.maintenanceSchedule.create({
        data: {
          userId: user.id,
          vehicleId: body.vehicleId,
          title: body.title,
          category: body.category,
          intervalKm: body.intervalKm,
          intervalMonths: body.intervalMonths || null,
          lastServiceOdometer: body.lastServiceOdometer || 0,
          lastServiceDate: new Date(body.lastServiceDate),
          estimatedCost: body.estimatedCost || null,
          priority: body.priority || 'Medium',
          notes: body.notes || null,
        },
      });
      return NextResponse.json({ item }, { status: 201 });
    }

    return NextResponse.json({
      item: {
        id: uuidv4(),
        userId: user.id,
        ...body,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create maintenance error:', error);
    return NextResponse.json({ error: 'Failed to save maintenance item' }, { status: 500 });
  }
}