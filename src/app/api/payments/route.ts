import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, bookings } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

const VALID_METHODS = ['CASH', 'CARD', 'UPI', 'ONLINE'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single payment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, parseInt(id)))
        .limit(1);

      if (payment.length === 0) {
        return NextResponse.json(
          { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(payment[0], { status: 200 });
    }

    // List payments with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const method = searchParams.get('method');
    const bookingId = searchParams.get('bookingId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    let query = db.select().from(payments);
    const conditions = [];

    // Filter by payment method
    if (method) {
      if (!VALID_METHODS.includes(method as any)) {
        return NextResponse.json(
          {
            error: `Invalid payment method. Must be one of: ${VALID_METHODS.join(', ')}`,
            code: 'INVALID_METHOD',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(payments.method, method));
    }

    // Filter by booking ID
    if (bookingId) {
      if (isNaN(parseInt(bookingId))) {
        return NextResponse.json(
          { error: 'Valid booking ID is required', code: 'INVALID_BOOKING_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(payments.bookingId, parseInt(bookingId)));
    }

    // Filter by date range
    if (fromDate) {
      conditions.push(gte(payments.paymentDate, fromDate));
    }
    if (toDate) {
      conditions.push(lte(payments.paymentDate, toDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(payments.paymentDate))
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
    const { amount, method, bookingId, transactionId } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method is required', code: 'MISSING_METHOD' },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required', code: 'MISSING_BOOKING_ID' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!VALID_METHODS.includes(method)) {
      return NextResponse.json(
        {
          error: `Invalid payment method. Must be one of: ${VALID_METHODS.join(', ')}`,
          code: 'INVALID_METHOD',
        },
        { status: 400 }
      );
    }

    // Validate booking ID is a number
    if (typeof bookingId !== 'number' || isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Valid booking ID is required', code: 'INVALID_BOOKING_ID' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const newPayment = await db
      .insert(payments)
      .values({
        amount,
        method,
        bookingId,
        transactionId: transactionId || null,
        paymentDate: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });
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

    const body = await request.json();
    const { amount, method, transactionId, bookingId } = body;

    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, parseInt(id)))
      .limit(1);

    if (existingPayment.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and update amount if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      updates.amount = amount;
    }

    // Validate and update method if provided
    if (method !== undefined) {
      if (!VALID_METHODS.includes(method)) {
        return NextResponse.json(
          {
            error: `Invalid payment method. Must be one of: ${VALID_METHODS.join(', ')}`,
            code: 'INVALID_METHOD',
          },
          { status: 400 }
        );
      }
      updates.method = method;
    }

    // Update transaction ID if provided
    if (transactionId !== undefined) {
      updates.transactionId = transactionId || null;
    }

    // Validate and update booking ID if provided
    if (bookingId !== undefined) {
      if (typeof bookingId !== 'number' || isNaN(bookingId)) {
        return NextResponse.json(
          { error: 'Valid booking ID is required', code: 'INVALID_BOOKING_ID' },
          { status: 400 }
        );
      }

      // Verify booking exists
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
          { status: 404 }
        );
      }

      updates.bookingId = bookingId;
    }

    const updated = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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

    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, parseInt(id)))
      .limit(1);

    if (existingPayment.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(payments)
      .where(eq(payments.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Payment deleted successfully',
        payment: deleted[0],
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