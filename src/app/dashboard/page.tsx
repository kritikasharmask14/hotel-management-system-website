"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Hotel, 
  Users, 
  DollarSign, 
  Calendar, 
  Loader2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  rooms: {
    total: number;
    available: number;
    booked: number;
    maintenance: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    checkedIn: number;
    pending: number;
  };
  totalGuests: number;
  totalRevenue: number;
  recentBookings: any[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST'))) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'RECEPTIONIST')) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/rooms?limit=100'),
        fetch('/api/bookings?limit=100')
      ]);

      const [statsData, roomsData, bookingsData] = await Promise.all([
        statsRes.json(),
        roomsRes.json(),
        bookingsRes.json()
      ]);

      setStats(statsData);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (roomId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/rooms?id=${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST')) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Hotel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.rooms.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.rooms.available || 0} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.bookings.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.bookings.pending || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalGuests || 0}</div>
                <p className="text-xs text-muted-foreground">Registered customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              {user.role === 'ADMIN' && <TabsTrigger value="staff">Staff</TabsTrigger>}
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Manage all hotel bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">
                              Booking ID: {booking.bookingId}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={
                              booking.status === 'CONFIRMED' ? 'default' :
                              booking.status === 'CHECKED_IN' ? 'secondary' :
                              booking.status === 'PENDING' ? 'outline' :
                              'destructive'
                            }>
                              {booking.status}
                            </Badge>
                            <div className="text-right">
                              <div className="font-semibold">${booking.totalAmount}</div>
                            </div>
                            {booking.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'CHECKED_IN')}
                              >
                                Check-In
                              </Button>
                            )}
                            {booking.status === 'CHECKED_IN' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'CHECKED_OUT')}
                              >
                                Check-Out
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room Management</CardTitle>
                  <CardDescription>View and manage all hotel rooms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <Card key={room.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                            <Badge variant={
                              room.status === 'AVAILABLE' ? 'default' :
                              room.status === 'BOOKED' ? 'secondary' :
                              'destructive'
                            }>
                              {room.status}
                            </Badge>
                          </div>
                          <CardDescription>{room.type}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Price:</span>
                              <span className="font-semibold">${room.price}/night</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Occupancy:</span>
                              <span>{room.occupancy} guests</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                              {room.status === 'AVAILABLE' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => updateRoomStatus(room.id, 'MAINTENANCE')}
                                >
                                  Maintenance
                                </Button>
                              )}
                              {room.status === 'MAINTENANCE' && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                                >
                                  Set Available
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Tab (Admin Only) */}
            {user.role === 'ADMIN' && (
              <TabsContent value="staff" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Manage hotel staff members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Staff management features coming soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
