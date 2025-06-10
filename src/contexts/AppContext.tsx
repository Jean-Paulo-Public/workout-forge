
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

  const getWorkoutById = useCallback((workoutId: string): Workout | undefined => {
    return workouts.find(w => w.id === workoutId);
  }, [workouts]);

  const getLastUsedWeightForExercise = useCallback((workoutId: string, exerciseId: string): string | undefined => {
    const relevantSessions = sessions
      .filter(s => s.workoutId === workoutId && s.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const session of relevantSessions) {
      const performance = session.exercisePerformances.find(p => p.exerciseId === exerciseId && !p.isSubstitution);
      if (performance && performance.weightUsed !== undefined) {
        return performance.weightUsed;
      }
       // Check if the exerciseId matches an originalExerciseId in a substitution
      const substitutedPerformance = session.exercisePerformances.find(p => p.isSubstitution && p.originalExerciseId === exerciseId);
      if (substitutedPerformance && substitutedPerformance.weightUsed !== undefined) {
        // This might not be what we want if we only care about weight used for the *specific* exercise name/ID
        // For now, we only return weight for direct, non-substituted exercises.
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
            // Match if the performance's current name or original name (if substituted) matches
            const matchesTarget = perf.exerciseName === exerciseIdOrName || 
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
          // Current active session for the updated workout
          const existingPerformancesMap = new Map(session.exercisePerformances.map(p => [p.isSubstitution ? p.originalExerciseId : p.exerciseId, p]));
          const newPerformances: SessionExercisePerformance[] = [];

          fullyUpdatedWorkout.exercises.forEach(planExercise => {
            let perf = existingPerformancesMap.get(planExercise.id);

            if (perf) { // Found an existing performance for this plan exercise ID (either direct or original for a substitution)
              if (perf.isSubstitution && perf.originalExerciseId === planExercise.id) {
                // This is a substitution, update its original details but keep substituted name/ID
                newPerformances.push({
                  ...perf,
                  // originalExerciseName: planExercise.name, // Name of original in plan
                  // Sets/reps for a substitution should reflect the plan for that SLOT
                  sets: planExercise.sets, 
                  reps: planExercise.reps,
                  // Potentially update plannedWeight if the plan changed, but usually not for substitutions
                });
              } else if (!perf.isSubstitution && perf.exerciseId === planExercise.id) {
                // Direct match, update details from plan
                newPerformances.push({
                  ...perf,
                  exerciseName: planExercise.name,
                  plannedWeight: planExercise.weight || "0",
                  hasWarmup: planExercise.hasWarmup || false,
                  sets: planExercise.sets,
                  reps: planExercise.reps,
                  // Retain user's weightUsed, completion status, rest times
                });
              } else {
                // This case should ideally not be hit if map keys are correct
                // Fallback to creating new if logic is flawed
                const lastUsed = getLastUsedWeightForExercise(fullyUpdatedWorkout.id, planExercise.id);
                const avgRest = getAverageRestTimeForExercise(planExercise.id, 30);
                newPerformances.push({
                  exerciseId: planExercise.id, // Use ID from plan
                  exerciseName: planExercise.name,
                  plannedWeight: planExercise.weight || "0",
                  weightUsed: lastUsed || planExercise.weight || "0",
                  hasWarmup: planExercise.hasWarmup || false,
                  isWarmupCompleted: false,
                  isExerciseCompleted: false,
                  restTimes: [],
                  averageRestTimeDisplay: formatSecondsToMMSS(avgRest),
                  isSubstitution: false,
                  originalExerciseId: undefined,
                  originalExerciseName: undefined,
                  sets: planExercise.sets,
                  reps: planExercise.reps,
                });
              }
            } else { // No existing performance for this planExercise.id, create new
              const lastUsed = getLastUsedWeightForExercise(fullyUpdatedWorkout.id, planExercise.id);
              const avgRest = getAverageRestTimeForExercise(planExercise.id, 30);
              newPerformances.push({
                exerciseId: planExercise.id,
                exerciseName: planExercise.name,
                plannedWeight: planExercise.weight || "0",
                weightUsed: lastUsed || planExercise.weight || "0",
                hasWarmup: planExercise.hasWarmup || false,
                isWarmupCompleted: false,
                isExerciseCompleted: false,
                restTimes: [],
                averageRestTimeDisplay: formatSecondsToMMSS(avgRest),
                isSubstitution: false,
                originalExerciseId: undefined,
                originalExerciseName: undefined,
                sets: planExercise.sets,
                reps: planExercise.reps,
              });
            }
          });
          return { ...session, workoutName: fullyUpdatedWorkout.name, exercisePerformances: newPerformances };
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
        sets: ex.sets, 
        reps: ex.reps,  
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
            if (perf.exerciseId === exerciseId) { // Match by current exerciseId (could be original or substituted)
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

              if (updates.restTimes !== undefined) { // Explicitly setting/clearing restTimes array
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
          if (!currentWorkout) {
            console.error("Substitute: Workout not found for session:", session.workoutId);
            return session;
          }

          const performanceToReplace = session.exercisePerformances[performanceIndexToReplace];
          if (!performanceToReplace) {
            console.error("Substitute: Performance to replace not found at index:", performanceIndexToReplace);
            return session;
          }
          
          const planExerciseSlotId = performanceToReplace.isSubstitution
            ? performanceToReplace.originalExerciseId!
            : performanceToReplace.exerciseId;
            
          const originalExerciseInPlan = currentWorkout.exercises.find(ex => ex.id === planExerciseSlotId);

          if (originalExerciseInPlan && originalExerciseInPlan.name === newModelExercise.name) {
            // User selected the same exercise that is originally in the plan for this slot.
            if (performanceToReplace.isSubstitution) {
              // If the current slot IS a substitution, revert it to the original plan exercise.
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
                averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(originalExerciseInPlan.name, 30)), // Use name for avg rest of model/plan
                isSubstitution: false,
                originalExerciseId: undefined,
                originalExerciseName: undefined,
                sets: originalExerciseInPlan.sets,
                reps: originalExerciseInPlan.reps,
              };
              const newPerformances = [...session.exercisePerformances];
              newPerformances[performanceIndexToReplace] = revertedPerformance;
              return { ...session, exercisePerformances: newPerformances };
            } else {
              // If the current slot IS NOT a substitution (it's already the original plan exercise),
              // and the user selected the same one, then no significant change is needed.
              // Optionally, reset its state if desired, but simplest is no change.
              // For now, we return session as is, or ensure the performance has up-to-date plan details if they could drift.
              // To be safe, let's ensure it's a "clean" version of the original plan exercise state if it wasn't a substitution.
               const cleanOriginalPerformance: SessionExercisePerformance = {
                exerciseId: originalExerciseInPlan.id,
                exerciseName: originalExerciseInPlan.name,
                hasWarmup: originalExerciseInPlan.hasWarmup || false,
                isWarmupCompleted: false, // Reset state
                weightUsed: getLastUsedWeightForExercise(currentWorkout.id, originalExerciseInPlan.id) || originalExerciseInPlan.weight || "0", // Reset state
                isExerciseCompleted: false, // Reset state
                plannedWeight: originalExerciseInPlan.weight || "0",
                lastUsedWeight: getLastUsedWeightForExercise(currentWorkout.id, originalExerciseInPlan.id) || "N/A",
                restTimes: [], // Reset state
                averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(originalExerciseInPlan.name, 30)),
                isSubstitution: false,
                originalExerciseId: undefined,
                originalExerciseName: undefined,
                sets: originalExerciseInPlan.sets,
                reps: originalExerciseInPlan.reps,
              };
              const newPerformances = [...session.exercisePerformances];
              newPerformances[performanceIndexToReplace] = cleanOriginalPerformance;
              return { ...session, exercisePerformances: newPerformances };
            }
          }


          // Proceed with actual substitution if newModelExercise is different
          if (!originalExerciseInPlan) {
             console.error("Substitute: Original exercise in plan not found for slot ID:", planExerciseSlotId, "Workout ID:", currentWorkout.id);
             // Fallback: use performanceToReplace's sets/reps if plan exercise is missing (should not happen)
            const fallbackSets = performanceToReplace.sets || userSettings.defaultSets;
            const fallbackReps = performanceToReplace.reps || userSettings.defaultReps;

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
                originalExerciseId: planExerciseSlotId, // ID of the exercise *slot* in the plan
                originalExerciseName: performanceToReplace.isSubstitution ? performanceToReplace.originalExerciseName : performanceToReplace.exerciseName,
                sets: fallbackSets,
                reps: fallbackReps,
            };
            const newPerformances = [...session.exercisePerformances];
            newPerformances[performanceIndexToReplace] = newPerformance;
            return { ...session, exercisePerformances: newPerformances };
          }


          const newPerformance: SessionExercisePerformance = {
            exerciseId: generateId(), 
            exerciseName: newModelExercise.name,
            hasWarmup: determineModelExerciseWarmup(newModelExercise),
            isWarmupCompleted: false,
            weightUsed: newModelExercise.defaultWeight || "0",
            isExerciseCompleted: false,
            plannedWeight: newModelExercise.defaultWeight || "0", // Or copy from originalExerciseInPlan.weight?
            lastUsedWeight: "N/A", 
            restTimes: [],
            averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(newModelExercise.name, 30)),
            isSubstitution: true,
            originalExerciseId: originalExerciseInPlan.id, 
            originalExerciseName: originalExerciseInPlan.name,
            sets: originalExerciseInPlan.sets, 
            reps: originalExerciseInPlan.reps,  
          };

          const newPerformances = [...session.exercisePerformances];
          newPerformances[performanceIndexToReplace] = newPerformance;
          return { ...session, exercisePerformances: newPerformances };
        }
        return session;
      })
    );
  }, [getWorkoutById, getLastUsedWeightForExercise, getAverageRestTimeForExercise, formatSecondsToMMSS, userSettings]);

  const undoSubstituteSessionExercise = useCallback((sessionId: string, performanceIndexToUndo: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const currentWorkout = getWorkoutById(session.workoutId);
          if (!currentWorkout) {
            console.error("Undo Substitute: Workout not found for session:", session.workoutId);
            return session;
          }

          const performanceToUndo = session.exercisePerformances[performanceIndexToUndo];
          if (!performanceToUndo || !performanceToUndo.isSubstitution || !performanceToUndo.originalExerciseId) {
            console.warn("Undo Substitute: Performance is not a substitution or original ID missing.", performanceToUndo);
            return session; 
          }

          const originalExerciseInPlan = currentWorkout.exercises.find(ex => ex.id === performanceToUndo.originalExerciseId);
          if (!originalExerciseInPlan) {
            console.error("Undo Substitute: Original exercise for undo not found in current workout plan:", performanceToUndo.originalExerciseId);
            // Fallback: Revert to a placeholder state based on originalExerciseName if plan version is gone
             const revertedPerformance: SessionExercisePerformance = {
              exerciseId: performanceToUndo.originalExerciseId!, // Still use the ID for consistency
              exerciseName: performanceToUndo.originalExerciseName!,
              hasWarmup: false, // Cannot determine from plan, default
              isWarmupCompleted: false,
              weightUsed: getLastUsedWeightForExercise(currentWorkout.id, performanceToUndo.originalExerciseId!) || "0",
              isExerciseCompleted: false,
              plannedWeight: "0", // Cannot determine from plan
              lastUsedWeight: getLastUsedWeightForExercise(currentWorkout.id, performanceToUndo.originalExerciseId!) || "N/A",
              restTimes: [],
              averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(performanceToUndo.originalExerciseName!, 30)), // Use name
              isSubstitution: false,
              originalExerciseId: undefined,
              originalExerciseName: undefined,
              sets: userSettings.defaultSets, // Fallback
              reps: userSettings.defaultReps,  // Fallback
            };
            const newPerformances = [...session.exercisePerformances];
            newPerformances[performanceIndexToUndo] = revertedPerformance;
            return { ...session, exercisePerformances: newPerformances };
          }

          // Revert to the original exercise from the plan
          const revertedPerformance: SessionExercisePerformance = {
            exerciseId: originalExerciseInPlan.id, // Use ID from plan
            exerciseName: originalExerciseInPlan.name,
            hasWarmup: originalExerciseInPlan.hasWarmup || false,
            isWarmupCompleted: false,
            weightUsed: getLastUsedWeightForExercise(currentWorkout.id, originalExerciseInPlan.id) || originalExerciseInPlan.weight || "0",
            isExerciseCompleted: false,
            plannedWeight: originalExerciseInPlan.weight || "0",
            lastUsedWeight: getLastUsedWeightForExercise(currentWorkout.id, originalExerciseInPlan.id) || "N/A",
            restTimes: [],
            averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(originalExerciseInPlan.name, 30)), // Use name from plan
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

  const getSessionById = useCallback((sessionId: string): WorkoutSession | undefined => {
    return sessions.find(s => s.id === sessionId);
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


    