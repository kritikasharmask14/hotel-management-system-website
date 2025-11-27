import { NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms, bookings, users, payments } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'RECEPTIONIST')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all rooms
    const allRooms = await db.select().from(rooms);

    // Count rooms by status
    const totalRooms = allRooms.length;
    const availableRooms = allRooms.filter(r => r.status === 'AVAILABLE').length;
    const bookedRooms = allRooms.filter(r => r.status === 'BOOKED').length;
    const maintenanceRooms = allRooms.filter(r => r.status === 'MAINTENANCE').length;

    // Get all bookings
    const allBookings = await db.select().from(bookings);
    
    // Count bookings by status
    const totalBookings = allBookings.length;
    const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED').length;
    const checkedInBookings = allBookings.filter(b => b.status === 'CHECKED_IN').length;
    const pendingBookings = allBookings.filter(b => b.status === 'PENDING').length;

    // Count total guests (unique users who made bookings)
    const totalGuests = await db.select({ count: sql<number>`count(distinct ${users.id})` })
      .from(users)
      .where(eq(users.role, 'CUSTOMER'));

    // Calculate total revenue
    const allPayments = await db.select().from(payments);
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get recent bookings
    const recentBookings = await db
      .select()
      .from(bookings)
      .limit(10)
      .orderBy(sql`${bookings.createdAt} DESC`);

    return NextResponse.json({
      rooms: {
        total: totalRooms,
        available: availableRooms,
        booked: bookedRooms,
        maintenance: maintenanceRooms,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        checkedIn: checkedInBookings,
        pending: pendingBookings,
      },
      totalGuests: totalGuests[0]?.count || 0,
      totalRevenue,
      recentBookings,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
