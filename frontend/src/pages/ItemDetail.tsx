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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    Promise.all([api.items.get(Number(id)), api.bids.listByItem(Number(id))])
      .then(([item, bids]) => {
        setItem(item);
        setBids(bids);
        setAutoBid(false);
        setAutoBidLimit('');
        setBidAmount(String((item.current_bid || item.starting_price) + item.bid_increment));
      })
      .catch(() => {
        toast({
          title: 'Failed to load item',
          description: 'Please check backend API and try again.',
          variant: 'destructive',
        });
        setItem(null);
        setBids([]);
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleBid = async () => {
    if (!item) return;

    if (user?.id === item.seller_id) {
      toast({
        title: 'Cannot bid',
        description: 'You cannot bid on your own listing.',
        variant: 'destructive',
      });
      return;
    }

    const amount = Number(bidAmount);
    const parsedAutoBidLimit = autoBid ? Number(autoBidLimit) : undefined;
    const minBid = (item.current_bid || item.starting_price) + item.bid_increment;

    if (amount < minBid) {
      toast({
        title: 'Bid too low',
        description: `Minimum bid is $${minBid.toLocaleString()}`,
        variant: 'destructive',
      });
      return;
    }

    if (autoBid && (!parsedAutoBidLimit || Number.isNaN(parsedAutoBidLimit) || parsedAutoBidLimit < amount)) {
      toast({
        title: 'Invalid auto-bid limit',
        description: 'Set a maximum that is at least your current bid amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const bid = await api.bids.place(item.id, amount, parsedAutoBidLimit, autoBid);
      setBids(prev => [bid, ...prev]);
      toast({
        title: 'Bid placed!',
        description: `Your bid of $${amount.toLocaleString()} was placed successfully.`,
      });
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Unknown error while placing bid.';
      toast({ title: 'Bid failed', description, variant: 'destructive' });
    }
  };

  const handleAskQuestion = async () => {
    if (!item) return;

    const text = questionText.trim();

    if (!text) {
      toast({
        title: 'Enter a question',
        description: 'Please type your question before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingQuestion(true);

    try {
      await api.questions.ask(text, item.id);
      setQuestionText('');
      toast({
        title: 'Question sent',
        description: 'A representative will review and respond soon.',
      });
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Failed to submit question.';
      toast({ title: 'Could not send question', description, variant: 'destructive' });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading) {
    return <div className="container py-16 text-center text-muted-foreground">Loading...</div>;
  }

  if (!item) {
    return <div className="container py-16 text-center text-muted-foreground">Item not found</div>;
  }

  const ended = item.status !== 'active' || new Date(item.closes_at) <= new Date();

  return (
    <div className="container py-10 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image & Details */}
        <div className="lg:col-span-2 space-y-7">
          <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 shadow-[0_30px_90px_rgba(29,78,216,0.16)] backdrop-blur-2xl">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-blue-950/35 via-transparent to-white/10" />

            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          <div className="premium-card space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                {item.category_name}
              </Badge>
              <Badge variant={ended ? 'secondary' : 'outline'} className="rounded-full px-3 py-1">
                {ended ? 'Ended' : 'Active'}
              </Badge>
            </div>

            <h1 className="font-heading text-3xl lg:text-4xl font-extrabold tracking-tight text-blue-950">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-900/60">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {item.seller_username}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {timeLeft(item.closes_at)}
              </span>
            </div>
          </div>

          <div className="premium-section">
            <h2 className="font-heading text-xl font-bold mb-3 text-blue-950">Description</h2>
            <p className="text-blue-900/65 leading-relaxed">{item.description}</p>
          </div>

          {item.field_values && Object.keys(item.field_values).length > 0 && (
            <div className="premium-section">
              <h2 className="font-heading text-xl font-bold mb-4 text-blue-950">Vehicle Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(item.field_values).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl"
                  >
                    <p className="text-xs font-medium text-blue-900/50">{k}</p>
                    <p className="font-semibold text-blue-950">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bid History */}
          <div className="premium-section overflow-hidden">
            <h2 className="font-heading text-xl font-bold mb-4 text-blue-950">
              Bid History ({bids.length})
            </h2>

            {bids.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/50 backdrop-blur-xl">
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
                      <TableRow key={bid.id} className="hover:bg-blue-50/60">
                        <TableCell>{bid.bidder_username}</TableCell>
                        <TableCell className="font-semibold text-blue-700">
                          ${bid.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">
                            {bid.is_auto ? 'Auto' : 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(bid.placed_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-blue-900/55">No bids yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Bid Panel */}
        <div className="space-y-5">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-950">
                <DollarSign className="h-5 w-5 text-primary" />
                Current Bid
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="font-heading text-5xl font-extrabold tracking-tight text-primary">
                ${(item.current_bid || item.starting_price).toLocaleString()}
              </p>

              <div className="flex items-center gap-1 mt-2 text-sm text-blue-900/60">
                <TrendingUp className="h-4 w-4" />
                {item.bid_count || 0} bids · Min increment: ${item.bid_increment}
              </div>

              {!ended && isAuthenticated && user?.role !== 'admin' && user?.role !== 'rep' && user?.id !== item.seller_id && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bid">Your Bid ($)</Label>
                    <Input
                      id="bid"
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      min={(item.current_bid || item.starting_price) + item.bid_increment}
                      step={item.bid_increment}
                      className="premium-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-bid">Enable Auto-Bid</Label>
                    <Switch
                      id="auto-bid"
                      checked={autoBid}
                      onCheckedChange={setAutoBid}
                      className="shadow-none transition-none data-[state=checked]:bg-blue-800 data-[state=unchecked]:bg-gray-300 [&>span]:bg-white [&>span]:transition-none"
                    />
                  </div>

                  {autoBid && (
                    <div className="space-y-2">
                      <Label htmlFor="limit">Max Auto-Bid Limit ($)</Label>
                      <Input
                        id="limit"
                        type="number"
                        value={autoBidLimit}
                        onChange={e => setAutoBidLimit(e.target.value)}
                        placeholder="Your secret maximum"
                      />
                    </div>
                  )}

                  <Button className="w-full" size="lg" onClick={handleBid}>
                    Place Bid
                  </Button>
                </div>
              )}

              {!isAuthenticated && !ended && (
                <p className="mt-4 text-sm text-blue-900/55 text-center">Sign in to place a bid</p>
              )}

              {isAuthenticated && !ended && user?.id === item.seller_id && (
                <p className="mt-4 text-sm text-blue-900/55 text-center">You cannot bid on your own listing.</p>
              )}

              {ended && (
                <div className="mt-4 rounded-2xl border border-white/60 bg-white/55 p-4 text-center backdrop-blur-xl">
                  <p className="font-semibold text-blue-950">This auction has ended</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isAuthenticated && (user?.role === 'buyer' || user?.role === 'seller') && (
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-blue-950">Ask a Representative</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-blue-900/60">
                  Have a question about this auction? Send it to customer support.
                </p>

                <Textarea
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Ask your question..."
                  rows={4}
                  className="premium-input"
                />

                <Button
                  className="w-full glass-button"
                  onClick={handleAskQuestion}
                  disabled={submittingQuestion || !questionText.trim()}
                >
                  {submittingQuestion ? 'Sending...' : 'Send Question'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}