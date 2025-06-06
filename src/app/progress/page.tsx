"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, History, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Placeholder for chart component
const PlaceholderChart = () => (
  <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
    <BarChart3 className="h-16 w-16 text-muted-foreground" />
    <p className="ml-2 text-muted-foreground">Chart Coming Soon</p>
  </div>
);


export default function ProgressTrackingPage() {
  const { sessions } = useAppContext();

  const sortedSessions = [...sessions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Progress Tracking</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Workout Trends
              </CardTitle>
              <CardDescription>Visualize your workout frequency and volume over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceholderChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <History className="text-primary" />
                Workout History
              </CardTitle>
              <CardDescription>Review your completed workout sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <p className="text-muted-foreground">No workout sessions logged yet. Start a workout from your library!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-3">
                    {sortedSessions.map(session => (
                      <li key={session.id} className="p-3 border rounded-md bg-background hover:bg-secondary/50 transition-colors">
                        <p className="font-semibold">{session.workoutName}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(session.date), 'PPP p')}</p>
                        {session.notes && <p className="text-xs italic mt-1 text-muted-foreground">{session.notes}</p>}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* More detailed stats or PR tracking could go here */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">More Stats</CardTitle>
            <CardDescription>Detailed exercise performance and personal records (PRs) will be available here in future updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Stay tuned for more advanced progress tracking features!</p>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
