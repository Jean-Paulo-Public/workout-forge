"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { AiWorkoutSuggester } from '@/components/ai-workout-suggester';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarClock, LibraryBig, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { scheduledWorkouts, workouts, sessions } = useAppContext();

  const upcomingWorkout = scheduledWorkouts
    .filter(sw => new Date(sw.dateTime) >= new Date())
    .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Welcome to Workout Forge!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ready to build, track, and optimize your fitness journey? Let's get started.
              </p>
              <Link href="/builder">
                <Button>Create New Workout</Button>
              </Link>
            </CardContent>
          </Card>

          {upcomingWorkout && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                        <CalendarClock className="text-primary" />
                        Upcoming Workout
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{upcomingWorkout.workoutName}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(upcomingWorkout.dateTime), "PPPp")}
                    </p>
                    <Link href="/scheduler" className="mt-2">
                        <Button variant="outline" size="sm">View Schedule</Button>
                    </Link>
                </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <LibraryBig className="text-primary" />
                    Workout Library
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-2">You have {workouts.length} workout(s) saved.</p>
                <Link href="/library">
                    <Button variant="outline" size="sm">Go to Library</Button>
                </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <TrendingUp className="text-primary" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-2">You have completed {sessions.length} session(s).</p>
                 <Link href="/progress">
                    <Button variant="outline" size="sm">View Progress</Button>
                </Link>
            </CardContent>
          </Card>
        </div>

        <AiWorkoutSuggester />

      </div>
    </AppLayout>
  );
}
