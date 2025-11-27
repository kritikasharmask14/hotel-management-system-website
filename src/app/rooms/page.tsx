"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Users, Wifi, Tv, Coffee, Wind, Search, Calendar, Hotel } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [totalRoomsCount, setTotalRoomsCount] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Form
  const [bookingData, setBookingData] = useState({
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    numberOfGuests: 1,
  });

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        guestName: user.name,
        guestEmail: user.email,
      }));
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // First, fetch total rooms count without filters
      const totalResponse = await fetch('/api/rooms?limit=1000');
      const totalData = await totalResponse.json();
      setTotalRoomsCount(totalData.length);

      // Then fetch with filters
      let url = '/api/rooms?limit=100&status=AVAILABLE';
      if (typeFilter !== 'all') {
        url += `&type=${typeFilter}`;
      }
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [typeFilter, searchQuery]);

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedRoom) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights * selectedRoom.price : 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a room');
      router.push('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    const totalAmount = calculateTotal();

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          roomId: selectedRoom.id,
          userId: user.id,
          totalAmount,
          status: 'PENDING',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // Update room status to BOOKED
      await fetch(`/api/rooms?id=${selectedRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'BOOKED' }),
      });

      toast.success('Booking successful! Booking ID: ' + data.bookingId);
      setBookingOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    }
  };

  const openBookingDialog = (room: any) => {
    setSelectedRoom(room);
    setBookingOpen(true);
  };

  const getRoomImage = (type: string) => {
    const images: any = {
      SINGLE: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80',
      DOUBLE: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80',
      SUITE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
      DELUXE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    };
    return images[type] || images.SINGLE;
  };

  const parseAmenities = (amenities: string | null): string[] => {
    if (!amenities) return [];
    // Handle comma-separated string
    if (typeof amenities === 'string' && !amenities.startsWith('[')) {
      return amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
    }
    // Handle JSON array
    try {
      return JSON.parse(amenities);
    } catch {
      return [];
    }
  };

  const hasFiltersApplied = typeFilter !== 'all' || searchQuery !== '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Our Rooms</h1>
            <p className="text-muted-foreground">Find the perfect room for your stay</p>
          </div>

          {/* Filters - Only show if there are rooms */}
          {totalRoomsCount > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="DOUBLE">Double</SelectItem>
                      <SelectItem value="SUITE">Suite</SelectItem>
                      <SelectItem value="DELUXE">Deluxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Rooms Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : totalRoomsCount === 0 ? (
            // No rooms in database at all
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div className="bg-muted rounded-full p-6">
                  <Hotel className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Rooms Available Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our hotel rooms are currently being set up. Please check back soon or contact us for more information.
              </p>
              {user?.role === 'ADMIN' && (
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard to Add Rooms
                </Button>
              )}
            </div>
          ) : rooms.length === 0 && hasFiltersApplied ? (
            // Filters applied but no matches
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="bg-muted rounded-full p-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Rooms Match Your Filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url('${getRoomImage(room.type)}')` }}
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Room {room.roomNumber}</CardTitle>
                      <Badge>{room.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Up to {room.occupancy} guests</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parseAmenities(room.amenities).slice(0, 4).map((amenity: string, index: number) => (
                          <Badge key={`${amenity}-${index}`} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">${room.price}</span>
                        <span className="text-sm text-muted-foreground"> /night</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => openBookingDialog(room)}>
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Room {selectedRoom?.roomNumber}</DialogTitle>
            <DialogDescription>
              Fill in your details to complete the booking
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <Label>Guest Name</Label>
              <Input
                required
                value={bookingData.guestName}
                onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={bookingData.guestEmail}
                onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                required
                value={bookingData.guestPhone}
                onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
              />
            </div>
            <div>
              <Label>Check-in Date</Label>
              <Input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.checkIn}
                onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
              />
            </div>
            <div>
              <Label>Check-out Date</Label>
              <Input
                type="date"
                required
                min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                value={bookingData.checkOut}
                onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
              />
            </div>
            <div>
              <Label>Number of Guests</Label>
              <Input
                type="number"
                required
                min={1}
                max={selectedRoom?.occupancy}
                value={bookingData.numberOfGuests}
                onChange={(e) => setBookingData({...bookingData, numberOfGuests: parseInt(e.target.value)})}
              />
            </div>
            {bookingData.checkIn && bookingData.checkOut && (
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">${calculateTotal()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights × ${selectedRoom?.price}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}