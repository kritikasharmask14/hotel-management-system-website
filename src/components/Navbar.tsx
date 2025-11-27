"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Hotel, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Hotel className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                The M&S
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'}>Home</Button>
            </Link>
            <Link href="/rooms">
              <Button variant={isActive('/rooms') ? 'default' : 'ghost'}>Rooms</Button>
            </Link>
            <Link href="/about">
              <Button variant={isActive('/about') ? 'default' : 'ghost'}>About</Button>
            </Link>
            <Link href="/contact">
              <Button variant={isActive('/contact') ? 'default' : 'ghost'}>Contact</Button>
            </Link>

            {user ? (
              <>
                {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
                  <Link href="/dashboard">
                    <Button variant={isActive('/dashboard') ? 'default' : 'ghost'}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/') ? 'default' : 'ghost'} className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link href="/rooms" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/rooms') ? 'default' : 'ghost'} className="w-full justify-start">
                Rooms
              </Button>
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/about') ? 'default' : 'ghost'} className="w-full justify-start">
                About
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive('/contact') ? 'default' : 'ghost'} className="w-full justify-start">
                Contact
              </Button>
            </Link>

            {user ? (
              <>
                {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="px-3 py-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                </div>
                <Button variant="outline" onClick={logout} className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}