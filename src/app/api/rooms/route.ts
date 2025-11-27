import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms } from '@/db/schema';
import { eq, like, and, or, gte, lte, desc } from 'drizzle-orm';

const VALID_ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
const VALID_ROOM_STATUSES = ['AVAILABLE', 'BOOKED', 'MAINTENANCE'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single room fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const room = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, parseInt(id)))
        .limit(1);

      if (room.length === 0) {
        return NextResponse.json(
          { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(room[0], { status: 200 });
    }

    // List rooms with pagination, filters, and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(rooms.roomNumber, `%${search}%`),
          like(rooms.description, `%${search}%`)
        )
      );
    }

    // Type filter
    if (type && VALID_ROOM_TYPES.includes(type.toUpperCase())) {
      conditions.push(eq(rooms.type, type.toUpperCase()));
    }

    // Status filter
    if (status && VALID_ROOM_STATUSES.includes(status.toUpperCase())) {
      conditions.push(eq(rooms.status, status.toUpperCase()));
    }

    // Price range filters
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      conditions.push(gte(rooms.price, parseFloat(minPrice)));
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      conditions.push(lte(rooms.price, parseFloat(maxPrice)));
    }

    let query = db.select().from(rooms);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(rooms.createdAt))
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
    const { roomNumber, type, price, status, description, amenities, image, occupancy } = body;

    // Validate required fields
    if (!roomNumber) {
      return NextResponse.json(
        { error: 'Room number is required', code: 'MISSING_ROOM_NUMBER' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Room type is required', code: 'MISSING_ROOM_TYPE' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Price is required', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (occupancy === undefined || occupancy === null) {
      return NextResponse.json(
        { error: 'Occupancy is required', code: 'MISSING_OCCUPANCY' },
        { status: 400 }
      );
    }

    // Validate room type
    if (!VALID_ROOM_TYPES.includes(type.toUpperCase())) {
      return NextResponse.json(
        {
          error: `Invalid room type. Must be one of: ${VALID_ROOM_TYPES.join(', ')}`,
          code: 'INVALID_ROOM_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_ROOM_STATUSES.includes(status.toUpperCase())) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_ROOM_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Validate occupancy
    const parsedOccupancy = parseInt(occupancy);
    if (isNaN(parsedOccupancy) || parsedOccupancy <= 0) {
      return NextResponse.json(
        { error: 'Occupancy must be a positive integer', code: 'INVALID_OCCUPANCY' },
        { status: 400 }
      );
    }

    // Check for duplicate room number
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomNumber, roomNumber.trim()))
      .limit(1);

    if (existingRoom.length > 0) {
      return NextResponse.json(
        { error: 'Room number already exists', code: 'DUPLICATE_ROOM_NUMBER' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      roomNumber: roomNumber.trim(),
      type: type.toUpperCase(),
      price: parsedPrice,
      status: status ? status.toUpperCase() : 'AVAILABLE',
      description: description?.trim() || null,
      amenities: amenities || null,
      image: image?.trim() || null,
      occupancy: parsedOccupancy,
      createdAt: now,
      updatedAt: now,
    };

    const newRoom = await db.insert(rooms).values(insertData).returning();

    return NextResponse.json(newRoom[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { roomNumber, type, price, status, description, amenities, image, occupancy } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and update room number
    if (roomNumber !== undefined) {
      if (!roomNumber || roomNumber.trim() === '') {
        return NextResponse.json(
          { error: 'Room number cannot be empty', code: 'INVALID_ROOM_NUMBER' },
          { status: 400 }
        );
      }

      // Check for duplicate room number (excluding current room)
      const duplicateRoom = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomNumber, roomNumber.trim()))
        .limit(1);

      if (duplicateRoom.length > 0 && duplicateRoom[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Room number already exists', code: 'DUPLICATE_ROOM_NUMBER' },
          { status: 400 }
        );
      }

      updates.roomNumber = roomNumber.trim();
    }

    // Validate and update type
    if (type !== undefined) {
      if (!VALID_ROOM_TYPES.includes(type.toUpperCase())) {
        return NextResponse.json(
          {
            error: `Invalid room type. Must be one of: ${VALID_ROOM_TYPES.join(', ')}`,
            code: 'INVALID_ROOM_TYPE',
          },
          { status: 400 }
        );
      }
      updates.type = type.toUpperCase();
    }

    // Validate and update price
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
      updates.price = parsedPrice;
    }

    // Validate and update status
    if (status !== undefined) {
      if (!VALID_ROOM_STATUSES.includes(status.toUpperCase())) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${VALID_ROOM_STATUSES.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status.toUpperCase();
    }

    // Validate and update occupancy
    if (occupancy !== undefined) {
      const parsedOccupancy = parseInt(occupancy);
      if (isNaN(parsedOccupancy) || parsedOccupancy <= 0) {
        return NextResponse.json(
          { error: 'Occupancy must be a positive integer', code: 'INVALID_OCCUPANCY' },
          { status: 400 }
        );
      }
      updates.occupancy = parsedOccupancy;
    }

    // Update optional fields
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (amenities !== undefined) {
      updates.amenities = amenities;
    }

    if (image !== undefined) {
      updates.image = image?.trim() || null;
    }

    const updatedRoom = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedRoom[0], { status: 200 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedRoom = await db
      .delete(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Room deleted successfully',
        room: deletedRoom[0],
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