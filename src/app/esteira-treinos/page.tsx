
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout } from '@/lib/types';
import { Play, Repeat, Info, AlertTriangle, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays, parseISO, isBefore, startOfToday, isEqual, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";


interface WorkoutWithStatus extends Workout {
  isOverdue?: boolean;
  daysUntilDeadline?: number;
  isTodayDeadline?: boolean;
}

export default function TrainingMatPage() {
  const { workouts, sessions, addSession, getWorkoutById } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [displayableWorkouts, setDisplayableWorkouts] = useState<WorkoutWithStatus[]>([]);

  useEffect(() => {
    const today = startOfToday();

    const availableWorkouts = workouts.filter(workout => {
      const completedSessionsForThisWorkout = sessions.filter(s => s.workoutId === workout.id && s.isCompleted);

      if (workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0 && completedSessionsForThisWorkout.length === 0) {
        return true; // Available if has frequency and never done
      }
      if (workout.deadline && completedSessionsForThisWorkout.length === 0) {
         return true; // Available if has deadline and never done
      }


      if (!workout.repeatFrequencyDays || workout.repeatFrequencyDays <= 0) {
        return !!workout.deadline;
      }

      const completedSessionsSorted = sessions
        .filter(s => s.workoutId === workout.id && s.isCompleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (completedSessionsSorted.length === 0) { // Has frequency but never done (already covered, but good for clarity)
        return true;
      }

      const lastCompletionDate = startOfToday(parseISO(completedSessionsSorted[0].date));
      const nextAvailableDate = addDays(lastCompletionDate, workout.repeatFrequencyDays as number);

      return isEqual(today, nextAvailableDate) || isBefore(nextAvailableDate, today);
    });

    const workoutsWithStatus: WorkoutWithStatus[] = availableWorkouts.map(workout => {
      let isOverdue = false;
      let daysUntilDeadline: number | undefined = undefined;
      let isTodayDeadline = false;

      if (workout.deadline) {
        const deadlineDate = startOfToday(parseISO(workout.deadline));
        isOverdue = isBefore(deadlineDate, today);
        daysUntilDeadline = differenceInDays(deadlineDate, today); // dateLeft - dateRight
        isTodayDeadline = isToday(deadlineDate);
      }
      return { ...workout, isOverdue, daysUntilDeadline, isTodayDeadline };
    });

    workoutsWithStatus.sort((a, b) => {
      // 1. Overdue workouts first (sorted by oldest deadline)
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isOverdue && b.isOverdue) {
        return (a.daysUntilDeadline ?? -Infinity) - (b.daysUntilDeadline ?? -Infinity); // more negative is older
      }

      // 2. Workouts with deadline today
      if (a.isTodayDeadline && !b.isTodayDeadline) return -1;
      if (!a.isTodayDeadline && b.isTodayDeadline) return 1;
      if (a.isTodayDeadline && b.isTodayDeadline) { // If both today, sort by name
        return a.name.localeCompare(b.name);
      }

      // 3. Workouts with deadline tomorrow (daysUntilDeadline === 1)
      const aIsTomorrow = !a.isOverdue && !a.isTodayDeadline && a.daysUntilDeadline === 1;
      const bIsTomorrow = !b.isOverdue && !b.isTodayDeadline && b.daysUntilDeadline === 1;
      if (aIsTomorrow && !bIsTomorrow) return -1;
      if (!aIsTomorrow && bIsTomorrow) return 1;
      if (aIsTomorrow && bIsTomorrow) { // If both tomorrow, sort by name
         return a.name.localeCompare(b.name);
      }
      
      // 4. Other workouts with deadlines (sorted by closest deadline)
      if (a.daysUntilDeadline !== undefined && b.daysUntilDeadline === undefined) return -1;
      if (a.daysUntilDeadline === undefined && b.daysUntilDeadline !== undefined) return 1;
      if (a.daysUntilDeadline !== undefined && b.daysUntilDeadline !== undefined) {
        if (a.daysUntilDeadline === b.daysUntilDeadline) {
            return a.name.localeCompare(b.name);
        }
        return a.daysUntilDeadline - b.daysUntilDeadline;
      }
      
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
          Aqui estão os treinos prontos para serem feitos, considerando sua frequência e datas limite.
          Treinos com deadline vencido, hoje, ou amanhã aparecem primeiro e destacados.
          Treinos com frequência definida e nunca realizados também são listados.
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
                Nenhum treino está pronto para ser repetido, não há treinos com deadline definidos para hoje/amanhã/vencidos,
                ou todos os treinos com deadline e frequência já foram concluídos e aguardam o próximo ciclo.
              </p>
              <p className="text-sm text-muted-foreground">
                Certifique-se de que seus treinos na <Link href="/library" className="underline hover:text-primary">biblioteca</Link> tenham uma frequência de repetição e/ou uma data limite.
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
                  "border-orange-500 ring-2 ring-orange-500/50": !workout.isOverdue && workout.isTodayDeadline,
                  "border-yellow-500 ring-2 ring-yellow-500/50": !workout.isOverdue && !workout.isTodayDeadline && workout.daysUntilDeadline === 1,
                })}
              >
                <CardHeader>
                  <CardTitle className="font-headline flex items-center justify-between">
                    {workout.name}
                    {workout.isOverdue && <AlertTriangle className="h-5 w-5 text-red-500" title="Deadline Vencido!" />}
                    {!workout.isOverdue && workout.isTodayDeadline && <AlertTriangle className="h-5 w-5 text-orange-500" title="Deadline Hoje!" />}
                    {!workout.isOverdue && !workout.isTodayDeadline && workout.daysUntilDeadline === 1 && <AlertTriangle className="h-5 w-5 text-yellow-500" title="Deadline Amanhã!" />}
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
                         (!workout.isOverdue && workout.isTodayDeadline ? "text-orange-600 font-medium" :
                         (!workout.isOverdue && !workout.isTodayDeadline && workout.daysUntilDeadline === 1 ? "text-yellow-600 font-medium" : "text-muted-foreground"))
                       )}>
                         <CalendarDays className="h-3 w-3 mr-1" /> Deadline: {format(parseISO(workout.deadline), "dd/MM/yyyy", { locale: ptBR })}
                         {workout.isOverdue ? " (Vencido)"
                           : workout.isTodayDeadline ? " (Hoje!)"
                           : workout.daysUntilDeadline === 1 ? " (Amanhã!)"
                           : (workout.daysUntilDeadline !== undefined && workout.daysUntilDeadline > 1) ? ` (em ${workout.daysUntilDeadline} dias)`
                           : (workout.daysUntilDeadline !== undefined && workout.daysUntilDeadline < 0) ? "" // Should be covered by isOverdue
                           : ""}
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
