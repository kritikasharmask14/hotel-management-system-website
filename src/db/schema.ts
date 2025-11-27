import { pgTable, serial, text, real, integer, timestamp } from 'drizzle-orm/pg-core';

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  role: text('role').notNull(), // ADMIN, RECEPTIONIST, CUSTOMER
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Room table
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomNumber: text('room_number').notNull().unique(),
  type: text('type').notNull(), // SINGLE, DOUBLE, SUITE, DELUXE
  price: real('price').notNull(),
  status: text('status').notNull(), // AVAILABLE, BOOKED, MAINTENANCE
  description: text('description'),
  amenities: text('amenities'), // Comma-separated string
  image: text('image'),
  occupancy: integer('occupancy').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Booking table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingId: text('booking_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  roomId: integer('room_id').references(() => rooms.id),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  numberOfGuests: integer('number_of_guests').notNull(),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull(), // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Payment table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id),
  amount: real('amount').notNull(),
  method: text('method').notNull(), // CASH, CARD, UPI, ONLINE
  transactionId: text('transaction_id'),
  paymentDate: timestamp('payment_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Staff table
export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  department: text('department').notNull(), // MANAGEMENT, RECEPTION, HOUSEKEEPING
  salary: real('salary'),
  joiningDate: timestamp('joining_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// HotelSettings table
export const hotelSettings = pgTable('hotel_settings', {
  id: serial('id').primaryKey(),
  hotelName: text('hotel_name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  logo: text('logo'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});