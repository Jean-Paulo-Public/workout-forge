"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Workout, WorkoutSession, ScheduledWorkout } from '@/lib/types';

interface AppContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (workoutId: string) => void;
  getWorkoutById: (workoutId: string) => Workout | undefined;

  sessions: WorkoutSession[];
  addSession: (session: Omit<WorkoutSession, 'id'>) => void;
  // More session actions can be added if needed

  scheduledWorkouts: ScheduledWorkout[];
  addScheduledWorkout: (scheduledWorkout: Omit<ScheduledWorkout, 'id'>) => void;
  updateScheduledWorkout: (scheduledWorkout: ScheduledWorkout) => void;
  deleteScheduledWorkout: (scheduledWorkoutId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => crypto.randomUUID();

export function AppProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load from localStorage if available
    const storedWorkouts = localStorage.getItem('workouts');
    if (storedWorkouts) {
      setWorkouts(JSON.parse(storedWorkouts));
    }
    const storedSessions = localStorage.getItem('sessions');
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
    const storedScheduledWorkouts = localStorage.getItem('scheduledWorkouts');
    if (storedScheduledWorkouts) {
      setScheduledWorkouts(JSON.parse(storedScheduledWorkouts));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('workouts', JSON.stringify(workouts));
    }
  }, [workouts, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sessions', JSON.stringify(sessions));
    }
  }, [sessions, isMounted]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('scheduledWorkouts', JSON.stringify(scheduledWorkouts));
    }
  }, [scheduledWorkouts, isMounted]);


  const addWorkout = (workoutData: Omit<Workout, 'id'>) => {
    const newWorkout = { ...workoutData, id: generateId() };
    setWorkouts((prev) => [...prev, newWorkout]);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === updatedWorkout.id ? updatedWorkout : w))
    );
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  };
  
  const getWorkoutById = (workoutId: string) => {
    return workouts.find(w => w.id === workoutId);
  };

  const addSession = (sessionData: Omit<WorkoutSession, 'id'>) => {
    const newSession = { ...sessionData, id: generateId() };
    setSessions((prev) => [...prev, newSession]);
  };

  const addScheduledWorkout = (scheduledWorkoutData: Omit<ScheduledWorkout, 'id'>) => {
    const newScheduledWorkout = { ...scheduledWorkoutData, id: generateId() };
    setScheduledWorkouts((prev) => [...prev, newScheduledWorkout]);
  };

  const updateScheduledWorkout = (updatedScheduledWorkout: ScheduledWorkout) => {
    setScheduledWorkouts((prev) =>
      prev.map((sw) => (sw.id === updatedScheduledWorkout.id ? updatedScheduledWorkout : sw))
    );
  };

  const deleteScheduledWorkout = (scheduledWorkoutId: string) => {
    setScheduledWorkouts((prev) => prev.filter((sw) => sw.id !== scheduledWorkoutId));
  };

  const value = {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    sessions,
    addSession,
    scheduledWorkouts,
    addScheduledWorkout,
    updateScheduledWorkout,
    deleteScheduledWorkout,
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
