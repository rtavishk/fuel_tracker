import { NextRequest, NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../lib/prisma';

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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const prisma = prismaClient;

    if (prisma) {
      const updated = await prisma.vehicle.updateMany({
        where: { id, userId: user.id },
        data: {
          name: body.name,
          make: body.make,
          model: body.model,
          year: body.year,
          licensePlate: body.licensePlate || null,
          tankCapacityLitres: body.tankCapacityLitres,
          fullRangeBenchmarkKm: body.fullRangeBenchmarkKm,
          currentCumulativeOdometer: body.currentCumulativeOdometer,
          fuelType: body.fuelType,
          isPrimary: body.isPrimary,
        },
      });

      if (updated.count === 0) {
        return NextResponse.json({ error: 'Vehicle not found or unauthorized' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Vehicle updated successfully' });
    }

    return NextResponse.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const prisma = prismaClient;

    if (prisma) {
      await prisma.vehicle.deleteMany({
        where: { id, userId: user.id },
      });
    }

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}