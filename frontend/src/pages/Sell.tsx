import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Category, CategoryField } from '@/types';

export default function SellPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<CategoryField[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [bidIncrement, setBidIncrement] = useState('1');
  const [closesAt, setClosesAt] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    if (categoryId) {
      api.categories.getFields(Number(categoryId)).then(setFields);
    }
  }, [categoryId]);

  const leafCategories = categories.filter(c => c.level === 'leaf');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.items.create({
        seller_id: user!.id,
        category_id: Number(categoryId),
        title, description,
        starting_price: Number(startingPrice),
        reserve_price: reservePrice ? Number(reservePrice) : undefined,
        bid_increment: Number(bidIncrement),
        closes_at: new Date(closesAt).toISOString(),
        field_values: fieldValues,
      });
      toast({ title: 'Auction created!', description: 'Your item has been listed.' });
      navigate('/browse');
    } catch {
      toast({ title: 'Failed to create auction', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Create Auction</h1>
      <Card>
        <CardHeader><CardTitle>Item Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {leafCategories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 2022 Toyota Camry SE" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starting Price ($)</Label>
                <Input type="number" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} required min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Reserve Price ($) <span className="text-muted-foreground text-xs">(optional, hidden)</span></Label>
                <Input type="number" value={reservePrice} onChange={e => setReservePrice(e.target.value)} min="0" step="0.01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bid Increment ($)</Label>
                <Input type="number" value={bidIncrement} onChange={e => setBidIncrement(e.target.value)} required min="0.01" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Closes At</Label>
                <Input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} required />
              </div>
            </div>

            {fields.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-heading font-semibold">Category-Specific Fields</h3>
                {fields.map(f => (
                  <div key={f.id} className="space-y-1">
                    <Label>{f.field_name} {f.is_required && <span className="text-destructive">*</span>}</Label>
                    <Input
                      type={f.field_type === 'number' ? 'number' : 'text'}
                      value={fieldValues[f.field_name] || ''}
                      onChange={e => setFieldValues(prev => ({ ...prev, [f.field_name]: e.target.value }))}
                      required={f.is_required}
                    />
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
