import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gavel, Search, Shield } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState<Item[]>([]);
  const [stats, setStats] = useState({
  active_auctions: 0,
  verified_sellers: 0,
  vehicles_listed: 0,
});

  useEffect(() => {
    api.items.list({ status: 'active' }).then(items => {
    const topItems = [...items]
      .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))
      .slice(0, 6);
    setFeatured(topItems);
});
  }, []);

  useEffect(() => {
    api.stats.get().then(setStats);
  }, []);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(220_70%_55%/0.4),transparent_70%)]" />
        <div className="container relative">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl lg:text-6xl font-bold text-primary-foreground mb-4">
              Find Your Next <span className="text-accent">Ride</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              BuyMe is the trusted vehicle auction marketplace. Browse cars, trucks, and motorcycles — bid with confidence.
            </p>
            <div className="flex gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/browse"><Search className="h-4 w-4 mr-2" />Browse Auctions</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/register">Start Selling <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container grid grid-cols-3 divide-x py-8">
          {[
            { icon: Gavel, label: 'Active Auctions', value: stats.active_auctions },
            { icon: Shield, label: 'Verified Sellers', value: stats.verified_sellers },
            { icon: Search, label: 'Vehicles Listed', value: stats.vehicles_listed },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center px-4">
              <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-heading text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-bold">Featured Auctions</h2>
          <Button variant="ghost" asChild>
            <Link to="/browse">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      </section>
    </div>
  );
}
