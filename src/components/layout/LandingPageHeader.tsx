
'use client';

import Link from 'next/link';
import { PiggyBank, LayoutDashboard, LogIn, LogOut, Settings, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LandingPageHeader() {
  const { user, error, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <PiggyBank className="h-7 w-7 text-primary" />
          <span className="hidden sm:inline text-xl font-bold text-primary">Shared Savings</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/trips">
              <Route className="mr-0 sm:mr-2 h-4 w-4" /> {/* Changed icon for variety */}
              <span className="hidden sm:inline">Explore Trips</span>
            </Link>
          </Button>
          {!isLoading && !user && (
            <Button asChild>
              <a href="/api/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </a>
            </Button>
          )}
          {user && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.picture ?? undefined} alt={user.name ?? 'User avatar'} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/manage-trips" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Create/Manage Trips
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/auth/logout" className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}

    