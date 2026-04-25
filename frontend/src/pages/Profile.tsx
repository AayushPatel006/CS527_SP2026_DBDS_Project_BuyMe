import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <div className="container py-16 text-center text-muted-foreground">Please sign in.</div>;

  return (
    <div className="container max-w-lg py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">My Profile</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>{user.username}</CardTitle>
              <Badge className="mt-1 capitalize">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
