import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Star, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative h-[400px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">About The M&S</h1>
            <p className="text-xl max-w-2xl mx-auto">
              A legacy of luxury and hospitality since 1995
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Welcome to The M&S, where luxury meets comfort in the heart of the city. 
                  Since our establishment in 1995, we have been dedicated to providing exceptional 
                  hospitality and unforgettable experiences to our guests.
                </p>
                <p>
                  Our hotel features elegantly designed rooms, world-class amenities, and personalized 
                  service that caters to both business and leisure travelers. We pride ourselves on 
                  attention to detail and our commitment to excellence.
                </p>
                <p>
                  Whether you're visiting for business or pleasure, The M&S offers the 
                  perfect blend of sophistication and comfort, making every stay a memorable one.
                </p>
              </div>
            </div>
            <div 
              className="h-96 bg-cover bg-center rounded-lg shadow-xl"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80')",
              }}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <Card>
                <CardContent className="pt-6">
                  <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold mb-2">28+</div>
                  <div className="text-muted-foreground">Years of Excellence</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold mb-2">50K+</div>
                  <div className="text-muted-foreground">Happy Guests</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold mb-2">4.9/5</div>
                  <div className="text-muted-foreground">Guest Rating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-muted-foreground">Concierge Service</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">What makes us different</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every aspect of our service, ensuring that each guest 
                  receives the highest quality experience.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Hospitality</h3>
                <p className="text-muted-foreground">
                  Our warm and welcoming approach makes every guest feel at home, creating lasting 
                  memories and relationships.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve and adopt new technologies to enhance guest comfort and 
                  streamline their experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}