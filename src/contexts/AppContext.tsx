
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Workout, WorkoutSession, UserSettings, Exercise } from '@/lib/types';

interface AppContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (workoutId: string) => void;
  getWorkoutById: (workoutId: string) => Workout | undefined;

  sessions: WorkoutSession[];
  addSession: (session: Omit<WorkoutSession, 'id' | 'isCompleted' | 'warmupCompleted' | 'notes'>) => void;
  completeSession: (sessionId: string) => void;
  markWarmupAsCompleted: (sessionId: string, firstExerciseName?: string) => void;
  hasActiveSession: (workoutId: string) => boolean;

  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => crypto.randomUUID();

const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultSets: 3,
  defaultReps: '8',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [userSettings, setUserSettingsState] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedWorkouts = localStorage.getItem('workouts');
    if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));

    const storedSessions = localStorage.getItem('sessions');
    if (storedSessions) setSessions(JSON.parse(storedSessions));

    const storedUserSettings = localStorage.getItem('userSettings');
    if (storedUserSettings) {
      setUserSettingsState(JSON.parse(storedUserSettings));
    } else {
      setUserSettingsState(DEFAULT_USER_SETTINGS);
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('userSettings', JSON.stringify(userSettings));
  }, [userSettings, isMounted]);

  const addWorkout = (workoutData: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: generateId(),
      exercises: workoutData.exercises.map(ex => ({
        ...ex,
        id: generateId(),
        hasWarmup: ex.hasWarmup || false,
      })),
      repeatFrequencyDays: workoutData.repeatFrequencyDays || undefined,
      deadline: workoutData.deadline || undefined,
    };
    setWorkouts((prev) => [...prev, newWorkout]);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === updatedWorkout.id ? {
        ...updatedWorkout,
        repeatFrequencyDays: updatedWorkout.repeatFrequencyDays || undefined,
        deadline: updatedWorkout.deadline || undefined,
        exercises: updatedWorkout.exercises.map(ex => ({
          ...ex,
          id: ex.id || generateId(),
          hasWarmup: ex.hasWarmup || false,
        }))
      } : w))
    );
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  };

  const getWorkoutById = (workoutId: string): Workout | undefined => {
    return workouts.find(w => w.id === workoutId);
  };

  const hasActiveSession = (workoutId: string): boolean => {
    return sessions.some(s => s.workoutId === workoutId && !s.isCompleted);
  };

  const addSession = (sessionData: Omit<WorkoutSession, 'id' | 'isCompleted' | 'warmupCompleted' | 'notes'>) => {
    const workout = getWorkoutById(sessionData.workoutId);
    let sessionNotes = `Iniciou ${sessionData.workoutName}.`;
    let initialWarmupCompleted = false;

    if (workout && workout.exercises.length > 0 && workout.exercises[0].hasWarmup) {
      sessionNotes = `Iniciando aquecimento para ${workout.exercises[0].name}. Treino: ${sessionData.workoutName}.`;
      initialWarmupCompleted = false; // Explicitly false as warm-up needs to be completed
    } else {
      // If no warm-up for the first exercise, or no exercises, consider warm-up phase "completed" or not applicable.
      initialWarmupCompleted = true;
    }

    const newSession: WorkoutSession = {
      ...sessionData,
      id: generateId(),
      isCompleted: false,
      notes: sessionNotes,
      warmupCompleted: initialWarmupCompleted,
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const markWarmupAsCompleted = (sessionId: string, firstExerciseName?: string) => {
    setSessions(prev =>
      prev.map(session => {
        if (session.id === sessionId) {
          let updatedNotes = session.notes;
          if (firstExerciseName) {
            updatedNotes = `Aquecimento para ${firstExerciseName} concluído. Iniciando treino principal de ${session.workoutName}.`;
          } else {
            updatedNotes = `Aquecimento concluído. Iniciando treino principal de ${session.workoutName}.`;
          }
          return { ...session, warmupCompleted: true, notes: updatedNotes };
        }
        return session;
      })
    );
  };

  const completeSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, isCompleted: true, notes: `${session.notes || ''} Treino finalizado.` } : session
      )
    );
  };

  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const value = {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    sessions,
    addSession,
    completeSession,
    markWarmupAsCompleted,
    hasActiveSession,
    userSettings,
    updateUserSettings,
  };

  if (!isMounted) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
