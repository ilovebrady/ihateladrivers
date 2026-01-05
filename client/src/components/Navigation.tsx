import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CarFront, LogIn, LogOut, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
              <CarFront size={24} className="group-hover:animate-pulse" />
            </div>
            <span className="font-display text-2xl font-bold tracking-wider text-foreground">
              IHATELA<span className="text-primary">DRIVERS</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Leaderboard
            </Link>
            <Link 
              href="/search" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/search" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Search Plates
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/report">
            <Button 
              className="hidden sm:flex bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/20 border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Report Driver
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-500 cursor-pointer focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/api/login">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5 hover:text-primary">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
