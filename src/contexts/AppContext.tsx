
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Workout, WorkoutSession, UserSettings, Exercise, SessionExercisePerformance } from '@/lib/types';
import { parseISO, isWithinInterval } from 'date-fns';


interface AppContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (workoutId: string) => void;
  getWorkoutById: (workoutId: string) => Workout | undefined;
  updateWorkoutsOrder: (newOrder: Workout[]) => void;

  sessions: WorkoutSession[];
  addSession: (sessionData: Pick<WorkoutSession, 'workoutId' | 'workoutName' | 'date'>) => void;
  updateSessionExercisePerformance: (sessionId: string, exerciseId: string, updates: Partial<SessionExercisePerformance> & { logNewRestTime?: number }) => void;
  markGlobalWarmupAsCompleted: (sessionId: string) => void;
  undoGlobalWarmup: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  getSessionById: (sessionId: string) => WorkoutSession | undefined;
  hasActiveSession: (workoutId: string) => boolean;
  getLastUsedWeightForExercise: (workoutId: string, exerciseId: string) => string | undefined;
  getAverageRestTimeForExercise: (exerciseId: string, lastNDays?: number) => number | null;


  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => crypto.randomUUID();

const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultSets: 3,
  defaultReps: '8',
  defaultRestAlarmSeconds: 180, 
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
      setUserSettingsState(prev => ({ ...DEFAULT_USER_SETTINGS, ...JSON.parse(storedUserSettings) }));
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
      daysForDeadline: workoutData.daysForDeadline || undefined,
      repeatFrequencyDays: workoutData.repeatFrequencyDays || undefined,
    };
    setWorkouts((prev) => [...prev, newWorkout]);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    const fullyUpdatedWorkout: Workout = {
      ...updatedWorkout,
      daysForDeadline: updatedWorkout.daysForDeadline || undefined,
      repeatFrequencyDays: updatedWorkout.repeatFrequencyDays || undefined,
      deadline: updatedWorkout.deadline || undefined,
      hasGlobalWarmup: updatedWorkout.hasGlobalWarmup !== undefined ? updatedWorkout.hasGlobalWarmup : true,
      exercises: updatedWorkout.exercises.map(ex => ({
        ...ex,
        id: ex.id || generateId(),
        hasWarmup: ex.hasWarmup || false,
      }))
    };

    setWorkouts((prevWorkouts) =>
      prevWorkouts.map((w) => (w.id === fullyUpdatedWorkout.id ? fullyUpdatedWorkout : w))
    );

    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.workoutId === fullyUpdatedWorkout.id && !session.isCompleted) {
          const newExercisePerformances: SessionExercisePerformance[] = fullyUpdatedWorkout.exercises.map(exerciseFromWorkout => {
            const existingPerf = session.exercisePerformances.find(p => p.exerciseId === exerciseFromWorkout.id || p.originalExerciseId === exerciseFromWorkout.id);
            
            if (existingPerf) {
              // If it's a substitution, we don't want to overwrite its current state with the new workout plan's exercise,
              // unless the original exercise it substituted was removed.
              // For now, we mainly update name/plannedWeight if it's NOT a substitution, or if the originalId matches
              if (!existingPerf.isSubstitution || existingPerf.originalExerciseId === exerciseFromWorkout.id) {
                return { 
                  ...existingPerf,
                  // Update exerciseName and plannedWeight only if it's not a substitution OR if it's a substitution
                  // and the original exercise (that was substituted) details are being updated from the workout plan.
                  // This logic might need refinement depending on how substitutions are handled if the *original* exercise in the plan changes.
                  // For now, keep it simple: update details if it's the direct exercise or the original of a substitution.
                  exerciseName: existingPerf.isSubstitution ? existingPerf.exerciseName : exerciseFromWorkout.name, 
                  plannedWeight: existingPerf.isSubstitution ? existingPerf.plannedWeight : (exerciseFromWorkout.weight || "0"),
                  hasWarmup: existingPerf.isSubstitution ? existingPerf.hasWarmup : (exerciseFromWorkout.hasWarmup || false),
                  // Keep originalExerciseId and originalExerciseName if it was a substitution.
                };
              }
              return existingPerf; // Keep substitution as is if its *original* wasn't the one directly modified.
            } else { 
              // New exercise added to the workout plan, create a new performance entry for it.
              return {
                exerciseId: exerciseFromWorkout.id,
                exerciseName: exerciseFromWorkout.name,
                plannedWeight: exerciseFromWorkout.weight || "0",
                weightUsed: exerciseFromWorkout.weight || "0", // Default to planned or "0"
                hasWarmup: exerciseFromWorkout.hasWarmup || false,
                isWarmupCompleted: false,
                isExerciseCompleted: false,
                restTimes: [],
                isSubstitution: false, // New exercises in the plan are not substitutions by default.
                originalExerciseId: undefined,
                originalExerciseName: undefined,
              };
            }
          }).filter(perf => 
            // Keep performance if it's for an exercise still in the workout OR if it's a substitution.
            // Substitutions are kept because they represent user action during the session.
            perf.isSubstitution || fullyUpdatedWorkout.exercises.some(ex => ex.id === perf.exerciseId)
          ); 

          return { ...session, workoutName: fullyUpdatedWorkout.name, exercisePerformances: newExercisePerformances };
        }
        return session;
      })
    );
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    // Optionally: delete associated sessions or mark them as archived/orphaned
    // setSessions(prev => prev.filter(s => s.workoutId !== workoutId));
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
      weightUsed: ex.weight || "0", // Default to planned or "0"
      hasWarmup: ex.hasWarmup || false,
      isWarmupCompleted: false,
      isExerciseCompleted: false,
      restTimes: [],
      isSubstitution: false,
      originalExerciseId: undefined,
      originalExerciseName: undefined,
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

  const updateSessionExercisePerformance = useCallback((sessionId: string, exerciseId: string, updates: Partial<SessionExercisePerformance> & { logNewRestTime?: number }) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const newExercisePerformances = session.exercisePerformances.map(perf => {
            if (perf.exerciseId === exerciseId) {
              let newPerfData = { ...perf };
              const { logNewRestTime, ...otherUpdates } = updates;

              if (typeof logNewRestTime === 'number') {
                const currentRestTimes = newPerfData.restTimes || [];
                const updatedLog = [...currentRestTimes, logNewRestTime];
                if (updatedLog.length > 3) {
                  updatedLog.shift();
                }
                newPerfData.restTimes = updatedLog;
              }
              
              if (updates.restTimes !== undefined) {
                  newPerfData.restTimes = updates.restTimes;
              }
              
              // Apply other direct updates
              newPerfData = { ...newPerfData, ...otherUpdates };
              return newPerfData;
            }
            return perf;
          });
          // If a substitution occurs, the `updates` might include a full new performance object
          // This part will need enhancement for the actual substitution logic in Phase 2
          return { ...session, exercisePerformances: newExercisePerformances };
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

  const getSessionById = (sessionId: string): WorkoutSession | undefined => {
    return sessions.find(s => s.id === sessionId);
  };

  const getLastUsedWeightForExercise = useCallback((workoutId: string, exerciseId: string): string | undefined => {
    const relevantSessions = sessions
      .filter(s => s.workoutId === workoutId && s.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const session of relevantSessions) {
      const performance = session.exercisePerformances.find(p => p.exerciseId === exerciseId && !p.isSubstitution); // Only consider original exercises for last used weight
      if (performance && performance.weightUsed !== undefined) {
        return performance.weightUsed;
      }
    }
    return undefined;
  }, [sessions]);

  const getAverageRestTimeForExercise = useCallback((exerciseId: string, lastNDays: number = 30): number | null => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - lastNDays);

    const allRestTimesForExercise: number[] = [];

    sessions.forEach(session => {
      if (session.isCompleted) {
        const sessionDate = parseISO(session.date);
        if (isWithinInterval(sessionDate, { start: pastDate, end: today })) {
          session.exercisePerformances.forEach(perf => {
            // Consider rest times from both original and substituted exercises if they match the target exerciseId for averaging
            if (perf.exerciseId === exerciseId && perf.restTimes && perf.restTimes.length > 0) {
              perf.restTimes.forEach(time => {
                if (typeof time === 'number' && !isNaN(time)) {
                  allRestTimesForExercise.push(time);
                }
              });
            }
          });
        }
      }
    });

    if (allRestTimesForExercise.length === 0) return null;
    const sum = allRestTimesForExercise.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / allRestTimesForExercise.length);
  }, [sessions]);


  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettingsState(prev => ({
      ...prev,
      ...newSettings,
      defaultRestAlarmSeconds: newSettings.defaultRestAlarmSeconds !== undefined
                               ? Number(newSettings.defaultRestAlarmSeconds)
                               : prev.defaultRestAlarmSeconds
    }));
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
    getSessionById,
    hasActiveSession,
    getLastUsedWeightForExercise,
    getAverageRestTimeForExercise,
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
