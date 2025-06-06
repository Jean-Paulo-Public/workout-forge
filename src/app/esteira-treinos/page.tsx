
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, WorkoutSession } from '@/lib/types';
import { Play, Repeat, Info, AlertTriangle, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays, parseISO, isBefore, startOfToday, isEqual } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";


interface WorkoutWithStatus extends Workout {
  isOverdue?: boolean;
  daysUntilDeadline?: number;
}

export default function TrainingMatPage() {
  const { workouts, sessions, addSession, getWorkoutById } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [displayableWorkouts, setDisplayableWorkouts] = useState<WorkoutWithStatus[]>([]);

  useEffect(() => {
    const today = startOfToday();

    const availableWorkouts = workouts.filter(workout => {
      if (!workout.repeatFrequencyDays || workout.repeatFrequencyDays <= 0) {
        return false; 
      }

      const completedSessions = sessions
        .filter(s => s.workoutId === workout.id && s.isCompleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (completedSessions.length === 0) {
        return true; 
      }

      const lastCompletionDate = startOfToday(parseISO(completedSessions[0].date));
      const nextAvailableDate = addDays(lastCompletionDate, workout.repeatFrequencyDays);
      
      return isEqual(today, nextAvailableDate) || isBefore(nextAvailableDate, today);
    });

    const workoutsWithStatus: WorkoutWithStatus[] = availableWorkouts.map(workout => {
      let isOverdue = false;
      let daysUntilDeadline: number | undefined = undefined;

      if (workout.deadline) {
        const deadlineDate = startOfToday(parseISO(workout.deadline));
        isOverdue = isBefore(deadlineDate, today);
        if (!isOverdue && !isEqual(deadlineDate, today)) { // Consider today as not "until deadline"
          daysUntilDeadline = differenceInDays(deadlineDate, today);
        } else if (isEqual(deadlineDate, today)) {
            daysUntilDeadline = 0; // Deadline is today
        }
      }
      return { ...workout, isOverdue, daysUntilDeadline };
    });

    // Sort workouts
    workoutsWithStatus.sort((a, b) => {
      // 1. Overdue workouts first, sorted by oldest deadline
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isOverdue && b.isOverdue && a.deadline && b.deadline) {
        return differenceInDays(parseISO(a.deadline), parseISO(b.deadline));
      }

      // 2. Workouts with upcoming deadlines (today or future), sorted by closest deadline
      if (a.daysUntilDeadline !== undefined && b.daysUntilDeadline === undefined) return -1;
      if (a.daysUntilDeadline === undefined && b.daysUntilDeadline !== undefined) return 1;
      if (a.daysUntilDeadline !== undefined && b.daysUntilDeadline !== undefined) {
        if (a.daysUntilDeadline === b.daysUntilDeadline) { // If same deadline day, sort by name
          return a.name.localeCompare(b.name);
        }
        return a.daysUntilDeadline - b.daysUntilDeadline;
      }
      
      // 3. Fallback to workout name if no other criteria (or keep original order for same-day no-deadline)
      return a.name.localeCompare(b.name);
    });

    setDisplayableWorkouts(workoutsWithStatus);

  }, [workouts, sessions]);

  const handleStartWorkout = (workoutToStart: Workout) => {
    const currentWorkoutDetails = getWorkoutById(workoutToStart.id);
    if (!currentWorkoutDetails) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar os detalhes do treino para iniciá-lo.",
        variant: "destructive"
      });
      return;
    }
    addSession({
      workoutId: currentWorkoutDetails.id,
      workoutName: currentWorkoutDetails.name,
      date: new Date().toISOString(),
    });
    toast({
      title: "Treino Iniciado!",
      description: `${currentWorkoutDetails.name} foi registrado. Acompanhe seu progresso!`,
    });
    router.push('/progress');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Esteira de Treinos</h1>
        <CardDescription>
          Aqui estão os treinos prontos para serem feitos, considerando sua frequência e datas limite. Treinos com deadline vencido ou próximo aparecem primeiro.
        </CardDescription>

        {displayableWorkouts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Esteira Vazia por Enquanto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Nenhum treino está pronto para ser repetido ou iniciado no momento.
              </p>
              <p className="text-sm text-muted-foreground">
                Certifique-se de que seus treinos na <Link href="/library" className="underline hover:text-primary">biblioteca</Link> tenham uma frequência de repetição e, opcionalmente, uma data limite.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayableWorkouts.map((workout) => (
              <Card 
                key={workout.id} 
                className={cn("flex flex-col", {
                  "border-red-500 ring-2 ring-red-500/50": workout.isOverdue,
                  "border-yellow-500": !workout.isOverdue && workout.daysUntilDeadline !== undefined && workout.daysUntilDeadline <= 2,
                })}
              >
                <CardHeader>
                  <CardTitle className="font-headline flex items-center justify-between">
                    {workout.name}
                    {workout.isOverdue && <AlertTriangle className="h-5 w-5 text-red-500" title="Deadline Vencido!" />}
                    {!workout.isOverdue && workout.daysUntilDeadline !== undefined && workout.daysUntilDeadline <= 2 && (
                       <AlertTriangle className="h-5 w-5 text-yellow-500" title={`Deadline em ${workout.daysUntilDeadline === 0 ? 'Hoje!' : `${workout.daysUntilDeadline} dia(s)!`}`} />
                    )}
                  </CardTitle>
                  {workout.description && (
                    <CardDescription>{workout.description}</CardDescription>
                  )}
                  <div className="space-y-1">
                    {workout.repeatFrequencyDays && (
                      <CardDescription className="text-xs text-muted-foreground flex items-center">
                        <Repeat className="h-3 w-3 mr-1" /> Repetir a cada {workout.repeatFrequencyDays} dia(s)
                      </CardDescription>
                    )}
                    {workout.deadline && (
                       <CardDescription className={cn("text-xs flex items-center", 
                         workout.isOverdue ? "text-red-600 font-medium" : 
                         (!workout.isOverdue && workout.daysUntilDeadline !== undefined && workout.daysUntilDeadline <= 2 ? "text-yellow-600 font-medium" : "text-muted-foreground")
                       )}>
                         <CalendarDays className="h-3 w-3 mr-1" /> Deadline: {format(parseISO(workout.deadline), "dd/MM/yyyy", { locale: ptBR })}
                          {workout.isOverdue && " (Vencido)"}
                          {!workout.isOverdue && workout.daysUntilDeadline !== undefined && (
                            workout.daysUntilDeadline === 0 ? " (Hoje!)" : ` (em ${workout.daysUntilDeadline} dia${workout.daysUntilDeadline === 1 ? '' : 's'})`
                          )}
                       </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <h4 className="font-medium mb-1 text-sm">Exercícios ({workout.exercises.length}):</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                    {workout.exercises.slice(0,2).map((exercise) => (
                      <li key={exercise.id} className="truncate">
                        {exercise.name}
                      </li>
                    ))}
                    {workout.exercises.length > 2 && <li>...e mais {workout.exercises.length - 2}.</li>}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-end">
                  <Button variant="default" size="sm" onClick={() => handleStartWorkout(workout)}>
                    <Play className="mr-1 h-4 w-4" /> Iniciar Agora
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
