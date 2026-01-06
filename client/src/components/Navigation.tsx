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
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 blur-sm animate-pulse" />
              <CarFront size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="font-display text-2xl font-normal tracking-wider text-foreground">
              ihatela<span className="text-primary">drivers</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-normal transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              leaderboard
            </Link>
            <Link 
              href="/search" 
              className={`text-sm font-normal transition-colors hover:text-primary ${
                location === "/search" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              search plates
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/report">
            <Button 
              className="hidden sm:flex bg-primary hover:bg-primary/90 border-0 font-normal px-6 rounded-full"
              data-testid="button-report-driver"
            >
              upload socal driver
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'user'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-normal">
                      {user?.firstName?.[0] || 'u'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-normal leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-500 cursor-pointer focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href="/api/login">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5 hover:text-primary font-normal">
                <LogIn className="mr-2 h-4 w-4" />
                login
              </Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
