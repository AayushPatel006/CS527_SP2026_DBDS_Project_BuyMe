import { Item } from '@/types';
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

  return (
    <Link to={`/item/${item.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={ended ? 'secondary' : 'default'} className="text-xs">
              {item.category_name}
            </Badge>
            {ended && <Badge variant="outline" className="text-xs">Ended</Badge>}
          </div>
          <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-2">{item.title}</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Bid</p>
              <p className="font-heading font-bold text-lg text-primary">
                ${(item.current_bid || item.starting_price).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {item.bid_count || 0} bids
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
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
