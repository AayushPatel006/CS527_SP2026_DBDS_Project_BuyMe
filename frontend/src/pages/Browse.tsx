import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Item, Category } from '@/types';
import ItemCard from '@/components/ItemCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<string>('ending-soon');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.items.list({
      search: search || undefined,
      category_id: categoryFilter !== 'all' ? Number(categoryFilter) : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }).then(data => {
      let sorted = [...data];
      switch (sortBy) {
        case 'ending-soon': sorted.sort((a, b) => new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime()); break;
        case 'price-low': sorted.sort((a, b) => (a.current_bid || a.starting_price) - (b.current_bid || b.starting_price)); break;
        case 'price-high': sorted.sort((a, b) => (b.current_bid || b.starting_price) - (a.current_bid || a.starting_price)); break;
        case 'most-bids': sorted.sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0)); break;
      }
      setItems(sorted);
      setLoading(false);
    });
  }, [search, categoryFilter, statusFilter, sortBy]);

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Browse Auctions</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, make, model..." className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ending-soon">Ending Soon</SelectItem>
            <SelectItem value="price-low">Price: Low → High</SelectItem>
            <SelectItem value="price-high">Price: High → Low</SelectItem>
            <SelectItem value="most-bids">Most Bids</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No auctions found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
