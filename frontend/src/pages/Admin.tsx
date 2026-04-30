import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { User, SalesReport } from '@/types';
import { Shield, Users, BarChart3, DollarSign, Trophy } from 'lucide-react';

type AdminStats = {
  total_users: number;
  active_auctions: number;
  total_items: number;
  total_bids: number;
  sold_items: number;
};

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [repUsername, setRepUsername] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [creatingRep, setCreatingRep] = useState(false);

  useEffect(() => {
    api.admin.listUsers().then(setUsers).catch(() => toast({ title: 'Failed to load users', variant: 'destructive' }));
    api.admin.getSalesReport().then(setReport).catch(() => toast({ title: 'Failed to load report', variant: 'destructive' }));
    api.admin.getStats().then(setStats).catch(() => toast({ title: 'Failed to load stats', variant: 'destructive' }));
  }, []);

  if (user?.role !== 'admin') return <div className="container py-16 text-center text-muted-foreground">Access denied</div>;

  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRep(true);
    try {
      const rep = await api.admin.createRep(repUsername, repEmail, repPassword);
      setUsers(prev => [rep, ...prev]);
      setRepUsername(''); setRepEmail(''); setRepPassword('');
      toast({ title: 'Representative created', description: `Account for ${rep.username} created.` });
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Failed to create representative';
      toast({ title: 'Failed', description, variant: 'destructive' });
    } finally {
      setCreatingRep(false);
    }
  };

  const reps = users.filter(u => u.role === 'rep');

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          {[
            { label: 'Total Users', value: stats.total_users },
            { label: 'Active Auctions', value: stats.active_auctions },
            { label: 'Total Bids', value: stats.total_bids },
            { label: 'Sold Items', value: stats.sold_items },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-heading text-3xl font-bold">{stat.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="reports">
        <TabsList className="mb-6">
          <TabsTrigger value="reports"><BarChart3 className="h-4 w-4 mr-1" />Sales Reports</TabsTrigger>
          <TabsTrigger value="reps"><Users className="h-4 w-4 mr-1" />Manage Reps</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          {report && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="font-heading text-3xl font-bold">${report.total_earnings.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Trophy className="h-8 w-8 mx-auto text-accent mb-2" />
                    <p className="text-sm text-muted-foreground">Top Buyer</p>
                    <p className="font-heading text-xl font-bold">{report.best_buyers[0]?.username || 'No sales yet'}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.best_buyers[0] ? `$${report.best_buyers[0].total_spent.toLocaleString()}` : 'No completed auctions'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto text-success mb-2" />
                    <p className="text-sm text-muted-foreground">Items Sold</p>
                    <p className="font-heading text-3xl font-bold">{report.best_selling_items.reduce((sum, item) => sum + item.sold_count, 0)}</p>
                  </CardContent>
                </Card>
              </div>

              {report.total_earnings === 0 && report.best_selling_items.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No completed auctions yet. Once items are sold, the report tables will populate automatically.
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Earnings by Category</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Earnings</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {report.earnings_by_type.length > 0 ? report.earnings_by_type.map(e => (
                        <TableRow key={e.category_name}><TableCell>{e.category_name}</TableCell><TableCell className="font-semibold">${e.earnings.toLocaleString()}</TableCell></TableRow>
                      )) : <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No sales data yet</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Earnings by User</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Total Spent</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {report.earnings_by_user.length > 0 ? report.earnings_by_user.map(e => (
                        <TableRow key={e.username}><TableCell>{e.username}</TableCell><TableCell className="font-semibold">${e.earnings.toLocaleString()}</TableCell></TableRow>
                      )) : <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No completed auctions yet</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reps">
          <Card>
            <CardHeader><CardTitle>Create Customer Representative</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRep} className="space-y-4 max-w-md">
                <div className="space-y-2"><Label>Username</Label><Input value={repUsername} onChange={e => setRepUsername(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={repEmail} onChange={e => setRepEmail(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={repPassword} onChange={e => setRepPassword(e.target.value)} required /></div>
                <Button type="submit" disabled={creatingRep}>{creatingRep ? 'Creating...' : 'Create Rep Account'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader><CardTitle>Existing Representatives</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {reps.length > 0 ? reps.map(rep => (
                    <TableRow key={rep.id}>
                      <TableCell className="font-medium">{rep.username}</TableCell>
                      <TableCell>{rep.email}</TableCell>
                      <TableCell>{rep.is_active ? '✅ Active' : '❌ Inactive'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No representatives yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>{u.is_active ? '✅ Active' : '❌ Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
