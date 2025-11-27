import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// User table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  role: text('role').notNull(), // ADMIN, RECEPTIONIST, CUSTOMER
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Room table
export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomNumber: text('room_number').notNull().unique(),
  type: text('type').notNull(), // SINGLE, DOUBLE, SUITE, DELUXE
  price: real('price').notNull(),
  status: text('status').notNull(), // AVAILABLE, BOOKED, MAINTENANCE
  description: text('description'),
  amenities: text('amenities', { mode: 'json' }), // JSON array
  image: text('image'),
  occupancy: integer('occupancy').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Booking table
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: text('booking_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  roomId: integer('room_id').references(() => rooms.id),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  numberOfGuests: integer('number_of_guests').notNull(),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull(), // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Payment table
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').references(() => bookings.id),
  amount: real('amount').notNull(),
  method: text('method').notNull(), // CASH, CARD, UPI, ONLINE
  transactionId: text('transaction_id'),
  paymentDate: text('payment_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Staff table
export const staff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  department: text('department').notNull(), // MANAGEMENT, RECEPTION, HOUSEKEEPING
  salary: real('salary'),
  joiningDate: text('joining_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// HotelSettings table
export const hotelSettings = sqliteTable('hotel_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hotelName: text('hotel_name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  logo: text('logo'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});