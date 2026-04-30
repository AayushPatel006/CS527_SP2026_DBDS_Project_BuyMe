import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User, Shield } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/55 shadow-[0_12px_40px_rgba(29,78,216,0.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50">
      <div className="container flex h-20 items-center gap-4">
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-full border border-white/60 bg-white/55 px-4 py-2 shadow-[0_16px_45px_rgba(29,78,216,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(29,78,216,0.22)]"
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-300 via-blue-700 to-cyan-300 text-white shadow-[0_14px_42px_rgba(29,78,216,0.45)]">
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.85),transparent)] transition-transform duration-700 group-hover:translate-x-[120%]" />
            <img
              src="/favicon.ico"
              alt="BuyMe"
              className="relative h-6 w-6 rounded-md object-contain drop-shadow-md"
            />
          </span>

          <span className="font-heading text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-950 via-blue-700 to-cyan-400 bg-clip-text text-transparent">
              Motor
            </span>
            <span className="text-blue-950">AuctionX</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            {/* <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-blue-900/45" /> */}
            {/* <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              className="h-11 rounded-full border-white/60 bg-white/60 pl-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(29,78,216,0.08)] backdrop-blur-xl transition-all duration-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15"
            /> */}
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2">
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

              <Button size="sm" className="glass-button" asChild>
                <Link to="/register">Sign Up and Buy</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
