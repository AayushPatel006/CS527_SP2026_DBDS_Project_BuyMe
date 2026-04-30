import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { AssistantBidPlan, Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Gavel, Search, Shield, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ASSISTANT_STORAGE_KEY = 'buyme_assistant_plan';

export default function HomePage() {
  const [featured, setFeatured] = useState<Item[]>([]);
  const [stats, setStats] = useState({ active_auctions: 0, verified_sellers: 0, vehicles_listed: 0 });
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantPreview, setAssistantPreview] = useState<AssistantBidPlan | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    api.items.list({ status: 'active' }).then(items => setFeatured(items.slice(0, 6)));
    api.home.stats().then(setStats).catch(() => setStats({ active_auctions: 0, verified_sellers: 0, vehicles_listed: 0 }));
  }, []);

  const handleAssistantSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const query = assistantQuery.trim();

    if (!query) {
      toast({ title: 'Enter a request', description: 'Describe what you want to bid on.', variant: 'destructive' });
      return;
    }

    setAssistantLoading(true);
    try {
      const plan = await api.assistant.planBid(query);
      setAssistantPreview(plan);
      sessionStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(plan));
      navigate(`/item/${plan.item.id}?assistant=1`);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Could not find a matching auction.';
      toast({ title: 'Assistant could not plan a bid', description, variant: 'destructive' });
    } finally {
      setAssistantLoading(false);
    }
  };

  const showStartSelling = !user || user.role === 'buyer';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(220_70%_55%/0.4),transparent_70%)]" />
        <div className="container relative">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:gap-12">
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-6">
                <div className="flex h-36 w-36 items-center justify-center rounded-[2.4rem] border border-white/35 bg-white shadow-[0_28px_75px_rgba(15,23,42,0.26)] backdrop-blur-xl">
                  <img src="/favicon.ico" alt="BuyMe" className="h-36 w-36 rounded-[1.75rem] object-contain" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold  tracking-[0.24em] text-cyan-100/80">MotorAuctionX</p>
                  <p className="text-base text-white/85">Smart vehicle auctions</p>
                </div>
              </div>

              <h1 className="font-heading text-4xl lg:text-6xl font-bold text-primary-foreground mb-4">
                Find Your Next <span className="text-accent">Ride</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                MotorAuctionX is the trusted vehicle auction marketplace. Browse cars, trucks, and motorcycles — bid with confidence.
              </p>

              <div className="flex gap-3">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/browse">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Auctions
                  </Link>
                </Button>

                {showStartSelling && (
                  <Button size="lg" className="glass-button" asChild>
                    <Link to="/register?role=seller">
                      Start Selling
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <form
              onSubmit={handleAssistantSubmit}
              className="relative overflow-hidden space-y-4 rounded-[1.75rem] border border-cyan-200/30 bg-[linear-gradient(155deg,rgba(255,255,255,0.22),rgba(191,219,254,0.12)_45%,rgba(14,165,233,0.14))] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.24)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.24),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_42%)]" />
              <div className="pointer-events-none absolute -right-14 top-6 h-28 w-28 rounded-full bg-cyan-300/25 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-4 h-24 w-24 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    <Bot className="h-3.5 w-3.5" />
                    Bid Assistant
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-extrabold tracking-tight text-white">
                      Tell me what you want to bid on
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-blue-100/75">
                      Describe the car, budget, and year range. I’ll line up the best live match for one-tap confirmation.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-2.5 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
              </div>

              <Textarea
                value={assistantQuery}
                onChange={event => setAssistantQuery(event.target.value)}
                rows={2}
                placeholder='Try: "Place a bid on a sedan car in my budget of 7000 dollars and not older than 2015."'
                className="relative min-h-[96px] rounded-[1.4rem] border-white/20 bg-slate-950/25 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] placeholder:text-blue-100/45"
              />

              <div className="relative flex flex-col gap-3 rounded-[1.35rem] border border-white/15 bg-slate-950/15 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white/90">
                    Search, shortlist, and stage the bid
                  </p>
                  <p className="text-xs leading-5 text-blue-100/65">
                    I’ll find the best live auction, open the item page, and preload a one-click confirmation bid.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="shrink-0 rounded-full border border-cyan-200/35 bg-[linear-gradient(135deg,rgba(125,211,252,0.3),rgba(37,99,235,0.85),rgba(103,232,249,0.65))] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(14,165,233,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(14,165,233,0.42)]"
                  disabled={assistantLoading}
                >
                  <Sparkles className="h-4 w-4" />
                  {assistantLoading ? 'Finding match...' : 'Find and Prepare Bid'}
                </Button>
              </div>

              {assistantPreview && (
                <div className="relative rounded-[1.45rem] border border-emerald-200/25 bg-[linear-gradient(160deg,rgba(16,185,129,0.14),rgba(255,255,255,0.12))] p-4 text-left text-white shadow-[0_14px_36px_rgba(15,118,110,0.16)]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-2xl bg-emerald-300/15 p-2 text-emerald-100">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                        Best Live Match
                      </p>
                      <p className="font-heading text-base font-bold text-white">{assistantPreview.item.title}</p>
                      <p className="text-sm leading-5 text-blue-50/75">{assistantPreview.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
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
