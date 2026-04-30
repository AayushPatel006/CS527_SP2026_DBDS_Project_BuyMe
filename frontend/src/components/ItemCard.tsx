import { Item } from '@/types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp } from 'lucide-react';

function timeLeft(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m left`;
}

export default function ItemCard({ item }: { item: Item }) {
  const ended = item.status !== 'active' || new Date(item.closes_at) <= new Date();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link to={`/item/${item.id}`} className="block">
      <Card className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 shadow-[0_30px_90px_rgba(29,78,216,0.16)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_45px_120px_rgba(29,78,216,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/75 via-white/25 to-sky-100/35" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl transition-all duration-500 group-hover:bg-sky-300/50" />
        <div className="pointer-events-none absolute inset-0 translate-x-[-130%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.78),transparent)] transition-transform duration-1000 group-hover:translate-x-[130%]" />

        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2rem] bg-muted">
          {item.image_url && !imageFailed ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:saturate-110"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-white px-4 text-center text-muted-foreground">
              Image unavailable
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/35 via-transparent to-white/10 opacity-80" />
        </div>

        <CardContent className="relative p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant={ended ? 'secondary' : 'default'}
              className="rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs font-semibold text-blue-800 shadow-sm backdrop-blur-xl"
            >
              {item.category_name}
            </Badge>

            {ended && (
              <Badge
                variant="outline"
                className="rounded-full border-blue-200/70 bg-white/55 px-3 py-1 text-xs text-blue-700 shadow-sm backdrop-blur-xl"
              >
                Ended
              </Badge>
            )}
          </div>

          <h3 className="mb-4 line-clamp-2 font-heading text-base font-bold tracking-tight text-blue-950 transition-colors group-hover:text-blue-700">
            {item.title}
          </h3>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-blue-900/50">Current Bid</p>
              <p className="font-heading text-2xl font-extrabold tracking-tight text-blue-700">
                ${(item.current_bid || item.starting_price).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100/80 bg-white/60 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_30px_rgba(29,78,216,0.1)] backdrop-blur-xl">
              <div className="flex items-center justify-end gap-1 text-xs font-medium text-blue-900/60">
                <TrendingUp className="h-3 w-3" />
                {item.bid_count || 0} bids
              </div>

              <div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-blue-900/60">
                <Clock className="h-3 w-3" />
                {timeLeft(item.closes_at)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
