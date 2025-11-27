import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, like, and, or, desc, gte, lte } from 'drizzle-orm';

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

function generateBookingId(): string {
  return 'BK' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function validateDates(checkIn: string, checkOut: string): boolean {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return checkOutDate > checkInDate;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single booking fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    // List bookings with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    let query = db.select().from(bookings);
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(bookings.bookingId, `%${search}%`),
          like(bookings.guestName, `%${search}%`),
          like(bookings.guestEmail, `%${search}%`)
        )
      );
    }

    // Status filter
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(bookings.status, status));
    }

    // UserId filter
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(bookings.userId, userIdInt));
    }

    // RoomId filter
    if (roomId) {
      const roomIdInt = parseInt(roomId);
      if (isNaN(roomIdInt)) {
        return NextResponse.json(
          { error: 'Valid roomId is required', code: 'INVALID_ROOM_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(bookings.roomId, roomIdInt));
    }

    // Date range filter
    if (fromDate) {
      conditions.push(gte(bookings.checkIn, fromDate));
    }
    if (toDate) {
      conditions.push(lte(bookings.checkIn, toDate));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      numberOfGuests,
      totalAmount,
      roomId,
      userId,
      status = 'PENDING',
    } = body;

    // Validate required fields
    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: 'Guest name, email, and phone are required', code: 'MISSING_GUEST_INFO' },
        { status: 400 }
      );
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required', code: 'MISSING_DATES' },
        { status: 400 }
      );
    }

    if (!numberOfGuests || !totalAmount || !roomId) {
      return NextResponse.json(
        { error: 'Number of guests, total amount, and room ID are required', code: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Validate dates
    if (!validateDates(checkIn, checkOut)) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date', code: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }

    // Validate positive values
    if (numberOfGuests <= 0) {
      return NextResponse.json(
        { error: 'Number of guests must be positive', code: 'INVALID_NUMBER_OF_GUESTS' },
        { status: 400 }
      );
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be positive', code: 'INVALID_TOTAL_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      bookingId: generateBookingId(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      checkIn: checkIn.trim(),
      checkOut: checkOut.trim(),
      numberOfGuests: parseInt(numberOfGuests),
      totalAmount: parseFloat(totalAmount),
      roomId: parseInt(roomId),
      userId: userId ? parseInt(userId) : null,
      status: status.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newBooking = await db
      .insert(bookings)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      numberOfGuests,
      totalAmount,
      status,
      userId,
      roomId,
    } = body;

    // Validate dates if both are provided
    if (checkIn && checkOut) {
      if (!validateDates(checkIn, checkOut)) {
        return NextResponse.json(
          { error: 'Check-out date must be after check-in date', code: 'INVALID_DATE_RANGE' },
          { status: 400 }
        );
      }
    }

    // Validate positive values if provided
    if (numberOfGuests !== undefined && numberOfGuests <= 0) {
      return NextResponse.json(
        { error: 'Number of guests must be positive', code: 'INVALID_NUMBER_OF_GUESTS' },
        { status: 400 }
      );
    }

    if (totalAmount !== undefined && totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be positive', code: 'INVALID_TOTAL_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (guestName !== undefined) updateData.guestName = guestName.trim();
    if (guestEmail !== undefined) updateData.guestEmail = guestEmail.trim().toLowerCase();
    if (guestPhone !== undefined) updateData.guestPhone = guestPhone.trim();
    if (checkIn !== undefined) updateData.checkIn = checkIn.trim();
    if (checkOut !== undefined) updateData.checkOut = checkOut.trim();
    if (numberOfGuests !== undefined) updateData.numberOfGuests = parseInt(numberOfGuests);
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);
    if (status !== undefined) updateData.status = status.trim().toUpperCase();
    if (userId !== undefined) updateData.userId = userId ? parseInt(userId) : null;
    if (roomId !== undefined) updateData.roomId = parseInt(roomId);

    const updatedBooking = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedBooking[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedBooking = await db
      .delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Booking deleted successfully',
        booking: deletedBooking[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}