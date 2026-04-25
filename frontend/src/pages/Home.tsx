import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gavel, Search, Shield } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState<Item[]>([]);
  const [stats, setStats] = useState({ active_auctions: 0, verified_sellers: 0, vehicles_listed: 0 });

  useEffect(() => {
    api.items.list({ status: 'active' }).then(items => setFeatured(items.slice(0, 6)));
    api.home.stats().then(setStats).catch(() => setStats({ active_auctions: 0, verified_sellers: 0, vehicles_listed: 0 }));
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
                <Link to="/browse">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Auctions
                </Link>
              </Button>

              <Button size="lg" className="glass-button" asChild>
                <Link to="/register?role=seller">
                  Start Selling
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden border-b border-blue-200/50 bg-white/40 py-8 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.35),transparent_55%)]" />

      <div className="container relative grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { icon: Gavel, label: 'Active Auctions', value: stats.active_auctions.toLocaleString() },
          { icon: Shield, label: 'Verified Sellers', value: stats.verified_sellers.toLocaleString() },
          { icon: Search, label: 'Vehicles Listed', value: stats.vehicles_listed.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/55 p-6 text-center shadow-[0_24px_70px_rgba(29,78,216,0.14)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_95px_rgba(29,78,216,0.28)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/25 to-blue-100/30" />

            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-sky-300/30 blur-3xl transition-all duration-500 group-hover:bg-sky-300/50" />

            <div className="absolute inset-0 translate-x-[-130%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.78),transparent)] transition-transform duration-1000 group-hover:translate-x-[130%]" />

            <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-blue-600 to-cyan-300 text-white shadow-[0_14px_42px_rgba(29,78,216,0.45)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_18px_55px_rgba(29,78,216,0.62)]">
              <Icon className="h-6 w-6 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
            </div>

            <p className="relative font-heading text-3xl font-extrabold tracking-tight text-blue-950">
              {value}
            </p>

            <p className="relative mt-1 text-sm font-medium text-blue-900/60">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>

      {/* Featured Auctions */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-bold">Featured Auctions</h2>

          <Button variant="ghost" asChild>
            <Link to="/browse">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}