import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';

const typeColors: Record<string, string> = {
  outbid: 'bg-warning/10 text-warning',
  auto_limit_exceeded: 'bg-destructive/10 text-destructive',
  auction_won: 'bg-success/10 text-success',
  auction_closed: 'bg-muted text-muted-foreground',
  alert_match: 'bg-primary/10 text-primary',
  question_answered: 'bg-primary/10 text-primary',
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isAuthenticated) api.notifications.list().then(setNotifications);
  }, [isAuthenticated]);

  if (!isAuthenticated) return <div className="container py-16 text-center text-muted-foreground">Please sign in to view notifications.</div>;

  const markRead = async (id: number) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-7 w-7 text-primary" />
        <h1 className="font-heading text-3xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={n.is_read ? 'opacity-60' : ''}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`mt-1 rounded-full p-2 ${typeColors[n.type] || 'bg-muted'}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs capitalize">{n.type.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{n.message}</p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="icon" onClick={() => markRead(n.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
