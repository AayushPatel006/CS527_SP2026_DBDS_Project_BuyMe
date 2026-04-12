import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types';
import { MessageSquare, CheckCircle } from 'lucide-react';

export default function RepPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    api.questions.list().then(setQuestions);
  }, []);

  if (user?.role !== 'rep' && user?.role !== 'admin') return <div className="container py-16 text-center text-muted-foreground">Access denied</div>;

  const unanswered = questions.filter(q => !q.answer_text);
  const answered = questions.filter(q => !!q.answer_text);

  const handleAnswer = async (qId: number) => {
    const text = answers[qId];
    if (!text?.trim()) return;
    try {
      const updated = await api.questions.answer(qId, text);
      setQuestions(prev => prev.map(q => q.id === qId ? updated : q));
      toast({ title: 'Answer submitted' });
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <h1 className="font-heading text-3xl font-bold">Customer Rep Panel</h1>
      </div>

      <Tabs defaultValue="unanswered">
        <TabsList className="mb-6">
          <TabsTrigger value="unanswered">Unanswered ({unanswered.length})</TabsTrigger>
          <TabsTrigger value="answered">Answered ({answered.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unanswered">
          {unanswered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
              <p>All questions have been answered!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unanswered.map(q => (
                <Card key={q.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">From: {q.user_username}</CardTitle>
                      <Badge variant="outline">{new Date(q.asked_at).toLocaleDateString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="bg-muted p-3 rounded-lg">{q.question_text}</p>
                    <Textarea
                      placeholder="Type your answer..."
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                    <Button onClick={() => handleAnswer(q.id)} disabled={!answers[q.id]?.trim()}>Submit Answer</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="answered">
          <Table>
            <TableHeader>
              <TableRow><TableHead>User</TableHead><TableHead>Question</TableHead><TableHead>Answer</TableHead><TableHead>Answered By</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {answered.map(q => (
                <TableRow key={q.id}>
                  <TableCell>{q.user_username}</TableCell>
                  <TableCell className="max-w-xs truncate">{q.question_text}</TableCell>
                  <TableCell className="max-w-xs truncate">{q.answer_text}</TableCell>
                  <TableCell>{q.rep_username}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
