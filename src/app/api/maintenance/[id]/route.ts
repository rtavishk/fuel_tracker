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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const prisma = prismaClient;

    if (prisma) {
      await prisma.maintenanceSchedule.deleteMany({
        where: { id, userId: user.id },
      });
    }

    return NextResponse.json({ message: 'Maintenance item removed' });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance item' }, { status: 500 });
  }
}