import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const VALID_ROLES = ['ADMIN', 'RECEPTIONIST', 'CUSTOMER'];

function excludePassword(user: any) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(excludePassword(user[0]), { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    let query = db.select().from(users);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (role && VALID_ROLES.includes(role)) {
      conditions.push(eq(users.role, role));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(
      results.map((user) => excludePassword(user)),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, email, password, role',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          error: 'Email already exists',
          code: 'EMAIL_ALREADY_EXISTS',
        },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(excludePassword(newUser[0]), { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, role } = body;

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    if (email) {
      const sanitizedEmail = email.trim().toLowerCase();
      const duplicateUser = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, sanitizedEmail),
            eq(users.id, parseInt(id))
          )
        )
        .limit(1);

      if (duplicateUser.length === 0) {
        const emailExists = await db
          .select()
          .from(users)
          .where(eq(users.email, sanitizedEmail))
          .limit(1);

        if (emailExists.length > 0) {
          return NextResponse.json(
            {
              error: 'Email already exists',
              code: 'EMAIL_ALREADY_EXISTS',
            },
            { status: 400 }
          );
        }
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (role) updates.role = role;
    if (password) {
      updates.password = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(excludePassword(updatedUser[0]), { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        user: excludePassword(deleted[0]),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}