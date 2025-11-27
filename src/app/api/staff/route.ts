import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_DEPARTMENTS = ['MANAGEMENT', 'RECEPTION', 'HOUSEKEEPING'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single staff fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const staffMember = await db
        .select()
        .from(staff)
        .where(eq(staff.id, parseInt(id)))
        .limit(1);

      if (staffMember.length === 0) {
        return NextResponse.json(
          { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(staffMember[0], { status: 200 });
    }

    // List staff with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const department = searchParams.get('department');
    const userId = searchParams.get('userId');

    let query = db.select().from(staff);

    // Build filter conditions
    const conditions = [];

    if (department) {
      if (!VALID_DEPARTMENTS.includes(department)) {
        return NextResponse.json(
          {
            error: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
            code: 'INVALID_DEPARTMENT',
          },
          { status: 400 }
        );
      }
      conditions.push(eq(staff.department, department));
    }

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(staff.userId, parseInt(userId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

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
    const { userId, department, salary, joiningDate } = body;

    // Validate required fields
    if (!department) {
      return NextResponse.json(
        { error: 'Department is required', code: 'MISSING_DEPARTMENT' },
        { status: 400 }
      );
    }

    if (!joiningDate) {
      return NextResponse.json(
        { error: 'Joining date is required', code: 'MISSING_JOINING_DATE' },
        { status: 400 }
      );
    }

    // Validate department value
    if (!VALID_DEPARTMENTS.includes(department)) {
      return NextResponse.json(
        {
          error: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
          code: 'INVALID_DEPARTMENT',
        },
        { status: 400 }
      );
    }

    // Validate salary if provided
    if (salary !== undefined && salary !== null) {
      if (typeof salary !== 'number' || salary <= 0) {
        return NextResponse.json(
          { error: 'Salary must be a positive number', code: 'INVALID_SALARY' },
          { status: 400 }
        );
      }
    }

    // Validate userId if provided
    if (userId !== undefined && userId !== null) {
      if (typeof userId !== 'number' || isNaN(userId)) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
    }

    // Validate joiningDate format (basic ISO date check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(joiningDate)) {
      return NextResponse.json(
        {
          error: 'Joining date must be a valid date string (YYYY-MM-DD)',
          code: 'INVALID_JOINING_DATE',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Prepare insert data
    const insertData: any = {
      department,
      joiningDate,
      createdAt: now,
      updatedAt: now,
    };

    if (userId !== undefined && userId !== null) {
      insertData.userId = userId;
    }

    if (salary !== undefined && salary !== null) {
      insertData.salary = salary;
    }

    const newStaff = await db.insert(staff).values(insertData).returning();

    return NextResponse.json(newStaff[0], { status: 201 });
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

    // Check if staff exists
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { userId, department, salary, joiningDate } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and add department if provided
    if (department !== undefined) {
      if (!VALID_DEPARTMENTS.includes(department)) {
        return NextResponse.json(
          {
            error: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
            code: 'INVALID_DEPARTMENT',
          },
          { status: 400 }
        );
      }
      updates.department = department;
    }

    // Validate and add salary if provided
    if (salary !== undefined && salary !== null) {
      if (typeof salary !== 'number' || salary <= 0) {
        return NextResponse.json(
          { error: 'Salary must be a positive number', code: 'INVALID_SALARY' },
          { status: 400 }
        );
      }
      updates.salary = salary;
    }

    // Validate and add userId if provided
    if (userId !== undefined) {
      if (userId !== null && (typeof userId !== 'number' || isNaN(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      updates.userId = userId;
    }

    // Validate and add joiningDate if provided
    if (joiningDate !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (!dateRegex.test(joiningDate)) {
        return NextResponse.json(
          {
            error: 'Joining date must be a valid date string (YYYY-MM-DD)',
            code: 'INVALID_JOINING_DATE',
          },
          { status: 400 }
        );
      }
      updates.joiningDate = joiningDate;
    }

    const updatedStaff = await db
      .update(staff)
      .set(updates)
      .where(eq(staff.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedStaff[0], { status: 200 });
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

    // Check if staff exists
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(staff)
      .where(eq(staff.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Staff deleted successfully',
        staff: deleted[0],
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