import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hotelSettings } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const setting = await db.select()
        .from(hotelSettings)
        .where(eq(hotelSettings.id, parseInt(id)))
        .limit(1);

      if (setting.length === 0) {
        return NextResponse.json({ 
          error: 'Setting not found',
          code: "SETTING_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(setting[0], { status: 200 });
    }

    // List all settings
    const settings = await db.select()
      .from(hotelSettings)
      .orderBy(desc(hotelSettings.createdAt));

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelName, address, phone, email, logo } = body;

    // Validate required fields
    if (!hotelName) {
      return NextResponse.json({ 
        error: "Hotel name is required",
        code: "MISSING_HOTEL_NAME" 
      }, { status: 400 });
    }

    if (!address) {
      return NextResponse.json({ 
        error: "Address is required",
        code: "MISSING_ADDRESS" 
      }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ 
        error: "Phone is required",
        code: "MISSING_PHONE" 
      }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      hotelName: hotelName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      logo: logo ? logo.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Insert new setting
    const newSetting = await db.insert(hotelSettings)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newSetting[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(hotelSettings)
      .where(eq(hotelSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Setting not found',
        code: "SETTING_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { hotelName, address, phone, email, logo } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT" 
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (hotelName !== undefined) updateData.hotelName = hotelName.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (logo !== undefined) updateData.logo = logo ? logo.trim() : null;

    // Update setting
    const updated = await db.update(hotelSettings)
      .set(updateData)
      .where(eq(hotelSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(hotelSettings)
      .where(eq(hotelSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Setting not found',
        code: "SETTING_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete setting
    const deleted = await db.delete(hotelSettings)
      .where(eq(hotelSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Setting deleted successfully',
      deleted: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}