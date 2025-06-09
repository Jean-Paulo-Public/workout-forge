
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Workout, WorkoutSession, UserSettings, Exercise, SessionExercisePerformance } from '@/lib/types';

interface AppContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (workoutId: string) => void;
  getWorkoutById: (workoutId: string) => Workout | undefined;
  updateWorkoutsOrder: (newOrder: Workout[]) => void;

  sessions: WorkoutSession[];
  addSession: (sessionData: Pick<WorkoutSession, 'workoutId' | 'workoutName' | 'date'>) => void;
  updateSessionExercisePerformance: (sessionId: string, exerciseId: string, updates: Partial<SessionExercisePerformance>) => void;
  markGlobalWarmupAsCompleted: (sessionId: string) => void;
  undoGlobalWarmup: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  hasActiveSession: (workoutId: string) => boolean;
  getLastUsedWeightForExercise: (workoutId: string, exerciseId: string) => string | undefined;


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
        id: ex.id || generateId(), 
      })),
    };
    setWorkouts((prev) => [...prev, newWorkout]);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === updatedWorkout.id ? {
        ...updatedWorkout,
        repeatFrequencyDays: updatedWorkout.repeatFrequencyDays || undefined,
        deadline: updatedWorkout.deadline || undefined,
        hasGlobalWarmup: updatedWorkout.hasGlobalWarmup !== undefined ? updatedWorkout.hasGlobalWarmup : true,
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

  const updateWorkoutsOrder = (newOrder: Workout[]) => {
    setWorkouts(newOrder);
  };

  const hasActiveSession = (workoutId: string): boolean => {
    return sessions.some(s => s.workoutId === workoutId && !s.isCompleted);
  };

  const addSession = (sessionData: Pick<WorkoutSession, 'workoutId' | 'workoutName' | 'date'>) => {
    const workout = getWorkoutById(sessionData.workoutId);
    if (!workout) {
      console.error("Workout not found for session:", sessionData.workoutId);
      return;
    }

    const initialExercisePerformances: SessionExercisePerformance[] = workout.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      plannedWeight: ex.weight || "0",
      weightUsed: ex.weight || "0", 
      hasWarmup: ex.hasWarmup || false,
      isWarmupCompleted: false,
      isExerciseCompleted: false,
    }));

    const newSession: WorkoutSession = {
      ...sessionData,
      id: generateId(),
      isCompleted: false,
      notes: `Sessão de ${sessionData.workoutName} iniciada.`,
      exercisePerformances: initialExercisePerformances,
      isGlobalWarmupCompleted: workout.hasGlobalWarmup ? false : undefined, 
    };
    setSessions((prev) => [newSession, ...prev]);
  };
  
  const updateSessionExercisePerformance = useCallback((sessionId: string, exerciseId: string, updates: Partial<SessionExercisePerformance>) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            exercisePerformances: session.exercisePerformances.map(perf => {
              if (perf.exerciseId === exerciseId) {
                return { ...perf, ...updates };
              }
              return perf;
            }),
          };
        }
        return session;
      })
    );
  }, []);

  const markGlobalWarmupAsCompleted = useCallback((sessionId: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            isGlobalWarmupCompleted: true,
            notes: `${session.notes || ''} Aquecimento geral concluído.`,
          };
        }
        return session;
      })
    );
  }, []);

  const undoGlobalWarmup = useCallback((sessionId: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            isGlobalWarmupCompleted: false,
            notes: (session.notes || '').replace(' Aquecimento geral concluído.', '') + ' Aquecimento geral desfeito.',
          };
        }
        return session;
      })
    );
  }, []);

  const completeSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              isCompleted: true,
              notes: `${session.notes || ''} Treino finalizado e performance registrada.`,
            }
          : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };
  
  const getLastUsedWeightForExercise = useCallback((workoutId: string, exerciseId: string): string | undefined => {
    const relevantSessions = sessions
      .filter(s => s.workoutId === workoutId && s.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const session of relevantSessions) {
      const performance = session.exercisePerformances.find(p => p.exerciseId === exerciseId);
      if (performance && performance.weightUsed !== undefined) {
        return performance.weightUsed;
      }
    }
    return undefined;
  }, [sessions]);


  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const value = {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    updateWorkoutsOrder,
    sessions,
    addSession,
    updateSessionExercisePerformance,
    markGlobalWarmupAsCompleted,
    undoGlobalWarmup,
    completeSession,
    deleteSession,
    hasActiveSession,
    getLastUsedWeightForExercise,
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

    