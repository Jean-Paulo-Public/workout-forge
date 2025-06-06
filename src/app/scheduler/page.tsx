"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';
import type { ScheduledWorkout, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, setHours, setMinutes, setSeconds, parseISO } from 'date-fns';
import { CalendarClock, Trash2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { useSearchParams } from 'next/navigation';


export default function SchedulerPage() {
  const { workouts, scheduledWorkouts, addScheduledWorkout, deleteScheduledWorkout } = useAppContext();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("08:00"); // HH:mm format
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | undefined>(searchParams.get('workoutId') || undefined);
  
  useEffect(() => {
    const workoutId = searchParams.get('workoutId');
    if (workoutId) {
      setSelectedWorkoutId(workoutId);
    }
  }, [searchParams]);


  const handleScheduleWorkout = () => {
    if (!selectedDate || !selectedWorkoutId) {
      toast({
        title: "Missing Information",
        description: "Please select a date and a workout.",
        variant: "destructive",
      });
      return;
    }

    const workout = workouts.find(w => w.id === selectedWorkoutId);
    if (!workout) {
      toast({
        title: "Workout Not Found",
        description: "The selected workout could not be found.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = setSeconds(setMinutes(setHours(selectedDate, hours), minutes),0);

    addScheduledWorkout({
      workoutId: workout.id,
      workoutName: workout.name,
      dateTime: scheduledDateTime.toISOString(),
    });

    toast({
      title: "Workout Scheduled!",
      description: `${workout.name} scheduled for ${format(scheduledDateTime, "PPPp")}.`,
    });
    setSelectedWorkoutId(undefined); // Reset selected workout
  };

  const handleDeleteScheduled = (id: string) => {
    deleteScheduledWorkout(id);
    toast({
      title: "Schedule Removed",
      description: "The workout has been unscheduled.",
    });
  };

  const sortedScheduledWorkouts = [...scheduledWorkouts].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Workout Scheduler</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Schedule a New Workout</CardTitle>
            <CardDescription>Pick a workout, date, and time for your next session.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border self-start"
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
              />
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="workout-select" className="block text-sm font-medium mb-1">Select Workout</label>
                <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                  <SelectTrigger id="workout-select">
                    <SelectValue placeholder="Choose a workout" />
                  </SelectTrigger>
                  <SelectContent>
                    {workouts.length > 0 ? workouts.map((workout) => (
                      <SelectItem key={workout.id} value={workout.id}>
                        {workout.name}
                      </SelectItem>
                    )) : <SelectItem value="no-workouts" disabled>No workouts in library</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="time-select" className="block text-sm font-medium mb-1">Select Time</label>
                <Input 
                  id="time-select" 
                  type="time" 
                  value={selectedTime} 
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleScheduleWorkout} disabled={!selectedDate || !selectedWorkoutId || workouts.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Workout
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <CalendarClock className="text-primary" /> Upcoming Scheduled Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedScheduledWorkouts.length === 0 ? (
              <p className="text-muted-foreground">No workouts scheduled yet.</p>
            ) : (
              <ul className="space-y-3">
                {sortedScheduledWorkouts.map((sw) => (
                  <li key={sw.id} className="flex justify-between items-center p-3 border rounded-md bg-background hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-semibold">{sw.workoutName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(sw.dateTime), "EEE, MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Remove from schedule">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{sw.workoutName}" from your schedule. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteScheduled(sw.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
