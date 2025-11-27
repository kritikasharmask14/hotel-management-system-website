import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Hotel, Wifi, Tv, Coffee, Wind, Star, Users, Calendar, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to The M&S
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Experience luxury and comfort in the heart of the city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rooms">
              <Button size="lg" className="text-lg px-8 py-6">
                Book Your Stay
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground">Experience the best hospitality services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Luxury Rooms</h3>
                <p className="text-muted-foreground">
                  Elegantly designed rooms with premium amenities for your comfort
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Excellent Service</h3>
                <p className="text-muted-foreground">
                  24/7 concierge service dedicated to making your stay perfect
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-muted-foreground">
                  Simple online booking system with instant confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Room Types Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Rooms</h2>
            <p className="text-lg text-muted-foreground">Choose from our selection of luxury accommodations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Single Room', price: '$80', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80', occupancy: 1 },
              { name: 'Double Room', price: '$120', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80', occupancy: 2 },
              { name: 'Suite', price: '$200', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80', occupancy: 4 },
              { name: 'Deluxe Suite', price: '$350', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', occupancy: 6 },
            ].map((room) => (
              <Card key={room.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url('${room.image}')` }}
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">{room.price}</span>
                    <span className="text-sm text-muted-foreground">per night</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Up to {room.occupancy} guests</span>
                  </div>
                  <Link href="/rooms">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/rooms">
              <Button size="lg" variant="outline">
                View All Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Amenities</h2>
            <p className="text-lg text-muted-foreground">Everything you need for a comfortable stay</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Wifi, label: 'Free WiFi' },
              { icon: Tv, label: 'Smart TV' },
              { icon: Coffee, label: 'Breakfast' },
              { icon: Wind, label: 'Air Conditioning' },
              { icon: Clock, label: '24/7 Service' },
              { icon: Hotel, label: 'Housekeeping' },
              { icon: Users, label: 'Concierge' },
              { icon: Star, label: 'Premium Service' },
            ].map((amenity) => (
              <div key={amenity.label} className="flex flex-col items-center text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <amenity.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="font-medium">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Book Your Stay?</h2>
          <p className="text-lg mb-8 opacity-90">
            Experience luxury and comfort at The M&S. Book now for the best rates!
          </p>
          <Link href="/rooms">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Book Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}