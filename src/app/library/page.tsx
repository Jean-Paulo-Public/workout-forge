"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, Trash2, Edit3, Play, Eye, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function WorkoutLibraryPage() {
  const { workouts, deleteWorkout, addSession, getWorkoutById } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const handleDeleteWorkout = (workoutId: string) => {
    deleteWorkout(workoutId);
    toast({
      title: "Workout Deleted",
      description: "The workout has been removed from your library.",
    });
  };

  const handleStartWorkout = (workout: Workout) => {
    addSession({
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      notes: `Started ${workout.name}.`
    });
    toast({
      title: "Workout Started!",
      description: `${workout.name} has been logged as started. Track your progress!`,
    });
    // Potentially navigate to a live workout tracking page in future
    router.push('/progress');
  };
  
  const handleScheduleWorkout = (workout: Workout) => {
    router.push(`/scheduler?workoutId=${workout.id}&workoutName=${encodeURIComponent(workout.name)}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Workout Library</h1>
          <Link href="/builder">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Workout
            </Button>
          </Link>
        </div>

        {workouts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline">Your Library is Empty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create your first workout plan using the Workout Builder.
              </p>
              <Link href="/builder">
                <Button variant="outline">Go to Builder</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <Card key={workout.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline">{workout.name}</CardTitle>
                  {workout.description && (
                    <CardDescription>{workout.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <h4 className="font-medium mb-1 text-sm">Exercises:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {workout.exercises.slice(0,5).map((exercise) => (
                      <li key={exercise.id}>{exercise.name} ({exercise.sets} sets x {exercise.reps})</li>
                    ))}
                    {workout.exercises.length > 5 && <li>...and {workout.exercises.length - 5} more</li>}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelectedWorkout(workout)}>
                    <Eye className="mr-1 h-4 w-4" /> View
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleStartWorkout(workout)}>
                    <Play className="mr-1 h-4 w-4" /> Start
                  </Button>
                   <Button variant="secondary" size="sm" onClick={() => handleScheduleWorkout(workout)}>
                    <CalendarPlus className="mr-1 h-4 w-4" /> Schedule
                  </Button>
                  {/* Edit functionality would require a form similar to builder, pre-filled. For now, it's a placeholder concept. */}
                  {/* <Link href={`/builder?edit=${workout.id}`}>
                    <Button variant="outline" size="icon" title="Edit Workout">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </Link> */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" title="Delete Workout">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the workout "{workout.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteWorkout(workout.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedWorkout && (
        <AlertDialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">{selectedWorkout.name}</AlertDialogTitle>
              {selectedWorkout.description && (
                <AlertDialogDescription>{selectedWorkout.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 py-4">
              <h4 className="font-semibold text-md">Exercises:</h4>
              {selectedWorkout.exercises.map((ex, idx) => (
                <div key={ex.id} className="text-sm border-b pb-2">
                  <p className="font-medium">{idx + 1}. {ex.name}</p>
                  <p className="text-muted-foreground">Sets: {ex.sets}, Reps: {ex.reps}</p>
                  {ex.notes && <p className="text-xs text-muted-foreground italic">Notes: {ex.notes}</p>}
                </div>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedWorkout(null)}>Close</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleStartWorkout(selectedWorkout);
                setSelectedWorkout(null);
              }}>
                <Play className="mr-1 h-4 w-4" /> Start Workout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppLayout>
  );
}
