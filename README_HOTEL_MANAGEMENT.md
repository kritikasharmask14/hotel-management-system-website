# 🏨 Grand Plaza Hotel Management System

A fully functional, production-ready Hotel Management System built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Drizzle ORM**.

## ✨ Features

### 🔐 Authentication System
- Secure login/signup with password hashing (bcrypt)
- Role-based access control (Admin, Receptionist, Customer)
- Session management with iron-session
- Protected routes and API endpoints

### 📊 Admin Dashboard
- Real-time statistics:
  - Total rooms, available, booked, maintenance
  - Total bookings (confirmed, checked-in, pending)
  - Total guests and revenue
- Room management (CRUD operations)
- Booking management with status updates
- Check-in/Check-out functionality
- Staff management (Admin only)

### 🛏️ Room Management
- Room types: Single, Double, Suite, Deluxe
- Room statuses: Available, Booked, Maintenance
- Room amenities tracking
- Price and occupancy management
- Room images

### 📅 Online Booking System
- Search and filter rooms by type, price
- Real-time availability checking
- Booking form with validation
- Automatic fare calculation
- Date-based pricing
- Prevent overlapping bookings
- Generate unique Booking IDs
- Automatic room status updates

### 👥 Guest Management
- Customer registration
- Guest profile management
- Booking history
- Contact information

### 💰 Billing & Payments
- Automatic price calculation
- Payment tracking
- Multiple payment methods (Cash, Card, UPI, Online)
- Transaction management

### 🎨 Modern UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Clean, professional design with Shadcn/UI
- Dark mode support
- Smooth animations and transitions
- Interactive dashboard
- Mobile-friendly navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Turso Database account (or any LibSQL compatible database)

### Installation

1. **Install dependencies:**
```bash
bun install
```

2. **Environment variables are already set up in `.env`:**
```env
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
```

3. **Run database migrations:**
```bash
bun run drizzle-kit push
```

4. **Seed the database:**
```bash
bun run tsx src/db/seeds/users.ts
bun run tsx src/db/seeds/rooms.ts
bun run tsx src/db/seeds/bookings.ts
bun run tsx src/db/seeds/staff.ts
bun run tsx src/db/seeds/hotelSettings.ts
```

5. **Start the development server:**
```bash
bun dev
```

6. **Open your browser:**
```
http://localhost:3000
```

## 👤 Demo Credentials

### Admin Account
- **Email:** admin@hotel.com
- **Password:** admin123
- **Access:** Full system access including staff management

### Receptionist Account
- **Email:** receptionist1@hotel.com
- **Password:** receptionist123
- **Access:** Dashboard, booking, and room management

### Customer Account
- **Email:** john.smith@example.com
- **Password:** customer123
- **Access:** Room booking and profile

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management
│   │   ├── rooms/         # Room management
│   │   ├── bookings/      # Booking management
│   │   ├── payments/      # Payment tracking
│   │   ├── staff/         # Staff management
│   │   └── dashboard/     # Dashboard stats
│   ├── (pages)/
│   │   ├── page.tsx       # Homepage
│   │   ├── rooms/         # Room listing
│   │   ├── about/         # About page
│   │   ├── contact/       # Contact page
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── dashboard/     # Admin dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # Shadcn/UI components
│   ├── Navbar.tsx        # Main navigation
│   └── Footer.tsx        # Footer component
├── db/
│   ├── schema.ts         # Database schema
│   ├── index.ts          # Database client
│   └── seeds/            # Database seeders
├── hooks/
│   └── useAuth.ts        # Authentication hook
└── lib/
    ├── session.ts        # Session management
    └── utils.ts          # Utility functions
```

## 🗄️ Database Schema

### Users Table
- Authentication and user management
- Roles: ADMIN, RECEPTIONIST, CUSTOMER
- Password hashing with bcrypt

### Rooms Table
- Room inventory management
- Types: SINGLE, DOUBLE, SUITE, DELUXE
- Status tracking
- Amenities (JSON)

### Bookings Table
- Reservation management
- Auto-generated booking IDs
- Status tracking
- Guest information

### Payments Table
- Payment tracking
- Multiple payment methods
- Transaction history

### Staff Table
- Staff member management
- Department assignments
- Salary tracking

### Hotel Settings Table
- Hotel configuration
- Contact information
- Branding

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Rooms
- `GET /api/rooms` - List rooms (with filters)
- `POST /api/rooms` - Create room
- `PUT /api/rooms?id=X` - Update room
- `DELETE /api/rooms?id=X` - Delete room

### Bookings
- `GET /api/bookings` - List bookings (with filters)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings?id=X` - Update booking
- `DELETE /api/bookings?id=X` - Delete booking

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Users, Payments, Staff
- Similar CRUD operations available

## 🎯 Key Features Explained

### Role-Based Access Control
- **Admin:** Full system access
- **Receptionist:** Manage bookings, rooms, check-in/out
- **Customer:** Browse and book rooms

### Booking Flow
1. Customer browses available rooms
2. Selects desired room and dates
3. System calculates total price
4. Customer fills booking form
5. System generates unique booking ID
6. Room status automatically updated
7. Booking confirmation shown

### Check-in/Check-out
1. Receptionist views pending bookings
2. Click "Check-In" to mark guest arrived
3. Click "Check-Out" when guest leaves
4. Room automatically becomes available

### Real-time Dashboard
- Live statistics updated on every action
- Recent bookings list
- Room status overview
- Revenue tracking

## 🛠️ Technologies Used

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/UI
- **Database:** Turso (LibSQL)
- **ORM:** Drizzle ORM
- **Authentication:** iron-session + bcrypt
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📱 Responsive Design

The system is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 UI Features

- Clean, modern design
- Smooth animations
- Dark mode support
- Interactive cards
- Loading states
- Error handling
- Toast notifications
- Modal dialogs
- Responsive navigation

## 🔒 Security Features

- Password hashing with bcrypt
- Secure session management
- Role-based access control
- Input validation
- SQL injection prevention (Drizzle ORM)
- CSRF protection
- HTTP-only cookies

## 📈 Future Enhancements

- Email notifications
- PDF invoice generation
- Advanced reporting
- Room availability calendar
- Online payment integration
- Guest reviews system
- Loyalty program
- Multi-language support

## 🤝 Contributing

This is a production-ready system. Feel free to extend and customize based on your needs.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Support

For issues or questions:
- Check the demo credentials
- Review the API documentation
- Test with the seeded data

---

**Built with ❤️ using Next.js and modern web technologies**
