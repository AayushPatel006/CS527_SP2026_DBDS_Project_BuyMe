import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Item, Bid } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Clock, TrendingUp, User, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function timeLeft(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return 'Auction Ended';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${d}d ${h}h ${m}m remaining`;
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [autoBid, setAutoBid] = useState(false);
  const [autoBidLimit, setAutoBidLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    Promise.all([api.items.get(Number(id)), api.bids.listByItem(Number(id))]).then(([item, bids]) => {
      setItem(item);
      setBids(bids);
      setBidAmount(String((item.current_bid || item.starting_price) + item.bid_increment));
      setLoading(false);
    });
  }, [id]);

  const handleBid = async () => {
    if (!item) return;
    const amount = Number(bidAmount);
    const minBid = (item.current_bid || item.starting_price) + item.bid_increment;
    if (amount < minBid) {
      toast({ title: 'Bid too low', description: `Minimum bid is $${minBid.toLocaleString()}`, variant: 'destructive' });
      return;
    }
    try {
      const bid = await api.bids.place(item.id, amount, autoBid ? Number(autoBidLimit) : undefined);
      setBids(prev => [bid, ...prev]);
      toast({ title: 'Bid placed!', description: `Your bid of $${amount.toLocaleString()} was placed successfully.` });
    } catch {
      toast({ title: 'Bid failed', variant: 'destructive' });
    }
  };

  if (loading) return <div className="container py-16 text-center text-muted-foreground">Loading...</div>;
  if (!item) return <div className="container py-16 text-center text-muted-foreground">Item not found</div>;

  const ended = item.status !== 'active' || new Date(item.closes_at) <= new Date();

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{item.category_name}</Badge>
              <Badge variant={ended ? 'secondary' : 'outline'}>{ended ? 'Ended' : 'Active'}</Badge>
            </div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold">{item.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-4 w-4" />{item.seller_username}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{timeLeft(item.closes_at)}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="font-heading text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{item.description}</p>
          </div>

          {item.field_values && Object.keys(item.field_values).length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="font-heading text-lg font-semibold mb-3">Vehicle Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(item.field_values).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Bid History */}
          <div>
            <h2 className="font-heading text-lg font-semibold mb-3">Bid History ({bids.length})</h2>
            {bids.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bidder</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map(bid => (
                    <TableRow key={bid.id}>
                      <TableCell>{bid.bidder_username}</TableCell>
                      <TableCell className="font-semibold">${bid.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{bid.is_auto ? 'Auto' : 'Manual'}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(bid.placed_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No bids yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Bid Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Current Bid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-primary">
                ${(item.current_bid || item.starting_price).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                {item.bid_count || 0} bids · Min increment: ${item.bid_increment}
              </div>

              {!ended && isAuthenticated && user?.role !== 'admin' && user?.role !== 'rep' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bid">Your Bid ($)</Label>
                    <Input id="bid" type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} min={(item.current_bid || item.starting_price) + item.bid_increment} step={item.bid_increment} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-bid">Enable Auto-Bid</Label>
                    <Switch id="auto-bid" checked={autoBid} onCheckedChange={setAutoBid} />
                  </div>
                  {autoBid && (
                    <div className="space-y-2">
                      <Label htmlFor="limit">Max Auto-Bid Limit ($)</Label>
                      <Input id="limit" type="number" value={autoBidLimit} onChange={e => setAutoBidLimit(e.target.value)} placeholder="Your secret maximum" />
                    </div>
                  )}
                  <Button className="w-full" size="lg" onClick={handleBid}>
                    Place Bid
                  </Button>
                </div>
              )}

              {!isAuthenticated && !ended && (
                <p className="mt-4 text-sm text-muted-foreground text-center">Sign in to place a bid</p>
              )}

              {ended && (
                <div className="mt-4 rounded-lg bg-muted p-4 text-center">
                  <p className="font-semibold">This auction has ended</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
