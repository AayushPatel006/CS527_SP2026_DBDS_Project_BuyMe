import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User, Gavel, Shield, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Gavel className="h-6 w-6" />
          BuyMe
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              className="pl-9"
            />
          </div>
        </form>

        <nav className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse">Browse</Link>
          </Button>

          {isAuthenticated ? (
            <>
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sell">Sell</Link>
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin"><Shield className="h-4 w-4 mr-1" />Admin</Link>
                </Button>
              )}
              {user?.role === 'rep' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/rep">Rep Panel</Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications"><Bell className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile"><User className="h-4 w-4 mr-1" />{user?.username}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
