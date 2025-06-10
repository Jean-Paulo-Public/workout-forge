
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Workout, WorkoutSession, UserSettings, Exercise, SessionExercisePerformance, ModelExercise } from '@/lib/types';
import { parseISO, isWithinInterval } from 'date-fns';
import { determineModelExerciseWarmup } from '@/lib/workout-templates';


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
  substituteSessionExercise: (sessionId: string, performanceIndexToReplace: number, newModelExercise: ModelExercise) => void;
  undoSubstituteSessionExercise: (sessionId: string, performanceIndexToUndo: number) => void;
  markGlobalWarmupAsCompleted: (sessionId: string) => void;
  undoGlobalWarmup: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  getSessionById: (sessionId: string) => WorkoutSession | undefined;
  hasActiveSession: (workoutId: string) => boolean;
  getLastUsedWeightForExercise: (workoutId: string, exerciseId: string) => string | undefined;
  getAverageRestTimeForExercise: (exerciseIdOrName: string, lastNDays?: number) => number | null;


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

  const getWorkoutById = (workoutId: string): Workout | undefined => {
    return workouts.find(w => w.id === workoutId);
  };

  const getLastUsedWeightForExercise = useCallback((workoutId: string, exerciseId: string): string | undefined => {
    const relevantSessions = sessions
      .filter(s => s.workoutId === workoutId && s.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const session of relevantSessions) {
      const performance = session.exercisePerformances.find(p => p.exerciseId === exerciseId && !p.isSubstitution);
      if (performance && performance.weightUsed !== undefined) {
        return performance.weightUsed;
      }
    }
    return undefined;
  }, [sessions]);

  const formatSecondsToMMSS = useCallback((totalSeconds: number | undefined | null): string => {
    if (totalSeconds === undefined || totalSeconds === null || isNaN(totalSeconds)) return 'N/A';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);
  
  const getAverageRestTimeForExercise = useCallback((exerciseIdOrName: string, lastNDays: number = 30): number | null => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - lastNDays);

    const allRestTimesForExercise: number[] = [];

    sessions.forEach(session => {
      if (session.isCompleted) {
        const sessionDate = parseISO(session.date);
        if (isWithinInterval(sessionDate, { start: pastDate, end: today })) {
          session.exercisePerformances.forEach(perf => {
            const matchesTarget = perf.exerciseId === exerciseIdOrName ||
                                  perf.exerciseName === exerciseIdOrName ||
                                  (perf.isSubstitution && perf.originalExerciseName === exerciseIdOrName);

            if (matchesTarget && perf.restTimes && perf.restTimes.length > 0) {
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
            const existingPerf = session.exercisePerformances.find(p =>
              p.exerciseId === exerciseFromWorkout.id || 
              (p.isSubstitution && p.originalExerciseId === exerciseFromWorkout.id) 
            );

            if (existingPerf) {
              if (existingPerf.isSubstitution && existingPerf.originalExerciseId === exerciseFromWorkout.id) {
                return {
                  ...existingPerf,
                  originalExerciseName: exerciseFromWorkout.name, 
                  sets: exerciseFromWorkout.sets, // Reflect plan's sets
                  reps: exerciseFromWorkout.reps, // Reflect plan's reps
                };
              } else if (!existingPerf.isSubstitution && existingPerf.exerciseId === exerciseFromWorkout.id) {
                return {
                  ...existingPerf,
                  exerciseName: exerciseFromWorkout.name,
                  plannedWeight: exerciseFromWorkout.weight || "0",
                  hasWarmup: exerciseFromWorkout.hasWarmup || false,
                  sets: exerciseFromWorkout.sets,
                  reps: exerciseFromWorkout.reps,
                };
              }
              // If existingPerf is a substitution for a *different* original exercise, or some other case,
              // it won't match above, so we need a fallback or decide how to handle it.
              // For now, if it's not directly matched or a substitution for *this* plan slot,
              // we create a new one. This handles cases where an exercise was replaced by another
              // in the builder, and then that new exercise in the plan is now being processed.
            }
            // New exercise added to the plan or non-matching existing performance, create new.
            const lastUsed = getLastUsedWeightForExercise(fullyUpdatedWorkout.id, exerciseFromWorkout.id);
            const avgRest = getAverageRestTimeForExercise(exerciseFromWorkout.id, 30);
            return {
              exerciseId: exerciseFromWorkout.id,
              exerciseName: exerciseFromWorkout.name,
              plannedWeight: exerciseFromWorkout.weight || "0",
              weightUsed: lastUsed || exerciseFromWorkout.weight || "0",
              hasWarmup: exerciseFromWorkout.hasWarmup || false,
              isWarmupCompleted: false,
              isExerciseCompleted: false,
              restTimes: [],
              averageRestTimeDisplay: formatSecondsToMMSS(avgRest),
              isSubstitution: false,
              originalExerciseId: undefined,
              originalExerciseName: undefined,
              sets: exerciseFromWorkout.sets,
              reps: exerciseFromWorkout.reps,
            };
          });

          // Ensure the order of performances matches the order of exercises in the updated workout plan
          const orderedPerformances: SessionExercisePerformance[] = [];
          fullyUpdatedWorkout.exercises.forEach(planExercise => {
            const foundPerf = newExercisePerformances.find(p => p.exerciseId === planExercise.id); // Direct match only for ordering based on current plan
            if (foundPerf) {
              orderedPerformances.push(foundPerf);
            }
          });

          return { ...session, workoutName: fullyUpdatedWorkout.name, exercisePerformances: orderedPerformances };
        }
        return session;
      })
    );
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
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

    const initialExercisePerformances: SessionExercisePerformance[] = workout.exercises.map(ex => {
      const lastUsed = getLastUsedWeightForExercise(workout.id, ex.id);
      const avgRest = getAverageRestTimeForExercise(ex.id, 30);
      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        plannedWeight: ex.weight || "0",
        weightUsed: lastUsed || ex.weight || "0",
        hasWarmup: ex.hasWarmup || false,
        isWarmupCompleted: false,
        isExerciseCompleted: false,
        restTimes: [],
        averageRestTimeDisplay: formatSecondsToMMSS(avgRest),
        isSubstitution: false,
        originalExerciseId: undefined,
        originalExerciseName: undefined,
        sets: ex.sets, // Include from plan
        reps: ex.reps,  // Include from plan
      };
    });

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

              newPerfData = { ...newPerfData, ...otherUpdates };
              return newPerfData;
            }
            return perf;
          });
          return { ...session, exercisePerformances: newExercisePerformances };
        }
        return session;
      })
    );
  }, []);

  const substituteSessionExercise = useCallback((sessionId: string, performanceIndexToReplace: number, newModelExercise: ModelExercise) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const currentWorkout = getWorkoutById(session.workoutId);
          if (!currentWorkout) return session; 

          const performanceToReplace = session.exercisePerformances[performanceIndexToReplace];
          if (!performanceToReplace) return session;

          const planExerciseId = performanceToReplace.isSubstitution
            ? performanceToReplace.originalExerciseId!
            : performanceToReplace.exerciseId;

          const originalWorkoutExercise = currentWorkout.exercises.find(ex => ex.id === planExerciseId);
          if (!originalWorkoutExercise) {
            console.error("Original exercise in plan not found for substitution, slot:", planExerciseId);
            return session; 
          }

          const newPerformance: SessionExercisePerformance = {
            exerciseId: generateId(), 
            exerciseName: newModelExercise.name,
            hasWarmup: determineModelExerciseWarmup(newModelExercise),
            isWarmupCompleted: false,
            weightUsed: newModelExercise.defaultWeight || "0",
            isExerciseCompleted: false,
            plannedWeight: newModelExercise.defaultWeight || "0",
            lastUsedWeight: "N/A", 
            restTimes: [],
            averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(newModelExercise.name, 30)),
            isSubstitution: true,
            originalExerciseId: planExerciseId,
            originalExerciseName: originalWorkoutExercise.name,
            sets: originalWorkoutExercise.sets,
            reps: originalWorkoutExercise.reps,
          };

          const newPerformances = [...session.exercisePerformances];
          newPerformances[performanceIndexToReplace] = newPerformance;
          return { ...session, exercisePerformances: newPerformances };
        }
        return session;
      })
    );
  }, [getWorkoutById, getAverageRestTimeForExercise, formatSecondsToMMSS]);

  const undoSubstituteSessionExercise = useCallback((sessionId: string, performanceIndexToUndo: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const currentWorkout = getWorkoutById(session.workoutId);
          if (!currentWorkout) return session;

          const performanceToUndo = session.exercisePerformances[performanceIndexToUndo];
          if (!performanceToUndo || !performanceToUndo.isSubstitution || !performanceToUndo.originalExerciseId) {
            return session; 
          }

          const originalExerciseInPlan = currentWorkout.exercises.find(ex => ex.id === performanceToUndo.originalExerciseId);
          if (!originalExerciseInPlan) {
            console.error("Original exercise for undo not found in current workout plan:", performanceToUndo.originalExerciseId);
             const revertedPerformance: SessionExercisePerformance = {
              exerciseId: performanceToUndo.originalExerciseId!,
              exerciseName: performanceToUndo.originalExerciseName!,
              hasWarmup: false, 
              isWarmupCompleted: false,
              weightUsed: getLastUsedWeightForExercise(currentWorkout.id, performanceToUndo.originalExerciseId!) || "0",
              isExerciseCompleted: false,
              plannedWeight: "0", 
              lastUsedWeight: getLastUsedWeightForExercise(currentWorkout.id, performanceToUndo.originalExerciseId!) || "N/A",
              restTimes: [],
              averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(performanceToUndo.originalExerciseId!, 30)),
              isSubstitution: false,
              originalExerciseId: undefined,
              originalExerciseName: undefined,
              sets: userSettings.defaultSets, 
              reps: userSettings.defaultReps,  
            };
            const newPerformances = [...session.exercisePerformances];
            newPerformances[performanceIndexToUndo] = revertedPerformance;
            return { ...session, exercisePerformances: newPerformances };
          }

          const revertedPerformance: SessionExercisePerformance = {
            exerciseId: originalExerciseInPlan.id,
            exerciseName: originalExerciseInPlan.name,
            hasWarmup: originalExerciseInPlan.hasWarmup || false,
            isWarmupCompleted: false,
            weightUsed: getLastUsedWeightForExercise(currentWorkout.id, originalExerciseInPlan.id) || originalExerciseInPlan.weight || "0",
            isExerciseCompleted: false,
            plannedWeight: originalExerciseInPlan.weight || "0",
            lastUsedWeight: getLastUsedWeightForExercise(currentWorkout.id, originalExerciseInPlan.id) || "N/A",
            restTimes: [],
            averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(originalExerciseInPlan.id, 30)),
            isSubstitution: false,
            originalExerciseId: undefined,
            originalExerciseName: undefined,
            sets: originalExerciseInPlan.sets,
            reps: originalExerciseInPlan.reps,
          };

          const newPerformances = [...session.exercisePerformances];
          newPerformances[performanceIndexToUndo] = revertedPerformance;
          return { ...session, exercisePerformances: newPerformances };
        }
        return session;
      })
    );
  }, [getWorkoutById, getLastUsedWeightForExercise, getAverageRestTimeForExercise, formatSecondsToMMSS, userSettings]);


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
    substituteSessionExercise,
    undoSubstituteSessionExercise,
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
